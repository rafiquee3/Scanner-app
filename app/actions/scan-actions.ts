"use server";

import { GoogleGenAI } from "@google/genai";

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
      Analyze this receipt. 
      Extract products and prices. 
      Return ONLY a JSON array: [{"name": string, "price": number}]
    `;

    console.log("Calling Gemini API with model gemini-2.0-flash...");
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
                mimeType: file.type || "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const rawText = response.text || "[]";
    console.log("Gemini raw response:", rawText);
    
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