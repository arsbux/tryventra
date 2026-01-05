import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const { companyName, domain, signal } = await req.json();

        if (!companyName) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }] as any
        });

        const prompt = `
      You are a specialized B2B Data Enrichment Agent (simulating Apollo/Hunter/Clearbit).
      
      TARGET COMPANY: ${companyName}
      DOMAIN: ${domain || "Unknown"}
      CONTEXT (Intent Signal): ${signal}

      MISSION:
      Find 1-3 specific decision makers (Founders, CTOs, VPs of Marketing, etc.) who would be most relevant to this intent signal.
      For each person, identify:
      - Full Name
      - Specific Role
      - Professional Profile Link (LinkedIn or Company Page)
      - Email Pattern/Confidence (e.g., {first}.{last}@company.com, 85% confidence)
      - Why them? (Short rationale)

      OUTPUT STRUCTURE (JSON):
      {
        "prospects": [
          {
            "name": string,
            "role": string,
            "link": string,
            "emailPattern": string,
            "confidence": number (0-100),
            "rationale": string
          }
        ]
      }

      Respond ONLY with the JSON. Be as factual as possible using your search tools.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid enrichment response");

        return NextResponse.json(JSON.parse(jsonMatch[0]));
    } catch (error) {
        console.error("Enrichment error:", error);
        return NextResponse.json({ prospects: [] });
    }
}
