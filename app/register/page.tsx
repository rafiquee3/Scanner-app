"use client";

import { supabase } from "@/src/utils/supabase";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email to confirm your registration!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to sync your scanned receipts</p>
        </div>
        <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:bg-gray-50 text-gray-500 border-gray-200"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm hover:bg-gray-50 text-gray-500 border-gray-200"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign Up with Email"}
          </button>
        </form>
      </div>

      <Link
        href="/login"
        className="mt-6 text-gray-400 hover:text-gray-200 transition-colors text-sm font-medium"
      >
        ← Back to login page
      </Link>
    </div>
  );
}
