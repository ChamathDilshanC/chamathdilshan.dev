import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";
import { proxy } from "@/proxy";

describe("security response headers", () => {
  it("defines a nonce-authorized deny-by-default content security policy", () => {
    const policy = contentSecurityPolicy("test-nonce");

    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain("style-src 'self' 'nonce-test-nonce'");
    expect(policy).toContain("style-src-elem 'self' 'unsafe-inline'");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("frame-src https://www.youtube-nocookie.com");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("connect-src 'self' https://api.chamathdilshan.com");
    expect(policy).not.toContain("script-src 'unsafe-inline'");
    expect(policy).not.toContain("script-src 'unsafe-eval'");
    expect(policy).not.toContain("style-src 'unsafe-inline'");
    expect(policy).not.toContain("report-only");
    expect(policy.split("; ").filter(Boolean)).toHaveLength(
      new Set(policy.split("; ").filter(Boolean)).size,
    );
  });

  it("preserves legacy and baseline security protections", () => {
    const headers = new Map(securityHeaders.map(({ key, value }) => [key, value]));

    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains");
    expect(headers.has("Permissions-Policy")).toBe(true);
    expect(headers.size).toBe(securityHeaders.length);
  });

  it("generates a fresh nonce for each proxied document request", () => {
    const first = proxy(new NextRequest("https://example.test/"));
    const second = proxy(new NextRequest("https://example.test/"));
    const firstPolicy = first.headers.get("Content-Security-Policy") ?? "";
    const secondPolicy = second.headers.get("Content-Security-Policy") ?? "";

    expect(firstPolicy).not.toBe(secondPolicy);
    expect(firstPolicy).toMatch(/script-src 'self' 'nonce-[^']+'/);
    expect(first.headers.get("x-middleware-next")).toBe("1");
  });
});
