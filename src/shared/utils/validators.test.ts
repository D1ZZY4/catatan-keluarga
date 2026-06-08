import { describe, it, expect } from "vitest";

// Inline validation helpers (mirrors what forms use internally)
function isValidAmount(value: string): boolean {
  const n = parseFloat(value.replace(/,/g, "."));
  return !isNaN(n) && n > 0 && isFinite(n);
}

function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

function isValidName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 40;
}

describe("Amount validation", () => {
  it("accepts positive numbers", () => {
    expect(isValidAmount("100000")).toBe(true);
    expect(isValidAmount("0.5")).toBe(true);
    expect(isValidAmount("999999999")).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidAmount("0")).toBe(false);
  });

  it("rejects negative", () => {
    expect(isValidAmount("-100")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAmount("")).toBe(false);
  });

  it("rejects non-numeric", () => {
    expect(isValidAmount("abc")).toBe(false);
  });
});

describe("PIN validation", () => {
  it("accepts 4-digit PIN", () => {
    expect(isValidPin("1234")).toBe(true);
  });

  it("accepts 8-digit PIN", () => {
    expect(isValidPin("12345678")).toBe(true);
  });

  it("rejects 3-digit PIN", () => {
    expect(isValidPin("123")).toBe(false);
  });

  it("rejects 9-digit PIN", () => {
    expect(isValidPin("123456789")).toBe(false);
  });

  it("rejects non-numeric PIN", () => {
    expect(isValidPin("abcd")).toBe(false);
  });

  it("rejects PIN with letters mixed in", () => {
    expect(isValidPin("12a4")).toBe(false);
  });
});

describe("Name validation", () => {
  it("accepts valid names", () => {
    expect(isValidName("Budi Santoso")).toBe(true);
    expect(isValidName("A")).toBe(true);
  });

  it("rejects empty name", () => {
    expect(isValidName("")).toBe(false);
    expect(isValidName("   ")).toBe(false);
  });

  it("rejects very long name", () => {
    expect(isValidName("A".repeat(41))).toBe(false);
  });

  it("accepts name at max length", () => {
    expect(isValidName("A".repeat(40))).toBe(true);
  });
});
