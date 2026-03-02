"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_BORDER_COLORS,
} from "@/src/utils/constants";

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
}

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

  const total = items
    .reduce((acc, val) => {
      const price = typeof val.price === "string" ? parseFloat(val.price) : val.price;
      return acc + (price || 0);
    }, 0)
    .toFixed(2);

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
          className={`p-3 bg-white rounded-md text-black space-y-2 border-l-[5px] ${CATEGORY_BORDER_COLORS[item.category] || CATEGORY_BORDER_COLORS["Other"]}`}
        >
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdateItem(originalIndex, "name", e.target.value)}
              className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 flex-1 min-w-0 outline-none"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => handlePriceChange(originalIndex, e.target.value)}
                className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-20 font-bold text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="font-bold whitespace-nowrap">PLN</span>
            </div>
            <button onClick={() => onDeleteItem(originalIndex)}>
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
                className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-1"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
          <select
            value={item.category || "Other"}
            onChange={(e) => onUpdateItem(originalIndex, "category", e.target.value)}
            className={`text-xs font-bold px-2 py-1 rounded-full cursor-pointer border-none outline-none ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"]}`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
          {Object.entries(
            items.reduce<Record<string, number>>((acc, item) => {
              const cat = item.category || "Other";
              const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
              acc[cat] = (acc[cat] || 0) + (price || 0);
              return acc;
            }, {})
          )
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
                <span className="font-bold text-black">{categoryTotal.toFixed(2)} PLN</span>
              </div>
            ))}
        </div>
      )}

      <div>
        <div className="flex justify-between p-3 bg-[#FBD2B8] rounded text-black rounded-md">
          <span className="font-bold">Total:</span>
          <span className="font-bold underline">{total} PLN</span>
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
