import { describe, it, expect } from "vitest";
import {
  calculateTotal,
  groupByCategory,
  parseGeminiResponse,
  formatDate,
} from "@/src/utils/receipt-utils";

describe("receipt-utils", () => {
  describe("calculateTotal", () => {
    it("sums numbers correctly", () => {
      const items = [
        { name: "A", price: 10.5, category: "Other" },
        { name: "B", price: 5.25, category: "Other" },
      ];
      expect(calculateTotal(items)).toBe("15.75");
    });

    it("handles string prices from inputs", () => {
      const items = [
        { name: "A", price: "10.50", category: "Other" },
        { name: "B", price: "5.25", category: "Other" },
      ];
      expect(calculateTotal(items)).toBe("15.75");
    });

    it("handles invalid numbers gracefully", () => {
      const items = [
        { name: "A", price: "invalid", category: "Other" },
        { name: "B", price: 10, category: "Other" },
      ];
      expect(calculateTotal(items)).toBe("10.00");
    });
  });

  describe("groupByCategory", () => {
    it("groups items correctly", () => {
      const items = [
        { name: "Milk", price: 2, category: "Drinks" },
        { name: "Water", price: 1, category: "Drinks" },
        { name: "Apple", price: 3, category: "Fruit" },
      ];
      const result = groupByCategory(items);
      expect(result["Drinks"]).toBe(3);
      expect(result["Fruit"]).toBe(3);
    });
  });

  describe("parseGeminiResponse", () => {
    it("removes markdown code blocks", () => {
      const raw = '```json\n[{"name": "Milk", "price": 2}]\n```';
      const result = parseGeminiResponse(raw);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Milk");
    });

    it("handles raw JSON without markdown", () => {
      const raw = '[{"name": "Milk", "price": 2}]';
      const result = parseGeminiResponse(raw);
      expect(result[0].name).toBe("Milk");
    });

    it("returns error object on invalid JSON", () => {
      const raw = "this is not json";
      const result = parseGeminiResponse(raw);
      expect(result).toHaveProperty("error");
    });
  });

  describe("formatDate", () => {
    it("formats valid ISO dates", () => {
      expect(formatDate("2024-03-03")).toBe("2024-03-03");
    });

    it("formats human readable dates", () => {
      expect(formatDate("2024-03-03T00:00:00Z")).toBe("2024-03-03");
    });

    it("returns null for invalid dates", () => {
      expect(formatDate("not-a-date")).toBeNull();
    });

    it("returns null for empty/null input", () => {
      expect(formatDate("")).toBeNull();
      expect(formatDate(null as any)).toBeNull();
    });
  });
});
