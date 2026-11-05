import { afterEach, describe, expect, it, vi } from "vitest";

import { placeholder, placeholders, sectionImages } from "../lib/placeholders";

const hero = "https://res.cloudinary.com/demo/image/upload/v1/site/hero.png";
const about = "https://res.cloudinary.com/demo/image/upload/v2/site/about.png";

function respond(body: Uint8Array<ArrayBuffer>, ok = true) {
  return vi.fn(async () => new Response(ok ? body : null, { status: ok ? 200 : 404 }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("blurred previews", () => {
  it("inlines a tiny JPEG as a data URL and caches it for good", async () => {
    const fetch = respond(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    vi.stubGlobal("fetch", fetch);
    expect(await placeholder(hero)).toBe("data:image/jpeg;base64,/9j/2Q==");
    expect(fetch).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/image/upload/f_jpg,q_60,w_32/v1/site/hero.png",
      expect.objectContaining({ next: { revalidate: false } }),
    );
  });

  it("gives up quietly: other hosts, errors, failures and oversized replies", async () => {
    vi.stubGlobal("fetch", respond(new Uint8Array([1])));
    expect(await placeholder("/images/placeholders/a.jpg")).toBeNull();
    expect(await placeholder(null)).toBeNull();

    vi.stubGlobal("fetch", respond(new Uint8Array([1]), false));
    expect(await placeholder(hero)).toBeNull();

    vi.stubGlobal("fetch", respond(new Uint8Array(5_000)));
    expect(await placeholder(hero)).toBeNull();

    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    expect(await placeholder(hero)).toBeNull();
  });

  it("maps each distinct image once and leaves out the ones without a preview", async () => {
    const fetch = respond(new Uint8Array([7]));
    vi.stubGlobal("fetch", fetch);
    const map = await placeholders([hero, hero, "/local.jpg", undefined, about]);
    expect(Object.keys(map)).toEqual([hero, about]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("collects the image of every section", () => {
    expect(
      sectionImages({ "home.hero": { image: hero }, site: { name: "x" }, "page.about": { image: about }, empty: null }),
    ).toEqual([hero, about]);
  });
});
