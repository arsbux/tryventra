import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchIndustryTrends } from "../trends/google-trends";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "");

export interface MarketIntelligence {
    niche: string;
    intentAnalysis: {
        informational: string[];
        transactional: string[];
        comparison: string[];
    };
    aiShareOfVoice: {
        platform: string;
        momentum: number; // 0-100
        winners: string[];
    }[];
    nicheGaps: {
        query: string;
        gap: string;
        opportunity: string;
    }[];
    strategicPlaybook: {
        perplexitiyAdvantage: string;
        chatGPTAdvantage: string;
        contentPillars: string[];
        entityStrategy: string[];
    };
}

export async function analyzeMarketIntelligence(query: string): Promise<MarketIntelligence> {
    const prompt = `
    TASK: Perform deep Market Intelligence for the niche/keyword: "${query}".
    Focus on Answer Engine Optimization (AEO) and AI research patterns.

    1. Intent Analysis: Identify 3 questions/queries for Informational, Transactional, and Comparison intent specifically for AI search.
    2. AI Share of Voice: For platforms (ChatGPT, Perplexity, Claude, Gemini, Copilot), estimate their "momentum" (0-100) and identify current winners.
    3. Niche Gaps: Identify 3 "unanswered questions" where AI currently gives vague/poor answers.
    4. Strategic Playbook: Provide tailored advice for Perplexity vs ChatGPT, 3 content pillars, and an Entity strategy.

    Return valid JSON:
    {
      "niche": "...",
      "intentAnalysis": {
        "informational": ["...", "...", "..."],
        "transactional": ["...", "...", "..."],
        "comparison": ["...", "...", "..."]
      },
      "aiShareOfVoice": [
        { "platform": "Perplexity", "momentum": 85, "winners": ["Brand A", "Wikipedia"] },
        ...
      ],
      "nicheGaps": [
        { "query": "...", "gap": "...", "opportunity": "..." }
      ],
      "strategicPlaybook": {
        "perplexitiyAdvantage": "...",
        "chatGPTAdvantage": "...",
        "contentPillars": ["...", "...", "..."],
        "entityStrategy": ["...", "...", "..."]
      }
    }
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse market intelligence");
    } catch (error) {
        console.error("Market Intel Error:", error);
        throw error;
    }
}
