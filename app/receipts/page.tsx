"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReceiptsAction, deleteReceiptAction } from "../actions/scan-actions";
import Link from "next/link";
import { CATEGORY_COLORS, MONTHS } from "@/src/utils/constants";

export default function ReceiptsPage() {
  const queryClient = useQueryClient();

  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const {
    data: receipts = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["receipts", selectedYear, selectedMonth],
    queryFn: async () => {
      const result = await getReceiptsAction(
        selectedYear === "all" ? undefined : selectedYear,
        selectedMonth === "all" ? undefined : selectedMonth
      );
      if ("error" in result) throw new Error(result.error as string);
      return result.data || [];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Generate years: from 2024 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i).reverse();

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (receiptId: string) => deleteReceiptAction(receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] }); // refresh 
    },
    onError: (err: any) => {
      alert("Error deleting: " + err.message);
    },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold font-outfit">My Receipts</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 shrink-0 overflow-hidden">
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val === "all" ? "all" : parseInt(val));
                if (val === "all") setSelectedMonth("all"); // Reset month if year is 'all'
              }}
              className="bg-transparent text-sm font-semibold px-4 py-2.5 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y} className="text-black">
                  {y}
                </option>
              ))}
            </select>
            <div className="w-px bg-blue-500/50 my-2"></div>
            <select
              value={selectedMonth}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMonth(val === "all" ? "all" : parseInt(val));
              }}
              disabled={selectedYear === "all"}
              className="bg-transparent text-sm font-semibold px-4 py-2.5 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value} className="text-black">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
          >
            + New Scan
          </Link>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4 text-lg">You haven't saved any receipts yet.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            Scan your first receipt now →
          </Link>
        </div>
      ) : (
        <>
           {/* Summary bar */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-center mb-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0).toFixed(2)} PLN
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            {receipts.map((receipt) => (
              <Link key={receipt.id} href={`/receipts/${receipt.id}`} className="block">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {new Date(receipt.date || receipt.created_at).toLocaleDateString()}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900">
                          {receipt.total.toFixed(2)} PLN
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {receipt.receipt_items?.length || 0} items
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(receipt.id);
                          }}
                          disabled={isDeleting}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete receipt"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
                          ?.sort((a: any, b: any) =>
                            (a.category || "Other").localeCompare(b.category || "Other")
                          )
                          .slice(0, 3)
                          .map((item: any) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between text-sm text-gray-600"
                            >
                              <div className="flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.category && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Other"]}`}
                                  >
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
        </>
      )}
    </div>
  );
}
