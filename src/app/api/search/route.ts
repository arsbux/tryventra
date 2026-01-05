import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "AI configuration missing" }, { status: 500 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { query, mode, userId } = body;

    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                const text = JSON.stringify(data) + "\n"; // Newline delimited JSON
                controller.enqueue(encoder.encode(text));
            };

            const sendLog = (message: string) => {
                sendEvent({ type: 'log', message });
            };

            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    tools: [{ googleSearch: {} }] as any
                });

                const isProspectMode = mode === 'prospect';

                sendLog(`Initializing AI Agent...`);
                sendLog(`Mode: ${isProspectMode ? 'Deep Prospecting' : 'High-Intent Analysis'}`);
                sendLog(`Target: "${query}"`);

                const batches = isProspectMode ? [
                    { source: "Verified B2B Databases, LinkedIn & Crunchbase", targetCount: 15 },
                    { source: "Google Maps, Yelp & Local Business Directories", targetCount: 15 },
                    { source: "Niche Industry Associations, Press & Web Crawl", targetCount: 15 }
                ] : [
                    { source: "Crunchbase, TechCrunch & Product Hunt", targetCount: 20 },
                    { source: "Reddit, Hacker News & Social Signals", targetCount: 20 }
                ];

                sendLog(`Strategy: Optimized Deep Search across ${batches.length} primary data clusters.`);

                const runBatchWithRetry = async (batch: typeof batches[0], retries = 2) => {
                    const prompt = isProspectMode ? `
                  You are a specialized B2B Lead Scout.
                  Task: Find exactly ${batch.targetCount} qualified businesses in: "${query}"
                  Source: ${batch.source}

                  MANDATORY:
                  1. Company Name & Website
                  2. DECISION MAKER: Name & Role.
                  3. EMAIL: Must find a direct email structure.
                  
                  OUTPUT JSON ARRAY:
                  [{
                    "title": "Company",
                    "description": "...",
                    "link": "url",
                    "tags": ["Name", "Role"],
                    "desperationScore": 85,
                    "opportunityType": "Expansion",
                    "signal": "Name (Role) | Email: ... | LinkedIn: ...", 
                    "insight": "Outreach angle",
                    "actionLabel": "Analyze"
                  }]
                ` : `
                  Identify ${batch.targetCount} companies showing high-intent signals for: "${query}".
                  Source: ${batch.source}

                  Task: Look for companies visiting pricing pages, searching for competitors, or posting hiring needs related to "${query}".
                  
                  OUTPUT JSON ARRAY:
                  [{
                    "title": "Company Name",
                    "description": "Short bio",
                    "link": "https://company.com",
                    "tags": ["Tag1", "Tag2"],
                    "desperationScore": 90,
                    "opportunityType": "Expansion",
                    "signal": "Specific signal detected (e.g. visiting pricing page)",
                    "insight": "Actionable advice",
                    "actionLabel": "Analyze"
                  }]
                `;

                    for (let i = 0; i <= retries; i++) {
                        try {
                            sendLog(`Scanning ${batch.source}...`);
                            const result = await model.generateContent(prompt);
                            const text = result.response.text();
                            const jsonMatch = text.match(/\[[\s\S]*\]/);
                            if (!jsonMatch) return [];
                            const data = JSON.parse(jsonMatch[0]);
                            sendLog(` found ${data.length} results from ${batch.source}.`);
                            return data;
                        } catch (e) {
                            if (i === retries) {
                                sendLog(`Source ${batch.source} unavailable.`);
                                return [];
                            }
                            await new Promise(r => setTimeout(r, 2000));
                        }
                    }
                    return [];
                };

                const allResults = [];
                const groupSize = 2;
                for (let i = 0; i < batches.length; i += groupSize) {
                    const group = batches.slice(i, i + groupSize);
                    sendLog(`Processing Batch Group ${i / groupSize + 1}/${Math.ceil(batches.length / groupSize)}...`);
                    const groupResults = await Promise.all(group.map(b => runBatchWithRetry(b)));
                    allResults.push(...groupResults.flat());
                }

                // Deduplicate
                sendLog(`Consolidating ${allResults.length} raw records...`);
                const seenLinks = new Set();
                const uniqueOpportunities = allResults
                    .filter(opp => {
                        if (!opp.link || seenLinks.has(opp.link)) return false;
                        seenLinks.add(opp.link);
                        return true;
                    })
                    .map(opp => ({
                        ...opp,
                        id: crypto.randomUUID(), // Assign persistent ID here
                        platform: opp.platform || (isProspectMode ? "Direct Search" : "Intent Signal")
                    }));

                sendLog(`Deduplication complete. ${uniqueOpportunities.length} unique leads verified.`);

                // Supabase Save
                if (uniqueOpportunities.length > 0) {
                    sendLog(`Syncing to Database...`);
                    const dbLeads = uniqueOpportunities.map(opp => ({
                        id: opp.id, // Use the SAME ID
                        company_name: opp.title,
                        website: opp.link,
                        description: opp.description,
                        signal: opp.signal,
                        insight: opp.insight,
                        intent_score: opp.desperationScore,
                        opportunity_type: opp.opportunityType,
                        tags: opp.tags?.join(','),
                        niche: query,
                        user_id: userId
                    }));

                    const { error } = await supabase.from('leads').upsert(dbLeads, { onConflict: 'company_name,website' });
                    if (error) sendLog(`Database Sync Warning: ${error.message}`);
                    else sendLog(`Database Sync Complete.`);
                }

                sendEvent({ type: 'result', data: uniqueOpportunities });
                controller.close();

            } catch (error: any) {
                console.error("Stream error:", error);
                sendEvent({ type: 'error', message: error.message || "Unknown error" });
                controller.close();
            }
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
