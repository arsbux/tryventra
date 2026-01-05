import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { input } = await req.json();

        if (!input || input.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `User input: "${input}". 
        Suggest 5 specific, relevant B2B niches, industries, or search queries that match or complete this input. 
        Return ONLY a JSON array of strings. Example: ["SaaS for Dentists", "Marketing Agencies in UK"]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // simple parse
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Suggestion error:", error);
        // Fallback to empty
        return NextResponse.json({ suggestions: [] });
    }
}
