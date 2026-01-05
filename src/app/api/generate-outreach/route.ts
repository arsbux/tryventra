import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const { companyName, signal, prospectName, prospectRole, type } = await req.json();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
      You are a world-class AI Outreach Specialist. Your goal is to write a highly personalized, non-spammy message to a prospect based on a specific business intent signal.

      PROSPECT: ${prospectName} (${prospectRole}) at ${companyName}
      INTENT SIGNAL: ${signal}
      OUTREACH CHANNEL: ${type} (Email, LinkedIn, or Twitter)

      RULES:
      1. Mention the specific signal naturally (e.g., more than just "I saw your launch", mention a detail from the signal).
      2. Keep it brief. 3-4 sentences max.
      3. Focus on how you can solve the specific gap identified in the signal.
      4. Professional but approachable tone.
      5. Do NOT use emojis.

      OUTPUT:
      Respond ONLY with the message content. No subjects, no intro/outro text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return NextResponse.json({ content: response.text() });
    } catch (error) {
        console.error("Outreach generation error:", error);
        return NextResponse.json({ error: "Failed to generate outreach" }, { status: 500 });
    }
}
