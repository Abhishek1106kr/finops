import { describe, it, expect } from "vitest";
import { cn } from "../utils/cn";

describe("Frontend Composable & Utility Suite", () => {
  it("cn utility - merges Tailwind classes and handles conditional class inputs", () => {
    const result = cn("bg-pastel-lavender text-carbon-900", true && "rounded-full", false && "hidden");
    expect(result).toContain("bg-pastel-lavender");
    expect(result).toContain("text-carbon-900");
    expect(result).toContain("rounded-full");
    expect(result).not.toContain("hidden");
  });

  it("currency formatter helper - formats Indian Rupee amounts correctly", () => {
    const amount = 145000;
    const formatted = amount.toLocaleString("en-IN");
    expect(formatted).toBe("1,45,000");
  });

  it("risk score badge helper - evaluates threshold color mapping correctly", () => {
    const getRiskVariant = (score: number) => {
      if (score >= 0.7) return "error";
      if (score >= 0.2) return "warning";
      return "success";
    };

    expect(getRiskVariant(0.02)).toBe("success");
    expect(getRiskVariant(0.35)).toBe("warning");
    expect(getRiskVariant(0.85)).toBe("error");
  });
});
