"use server";

import { GoogleGenAI } from "@google/genai";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
      przeprowadz analize zalaczonego zdjecia paragonu i wyciagnij z niego zakupione produkty, a nastepnie zwrocic odpowiedz jako czysty json o podanym formacie [{"name": string, "price": number}] i jako ostatni rekord wyciagniesz ze zdjecia date widoczna na paragonie i dodasz [{"date": string}, wlasciwosc price zaokraglaj do dwoch miejsc po przecinku]
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
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Musisz być zalogowany!");
  // 1. Save receipt header
  const { data: receipt, error: rError } = await supabase
    .from('receipts')
    .insert({
      user_id: user.id,
      total: parseFloat(total),
      date: date || null
    })
    .select()
    .single();
  if (rError) throw rError;
  // 2. Save items
  const itemsToInsert = items
    .filter(item => item.name)
    .map(item => ({
      receipt_id: receipt.id,
      name: item.name,
      price: parseFloat(item.price) || 0
    }));
  const { error: iError } = await supabase
    .from('receipt_items')
    .insert(itemsToInsert);
  if (iError) throw iError;
  return { success: true };
}