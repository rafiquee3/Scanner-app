"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { scanImageAction, saveReceiptAction } from "./actions/scan-actions";
import ReceiptEditor from "@/src/components/ReceiptEditor";

export default function ScannerPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  // Scan Mutation
  const {
    mutate: scanMutate,
    data,
    isPending: isScanning,
    isError,
    error,
  } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await scanImageAction(formData);
    },
    onSuccess: (data) => {
      if (data && Array.isArray(data)) {
        setItems(data);
      }
    },
  });

  // Find date object in the array
  const dateObj = items.find((item) => item.date);
  const ticketDate = dateObj ? dateObj.date : null;

  // Filter only products (those with name)
  const productItems = items.filter((item) => item.name);

  const total = productItems
    .reduce((acc: number, val: any) => {
      const price = typeof val.price === "string" ? parseFloat(val.price) : val.price;
      return acc + (price || 0);
    }, 0)
    .toFixed(2);

  // Save Mutation
  const { mutate: saveMutate, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      return await saveReceiptAction(productItems, total, ticketDate);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["receipts"] });
        router.push("/receipts");
        setItems([]);
      }
    },
    onError: (err: any) => {
      alert("Error saving: " + err.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanMutate(file);
  };

  const handleDeleteItem = (index: number) => {
    const itemToDelete = productItems[index];
    setItems(items.filter((item) => item !== itemToDelete));
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const itemToUpdate = productItems[index];
    const newItems = items.map((item) =>
      item === itemToUpdate ? { ...item, [field]: value } : item
    );
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
        <ReceiptEditor
          items={productItems}
          date={ticketDate}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onSave={() => saveMutate()}
          onClearAll={() => setItems([])}
          isSaving={isSaving}
          saveLabel="Save"
        />
      )}
    </div>
  );
}
