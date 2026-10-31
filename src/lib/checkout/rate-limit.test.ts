import { describe, expect, it } from "vitest";
import { clientIpFromHeaders } from "@/lib/checkout/rate-limit";

describe("clientIpFromHeaders", () => {
  it("prefers x-real-ip", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.1, 203.0.113.10",
    });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("uses the trusted rightmost x-forwarded-for hop", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.1, 203.0.113.20",
    });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.20");
  });
});
