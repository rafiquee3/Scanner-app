"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReceiptsAction, deleteReceiptAction } from "../actions/scan-actions";
import Link from "next/link";

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

export default function ReceiptsPage() {
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const result = await getReceiptsAction();
      if ('error' in result) throw new Error(result.error as string);
      return result.data || [];
    },
    staleTime: 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (receiptId: string) => deleteReceiptAction(receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (err: any) => {
      alert("Error deleting: " + err.message);
    }
  });

  const handleDelete = (receiptId: string) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      deleteMutate(receiptId);
    }
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
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h2 className="text-xl font-bold mb-2">Failed to load receipts</h2>
          <p className="mb-4">{(queryError as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-outfit">My Receipts</h1>
        <Link 
          href="/" 
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          + New Scan
        </Link>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4 text-lg">You haven't saved any receipts yet.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">Scan your first receipt now →</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {receipts.map((receipt) => (
            <Link key={receipt.id} href={`/receipts/${receipt.id}`} className="block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{new Date(receipt.date || receipt.created_at).toLocaleDateString()}</p>
                      <h3 className="text-xl font-bold text-gray-900">{receipt.total.toFixed(2)} PLN</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {receipt.receipt_items?.length || 0} items
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(receipt.id); }}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete receipt"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                
                  <div className="border-t border-gray-50 pt-4">
                    <ul className="space-y-2">
                      {receipt.receipt_items
                        ?.sort((a: any, b: any) => (a.category || "Other").localeCompare(b.category || "Other"))
                        .slice(0, 3)
                        .map((item: any) => (
                          <li key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.category && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"]}`}>
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">{item.price.toFixed(2)} PLN</span>
                          </li>
                        ))}
                      {receipt.receipt_items?.length > 3 && (
                        <li className="text-xs text-gray-400 italic">
                          + {receipt.receipt_items.length - 3} more items...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

          ))}
        </div>
      )}
    </div>
  );
}
