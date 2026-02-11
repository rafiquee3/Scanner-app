"use server";

import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function scanImageAction(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) throw new Error("No file provided");

  const bytes = await file.arrayBuffer();
  const base64Data = Buffer.from(bytes).toString("base64");

  const prompt = `
    Analyze this receipt. 
    Extract products and prices. 
    Return ONLY a JSON array: [{"name": string, "price": number}]
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const jsonString = rawText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("New library error:", error);
    return { error: "Error during scanning" };
  }
}