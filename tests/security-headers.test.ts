import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

describe("security response headers", () => {
  it("defines one complete, enforced content security policy", () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("connect-src 'self' https://api.chamathdilshan.com");
    expect(contentSecurityPolicy).not.toContain("script-src *");
    expect(contentSecurityPolicy).not.toContain("script-src 'unsafe-eval'");
    expect(contentSecurityPolicy).not.toContain("report-only");
    expect(contentSecurityPolicy.split("; ").filter(Boolean)).toHaveLength(
      new Set(contentSecurityPolicy.split("; ").filter(Boolean)).size,
    );
  });

  it("preserves legacy and baseline security protections", () => {
    const headers = new Map(securityHeaders.map(({ key, value }) => [key, value]));

    expect(headers.get("Content-Security-Policy")).toBe(contentSecurityPolicy);
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains");
    expect(headers.has("Permissions-Policy")).toBe(true);
    expect(headers.size).toBe(securityHeaders.length);
  });
});
