import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContactPayload } from "../lib/contact";

const payload: ContactPayload = {
  firstName: "Jane",
  lastName: "Perera",
  email: "jane@company.com",
  category: "Web app",
  message: "Hello",
  website: "",
};

/** lib/api reads NEXT_PUBLIC_API_URL when it loads, so load a fresh copy per test. */
async function load(apiUrl = "https://api.example.com/") {
  vi.stubEnv("NEXT_PUBLIC_API_URL", apiUrl);
  vi.resetModules();
  return import("../lib/contact");
}

const reply = (status: number, body: unknown) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sendContactMessage", () => {
  it("posts the message as JSON to the API", async () => {
    const { sendContactMessage } = await load();
    const fetchMock = reply(200, { ok: true });
    await sendContactMessage(payload, fetchMock);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.example.com/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(payload);
  });

  it("points at the field the API rejected", async () => {
    const { sendContactMessage } = await load();
    const fetchMock = reply(422, { detail: [{ loc: ["body", "email"], msg: "String should match pattern" }] });
    await expect(sendContactMessage(payload, fetchMock)).rejects.toMatchObject({ field: "email" });
  });

  it("shows the API's own message for rate limits and send failures", async () => {
    const { sendContactMessage } = await load();
    const limited = reply(429, { detail: "You have sent a few messages already. Try again in an hour." });
    await expect(sendContactMessage(payload, limited)).rejects.toThrow("Try again in an hour.");
    const failed = reply(502, { detail: "Your message could not be sent. Try again shortly." });
    await expect(sendContactMessage(payload, failed)).rejects.toThrow("could not be sent");
  });

  it("explains a network failure", async () => {
    const { sendContactMessage } = await load();
    const offline = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(sendContactMessage(payload, offline)).rejects.toThrow("Cannot reach the server");
  });

  it("refuses to send without an API URL", async () => {
    const { sendContactMessage } = await load("");
    const fetchMock = reply(200, { ok: true });
    await expect(sendContactMessage(payload, fetchMock)).rejects.toThrow("not connected");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("contactError", () => {
  it("falls back to a generic message for unexpected bodies", async () => {
    const { contactError } = await load();
    expect(contactError(500, null).message).toBe("Your message could not be sent. Try again shortly.");
    expect(contactError(422, { detail: [{ loc: ["body", "message"] }] }).field).toBeNull();
  });
});
