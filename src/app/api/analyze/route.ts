import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { url, title, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }] as any
    });

    const prompt = `
      You are a specialized B2B Research Engine. Provide a comprehensive Intelligence Report for this lead signal.

      TARGET: ${title}
      SOURCE: ${url}
      PLATFORM: ${platform}

      RESEARCH OBJECTIVES:
      1. ENTITY INTELLIGENCE: Full company profile, official website, and active social media links (LinkedIn, Twitter).
      2. CONTACT EXTRACTION: You MUST find direct contact info. Look for specific Email addresses (hello@, sales@, etc.) and Phone Numbers. Check footer, contact pages, and business listings.
      3. INTENT LOGIC: Deep-dive into WHY this is a high-value signal. What is the evidence?
      4. TECHNICAL GAP: Identify precisely what they are missing or what problem needs solving.
      5. PROSPECT IDENTIFICATION: Find 1-3 specific decision-makers (Founders, CTOs, VPs). 
         CRITICAL: For each prospect, you MUST find at least one validated contact method: LinkedIn URL, Email, or Direct Phone. If no contact info can be found for a person, do NOT include them.
      6. STRATEGIC POSITIONING: How to frame an outreach that gets a response?

      OUTPUT STRUCTURE (Strict JSON):
      {
        "companyName": "Exact Company Name",
        "companyOverview": "Brief, high-impact overview (2 sentences).",
        "website": "Official URL",
        "phone": "Public Phone Number",
        "socials": { "linkedin": "URL", "twitter": "URL" },
        "intentJustification": "Evidence-backed reasoning for this lead.",
        "technicalGap": ["Specific gap 1", "Specific gap 2"],
        "prospects": [
          { 
            "name": "Full Name", 
            "role": "Exact Role", 
            "link": "LinkedIn URL (if found)", 
            "contactMethod": "Email: [email] | Phone: [phone] | LinkedIn", 
            "rationale": "Why this person is the right target for this specific signal." 
          }
        ],
        "outreachStrategy": ["Multi-channel step 1", "Multi-channel step 2"],
        "marketValue": "Estimated budget/deal size"
      }

      CRITICAL: Use your googleSearch tool to deeply research the individuals. Use LinkedIn, Twitter, and company 'About' pages.
      STRICT: Only include prospects who have at least one piece of contact information (LinkedIn, Email, or Phone).
      STRICT: Prioritize personal business emails (name@company.com) over generic ones (info@, support@, privacy@). Do NOT include generic addresses for personal prospects unless it is confirmed as their direct line.
      STRICT: Do NOT use any emojis in your response. Maintain a professional, data-driven tone.
      Respond ONLY with the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    let analysis = JSON.parse(jsonMatch[0]);

    // Sanitization: Ensure all fields exist to prevent frontend crashes
    const sanitized = {
      companyName: analysis.companyName || "Unknown Organization",
      companyOverview: analysis.companyOverview || "No overview available.",
      website: analysis.website || null,
      phone: analysis.phone || null,
      socials: analysis.socials || { linkedin: null, twitter: null },
      intentJustification: analysis.intentJustification || "No specific intent driver identified.",
      technicalGap: Array.isArray(analysis.technicalGap) ? analysis.technicalGap : [],
      prospects: Array.isArray(analysis.prospects) ? analysis.prospects : [],
      outreachStrategy: Array.isArray(analysis.outreachStrategy) ? analysis.outreachStrategy : [],
      marketValue: analysis.marketValue || "Potential deal size not specified"
    };

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze opportunity" }, { status: 500 });
  }
}
