"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/src/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    toast.success("User logged out successfully");
  };

  return (
    <div className="mx-4 mt-4 h-[70px] flex bg-blue-600 content-center items-center px-8 text-white shadow-md rounded-xl">
      <div className="text-xl font-bold flex gap-8 items-center flex-1">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          Scanner AI
        </Link>
        {user && (
          <Link
            href="/receipts"
            className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            My Receipts
          </Link>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80 hidden sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-white/20"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
