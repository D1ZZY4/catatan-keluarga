import { describe, it, expect } from "vitest";
import { cn } from "./misc";

describe("cn (class merge utility)", () => {
  it("merges two class strings", () => {
    expect(cn("text-red-500", "bg-blue-500")).toContain("text-red-500");
    expect(cn("text-red-500", "bg-blue-500")).toContain("bg-blue-500");
  });

  it("concatenates multiple class strings with a space", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-red-500 text-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("handles falsy values gracefully", () => {
    const result = cn("base-class", false, null, undefined, "");
    expect(result).toBe("base-class");
  });

  it("returns empty string when all args are falsy", () => {
    const result = cn(false, null, undefined);
    expect(result).toBe("");
  });
});
