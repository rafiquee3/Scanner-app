"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getReceiptByIdAction, updateReceiptAction } from "@/src/actions/scan-actions";
import  { type Product } from "@/src/utils/receipt-utils";
import ReceiptEditor from "@/src/components/ReceiptEditor";
import { toast } from 'sonner';

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Product[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { isLoading, isError, error } = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () => {
      const result = await getReceiptByIdAction(id);
      if ("error" in result) throw new Error(result.error as string);
      return result.data;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Initialize local state from query data (only once)
  const { data: receiptData } = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () => {
      const result = await getReceiptByIdAction(id);
      if ("error" in result) throw new Error(result.error as string);
      return result.data;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (receiptData && !initialized) {
    setItems(receiptData.receipt_items || []);
    setDate(receiptData.date || null);
    setInitialized(true);
  }

  const total = items
    .reduce((acc, val) => {
      const price = typeof val.price === "string" ? parseFloat(val.price) : val.price;
      return acc + (price || 0);
    }, 0)
    .toFixed(2);

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      return await updateReceiptAction(id, items, total, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipt", id] });
      toast.success("Receipt updated successfully");
    },
    onError: (err: any) => {
      alert("Error updating: " + err.message);
      toast.error("Failed to update receipt");
    },
  });

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
     toast.error("Item removed from list");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h2 className="text-xl font-bold mb-2">Failed to load receipt</h2>
          <p className="mb-4">{(error as Error).message}</p>
          <Link href="/receipts" className="text-blue-600 font-bold hover:underline">
            ← Back to Receipts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Receipt Details</h1>
        <Link
          href="/receipts"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          ← Back to Receipts
        </Link>
      </div>

      <ReceiptEditor
        items={items}
        date={date}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onSave={() => updateMutate()}
        isSaving={isUpdating}
        saveLabel="Update"
      />
    </div>
  );
}
