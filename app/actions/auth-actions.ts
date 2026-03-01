"use client";

import { supabase } from "@/src/utils/supabase";
import { useRouter } from "next/navigation";

export async function logoutAction() {
  const router = useRouter();
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error logging out:", error.message);
  router.refresh();
}
