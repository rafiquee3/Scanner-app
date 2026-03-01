"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { scanImageAction, saveReceiptAction } from "./actions/scan-actions";

const CATEGORIES = [
  "Meat", "Fish & Seafood", "Fruits", "Vegetables", "Drinks",
  "Other Food", "Household", "Alcohol", "Other"
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Meat": "bg-red-100 text-red-700",
  "Fish & Seafood": "bg-cyan-100 text-cyan-700",
  "Fruits": "bg-orange-100 text-orange-700",
  "Vegetables": "bg-green-100 text-green-700",
  "Drinks": "bg-blue-100 text-blue-700",
  "Other Food": "bg-yellow-100 text-yellow-700",
  "Household": "bg-purple-100 text-purple-700",
  "Alcohol": "bg-pink-100 text-pink-700",
  "Other": "bg-gray-100 text-gray-700",
};

interface Product {
  name: string;
  price: number;
  category: string;
}

export default function ScannerPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  // Scan Mutation
  const { mutate: scanMutate, data, isPending: isScanning, isError, error } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await scanImageAction(formData);
    },
    onSuccess: (data) => {
      if (data && Array.isArray(data)) {
        setItems(data);
      }
    }
  });

  // Save Mutation
  const { mutate: saveMutate, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const productItems = items.filter(item => item.name);
      return await saveReceiptAction(productItems, total, ticketDate);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        router.push("/receipts");
        setItems([]);
      }
    },
    onError: (err: any) => {
      alert("Error saving: " + err.message);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanMutate(file);
  };

  const ticketDate = items.length > 0 ? items[items.length - 1].date : null;
  const total = items.length > 0 
    ? items.reduce((acc: number, val: any) => acc + (val.price ? parseFloat(val.price) : 0), 0).toFixed(2)
    : "0.00";

  const handleDel = (indexToRemove: number) => {
    setItems(items.filter((_, i) => i !== indexToRemove));
  };

  const handleUpdate = (index: number, field: string, value: string) => {
    if (field === 'price') {
      if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) {
        return;
      }
    }
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Scanner</h1>

      <div className="mb-6 p-4 border-2 border-dashed rounded-lg text-center">
        <input 
          type="file" 
          accept="image/* .pdf" 
          onChange={handleFileChange} 
          disabled={isScanning}
          className="cursor-pointer"
        />
        {isScanning && <p className="mt-2 text-blue-500">Loading...</p>}
      </div>

      {isError && (
        <div className="bg-red-100 p-3 rounded mb-4 text-red-700">
          Error: {(error as Error).message}
        </div>
      )}

      {data && "error" in data ? (
        <div className="bg-orange-100 p-3 rounded mb-4 text-orange-700">
          Result error: {data.error}
        </div>
      ) : (
        <div className="space-y-2">
          {items.length > 0 && items
            .filter((item: any) => item.name)
            .map((item: Product, i: number) => (
              <div key={i} className="p-3 bg-gray-300 rounded-md text-black space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input 
                    type="text" 
                    value={item.name} 
                    onChange={(e) => handleUpdate(i, 'name', e.target.value)}
                    className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 flex-1 min-w-0 outline-none"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input 
                      type="number" 
                      step="0.01"
                      value={item.price} 
                      onChange={(e) => handleUpdate(i, 'price', e.target.value)}
                      className="bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-20 font-bold text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="font-bold whitespace-nowrap">PLN</span>
                  </div>
                  <button onClick={() => handleDel(i)}>
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
                  onChange={(e) => handleUpdate(i, 'category', e.target.value)}
                  className={`text-xs font-bold px-2 py-1 rounded-full cursor-pointer border-none outline-none ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"]}`}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            ))}
          
          {items.length > 0 && (
            <div>
              <div key="total" className="flex justify-between p-3 bg-[#FBD2B8] rounded text-black rounded-md">
                <span className='font-bold'>Total:</span>
                <span className="font-bold underline">{total} PLN</span>
              </div>
              <div key="date" className="flex justify-between p-3 bg-gray-50 rounded text-black mt-2 rounded-md ">
                <span className="font-bold">Date:</span>
                <span className="font-bold">{ticketDate}</span>
              </div>
              <div className="flex rounded text-black mt-2">
                <button 
                  onClick={() => saveMutate()}
                  disabled={isSaving}
                  className="w-1/2 bg-green-200 p-2 hover:bg-green-400 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button className="w-1/2 bg-red-200 p-2 hover:bg-red-400 cursor-pointer" onClick={() => setItems([])}>Del All</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}