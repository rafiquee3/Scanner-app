"use client";

import { useMutation } from "@tanstack/react-query";
import { scanImageAction } from "./actions/scan-actions";

interface Product {
  name: string;
  price: number;
}

export default function ScannerPage() {
  const { mutate, data, isPending, isError, error } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await scanImageAction(formData);
    },
    onSuccess: (data) => {
      console.log("Scanned successfully!", data);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Scanner + TanStack</h1>

      <div className="mb-6 p-4 border-2 border-dashed rounded-lg text-center">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={isPending}
          className="cursor-pointer"
        />
        {isPending && <p className="mt-2 text-blue-500">AI is thinking... ✨</p>}
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
          {data && Array.isArray(data) && data.map((item: Product, i: number) => (
            <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <span className="font-bold">{item.price} PLN</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}