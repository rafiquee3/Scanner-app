export interface Product {
  id?: string;
  name: string;
  price: number | string;
  category: string;
}

/**
 * Calculates the total sum of products, handling both string and number prices.
 */
export function calculateTotal(items: Product[]): string {
  const total = items.reduce((acc, val) => {
    const price = typeof val.price === "string" ? parseFloat(val.price) : val.price;
    return acc + (price || 0);
  }, 0);
  return total.toFixed(2);
}

/**
 * Groups products by category and calculates totals for each.
 */
export function groupByCategory(items: Product[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "Other";
    const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    acc[cat] = (acc[cat] || 0) + (price || 0);
    return acc;
  }, {});
}

/**
 * Cleans the raw response from Gemini AI and parses it to JSON.
 */
export function parseGeminiResponse(rawText: string): any {
  if (!rawText) return [];
  const jsonString = rawText.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", err);
    return { error: "Invalid JSON format from AI" };
  }
}
