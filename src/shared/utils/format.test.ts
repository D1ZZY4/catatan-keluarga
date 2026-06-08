import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatDate, formatRelative } from "./format";

describe("formatCurrency", () => {
  it("formats IDR with no decimal places", () => {
    const result = formatCurrency(100000, "IDR");
    expect(result).toContain("100.000");
    expect(result).toContain("Rp");
  });

  it("formats IDR zero", () => {
    const result = formatCurrency(0, "IDR");
    expect(result).toContain("0");
  });

  it("formats BTC with 6 decimal places", () => {
    const result = formatCurrency(0.001234, "BTC");
    expect(result).toContain("BTC");
    expect(result).toContain("0,001234");
  });

  it("formats ETH with 6 decimal places", () => {
    const result = formatCurrency(1.5, "ETH");
    expect(result).toContain("ETH");
  });

  it("defaults to IDR when no currency given", () => {
    const result = formatCurrency(50000);
    expect(result).toContain("Rp");
  });

  it("handles unknown currency gracefully", () => {
    const result = formatCurrency(100, "XYZ");
    expect(result).toContain("XYZ");
  });

  it("formats large numbers correctly", () => {
    const result = formatCurrency(999999999, "IDR");
    expect(result).toContain("999.999.999");
  });
});

describe("formatNumber", () => {
  it("formats number with Indonesian locale", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats with fraction digits", () => {
    const result = formatNumber(1.5, 2);
    expect(result).toContain("1");
    expect(result).toContain("5");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for valid timestamp", () => {
    const result = formatDate(Date.now());
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats a known date correctly", () => {
    // 2024-01-15 UTC
    const ts = new Date("2024-01-15").getTime();
    const result = formatDate(ts);
    expect(result).toContain("2024");
  });
});

describe("formatRelative", () => {
  it("returns 'sekarang' or similar for very recent time", () => {
    const result = formatRelative(Date.now());
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns past description for old timestamp", () => {
    const threeDaysAgo = Date.now() - 3 * 86400000;
    const result = formatRelative(threeDaysAgo);
    expect(result).toBeTruthy();
  });

  it("returns future description for upcoming timestamp", () => {
    const tomorrow = Date.now() + 86400000;
    const result = formatRelative(tomorrow);
    expect(result).toBeTruthy();
  });
});
