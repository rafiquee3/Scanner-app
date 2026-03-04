"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { scanImageAction, saveReceiptAction } from "@/src/actions/scan-actions";
import ReceiptEditor from "@/src/components/ReceiptEditor";
import { calculateTotal } from "@/src/utils/receipt-utils";
import { toast } from 'sonner';

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

  const total = calculateTotal(productItems);

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
        toast.success("Receipt saved to your list");
      }
    },
    onError: (err: any) => {
      toast.error("Could not save the receipt, user must bee logged in.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanMutate(file);
  };

  const handleDeleteItem = (index: number) => {
    const itemToDelete = productItems[index];
    setItems(items.filter((item) => item !== itemToDelete));
    toast.error("Product removed from list");
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
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Smart Scanner
      </h1>

      <div className="mb-6 p-4 border-2 border-dashed rounded-lg text-center">
        <input
          type="file"
          accept="image/*"
          capture="environment" 
          onChange={handleFileChange}
          disabled={isScanning}
          className="cursor-pointer"
          data-testid="file-input"
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
