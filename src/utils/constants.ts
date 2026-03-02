export const CATEGORIES = [
  "Meat",
  "Fish & Seafood",
  "Fruits",
  "Vegetables",
  "Drinks",
  "Other Food",
  "Household",
  "Alcohol",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Meat: "bg-red-100 text-red-700",
  "Fish & Seafood": "bg-cyan-100 text-cyan-700",
  Fruits: "bg-orange-100 text-orange-700",
  Vegetables: "bg-green-100 text-green-700",
  Drinks: "bg-blue-100 text-blue-700",
  "Other Food": "bg-yellow-100 text-yellow-700",
  Household: "bg-purple-100 text-purple-700",
  Alcohol: "bg-pink-100 text-pink-700",
  Other: "bg-gray-100 text-gray-700",
};

export const CATEGORY_BORDER_COLORS: Record<string, string> = {
  Meat: "border-l-red-500",
  "Fish & Seafood": "border-l-cyan-500",
  Fruits: "border-l-orange-500",
  Vegetables: "border-l-green-500",
  Drinks: "border-l-blue-500",
  "Other Food": "border-l-yellow-500",
  Household: "border-l-purple-500",
  Alcohol: "border-l-pink-500",
  Other: "border-l-gray-400",
};

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;
