"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_BORDER_COLORS,
} from "@/src/utils/constants";
import { calculateTotal, groupByCategory, Product } from "@/src/utils/receipt-utils";

interface ReceiptEditorProps {
  items: Product[];
  date: string | null;
  onUpdateItem: (index: number, field: string, value: string) => void;
  onDeleteItem: (index: number) => void;
  onSave?: () => void;
  onClearAll?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export default function ReceiptEditor({
  items,
  date,
  onUpdateItem,
  onDeleteItem,
  onSave,
  onClearAll,
  isSaving = false,
  saveLabel = "Save",
}: ReceiptEditorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const total = calculateTotal(items);

  const handlePriceChange = (index: number, value: string) => {
    if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;
    onUpdateItem(index, "price", value);
  };

  if (items.length === 0) return null;

  // Sort items by category while preserving original index for callbacks
  const sortedItems = items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => (a.item.category || "Other").localeCompare(b.item.category || "Other"));

  return (
    <div className="space-y-2">
      {sortedItems.map(({ item, originalIndex }) => (
        <div
          key={item.id || originalIndex}
          className={`p-3 bg-white rounded-md text-black flex items-center justify-between border-l-[5px] ${CATEGORY_BORDER_COLORS[item.category] || CATEGORY_BORDER_COLORS["Other"]}`}
        >
          {/* Left: Name and Category */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdateItem(originalIndex, "name", e.target.value)}
              className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full font-medium outline-none truncate"
              placeholder="Product name"
            />
            <select
              value={item.category || "Other"}
              onChange={(e) => onUpdateItem(originalIndex, "category", e.target.value)}
              className={`text-[10px] w-fit font-bold px-2 py-0.5 rounded-full cursor-pointer border-none outline-none ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"]}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Price and Delete button - centered vertically */}
          <div className="flex items-center  shrink-0 ">
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => handlePriceChange(originalIndex, e.target.value)}
                className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-20 font-bold text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              onClick={() => onDeleteItem(originalIndex)}
              className="flex items-center justify-center p-2 hover:bg-red-50 rounded-full transition-colors group"
              title="Delete item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-400 group-hover:text-red-600 transition-colors"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Category totals toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-3 bg-white rounded-md text-black font-semibold text-sm flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span>More details</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${showDetails ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {showDetails && (
        <div className="bg-white rounded-md overflow-hidden">
          {Object.entries(groupByCategory(items))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categoryTotal], i, arr) => (
              <div
                key={category}
                className={`flex justify-between items-center p-3 border-l-[5px] ${CATEGORY_BORDER_COLORS[category] || CATEGORY_BORDER_COLORS["Other"]} ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"]}`}
                >
                  {category}
                </span>
                <span className="font-bold text-black">{categoryTotal.toFixed(2)} EUR</span>
              </div>
            ))}
        </div>
      )}

      <div>
        <div className="flex justify-between p-3 bg-[#FBD2B8] rounded text-black rounded-md">
          <span className="font-bold">Total:</span>
          <span className="font-bold underline">{total} EUR</span>
        </div>
        <div className="flex justify-between p-3 bg-gray-50 rounded text-black mt-2 rounded-md">
          <span className="font-bold">Date:</span>
          <span className="font-bold">{date || "—"}</span>
        </div>
        <div className="flex text-black mt-2 rounded-md overflow-hidden">
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`${onClearAll ? "w-1/2 rounded-l-xl" : "w-full rounded-md"} bg-green-200 p-3 hover:bg-green-400 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed`}
            >
              {isSaving ? "Saving..." : saveLabel}
            </button>
          )}
          {onClearAll && (
            <button
              className={`${onSave ? "w-1/2 rounded-r-xl" : "w-full rounded-md"} bg-red-200 p-3 hover:bg-red-400 cursor-pointer`}
              onClick={onClearAll}
            >
              Del All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
