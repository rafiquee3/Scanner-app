"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/src/utils/supabase-server";
import { CATEGORIES } from "@/src/utils/constants";

export async function scanImageAction(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Configuration Error: GEMINI_API_KEY is not defined");
    return { error: "Server configuration error: Missing API Key" };
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    const prompt = `
      Analyze the attached receipt image and extract all purchased products.
      Return the response as pure JSON in the following format:
      [{"name": string, "price": number, "category": string}]
      
      Each product must be assigned to exactly one of these categories:
      ${CATEGORIES.map((c: string) => `"${c}"`).join(", ")}
      
      Round the price property to two decimal places.
      As the last record, extract the date visible on the receipt and add it as: {"date": "YYYY-MM-DD"} using ISO format.
    `;

    console.log("Calling Gemini API with model gemini-2.5-flash...");
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });
    const rawText = response.text || "[]";
    const jsonString = rawText.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("JSON Parse Error. Content:", rawText);
      return { error: "Failed to parse receipt data. Model output was not valid JSON." };
    }
  } catch (error: any) {
    console.error("Gemini Scan Error:", error);
    return { error: `Error during scanning: ${error.message || "Unknown error"}` };
  }
}

export async function saveReceiptAction(items: any[], total: string, date: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in!");
  // 1. Validate and format date
  let cleanDate = null;
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      cleanDate = d.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    } else {
      console.warn("Invalid date received from model:", date);
    }
  }

  // 2. Save receipt header
  const { data: receipt, error: rError } = await supabase
    .from("receipts")
    .insert({
      user_id: user.id,
      total: parseFloat(total),
      date: cleanDate,
    })
    .select()
    .single();
  if (rError) throw rError;
  // 2. Save items
  const itemsToInsert = items
    .filter((item) => item.name)
    .map((item) => ({
      receipt_id: receipt.id,
      name: item.name,
      price: parseFloat(item.price) || 0,
      category: item.category || "Other",
    }));

  const { error: iError } = await supabase.from("receipt_items").insert(itemsToInsert);

  if (iError) throw iError;
  return { success: true };
}

export async function getReceiptsAction(year?: number, month?: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let query = supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("user_id", user.id) // RLS Row Level Security
    .order("date", { ascending: false });

  if (year) {
    const startDate = new Date(year, (month ?? 1) - 1, 1).toISOString().split("T")[0];
    const endDate = month
      ? new Date(year, month, 0).toISOString().split("T")[0] // Last day of the selected month
      : `${year}-12-31`; // Last day of the year
    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching receipts:", error);
    return { error: error.message };
  }

  return { data };
}

export async function deleteReceiptAction(receiptId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("receipts")
    .delete()
    .eq("id", receiptId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting receipt:", error);
    throw error;
  }

  return { success: true };
}

export async function getReceiptByIdAction(receiptId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("receipts")
    .select(
      `
      *,
      receipt_items (*)
    `
    )
    .eq("id", receiptId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching receipt:", error);
    return { error: error.message };
  }

  return { data };
}

export async function updateReceiptAction(
  receiptId: string,
  items: any[],
  total: string,
  date: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Validate date
  let cleanDate = null;
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      cleanDate = d.toISOString().split("T")[0];
    }
  }

  // Update receipt header
  const { error: rError } = await supabase
    .from("receipts")
    .update({
      total: parseFloat(total),
      date: cleanDate,
    })
    .eq("id", receiptId)
    .eq("user_id", user.id);

  if (rError) throw rError;

  // Delete old items and insert new ones
  const { error: delError } = await supabase
    .from("receipt_items")
    .delete()
    .eq("receipt_id", receiptId);

  if (delError) throw delError;

  const itemsToInsert = items
    .filter((item) => item.name)
    .map((item) => ({
      receipt_id: receiptId,
      name: item.name,
      price: parseFloat(item.price) || 0,
      category: item.category || "Other",
    }));

  if (itemsToInsert.length > 0) {
    const { error: iError } = await supabase.from("receipt_items").insert(itemsToInsert);
    if (iError) throw iError;
  }

  return { success: true };
}
