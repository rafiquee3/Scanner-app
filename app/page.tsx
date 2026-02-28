"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { scanImageAction } from "./actions/scan-actions";

interface Product {
  name: string;
  price: number;
}

export default function ScannerPage() {
  const [items, setItems] = useState<any[]>([]);

  const { mutate, data, isPending, isError, error } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await scanImageAction(formData);
    },
    onSuccess: (data) => {
      console.log("Scanned successfully!", data);
      if (data && Array.isArray(data)) {
        setItems(data);
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  const ticketDate = items.length > 0 ? items[items.length - 1].date : null;
  const total = items.length > 0 
    ? items.reduce((acc: number, val: any) => acc + (val.price ? parseFloat(val.price) : 0), 0).toFixed(2)
    : "0.00";

  const handleDel = (indexToRemove: number) => {
    setItems(items.filter((_, i) => i !== indexToRemove));
  };
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Scanner</h1>

      <div className="mb-6 p-4 border-2 border-dashed rounded-lg text-center">
        <input 
          type="file" 
          accept="image/* .pdf" 
          onChange={handleFileChange} 
          disabled={isPending}
          className="cursor-pointer"
        />
        {isPending && <p className="mt-2 text-blue-500">Loading...</p>}
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
              <div key={i} className="flex items-center justify-between p-3 bg-gray-300 rounded-md text-black gap-2">
                <span className='truncate flex-1 min-w-0'>{item.name}</span>
                <span className="font-bold whitespace-nowrap shrink-0">{item.price} PLN</span>
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
            ))}
          
          {items.length > 0 && (
            <div>
              <div key="total" className="flex justify-between p-3 bg-[#FBD2B8] rounded text-black border-t-2 border-gray-200 rounded-md">
                <span className=''>Total:</span>
                <span className="font-bold underline">{total} PLN</span>
              </div>
              <div key="date" className="flex justify-between p-3 bg-gray-50 rounded text-black mt-2 rounded-md">
                <span>Date:</span>
                <span className="font-bold">{ticketDate}</span>
              </div>
              <div className="flex rounded text-black mt-2">
                <button className="w-1/2 bg-green-200 p-2 hover:bg-green-400 cursor-pointer">Save</button>
                <button className="w-1/2 bg-red-200 p-2 hover:bg-red-400 cursor-pointer" onClick={() => setItems([])}>Del All</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}