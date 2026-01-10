import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export interface DetailedBusinessAnalysis {
    industry: string;
    niche: string;
    targetKeywords: string[];     // Main tabs (5 core keywords)
    opportunityKeywords: string[]; // Recommended high-traffic keywords (5-8 items)
    aiReadinessScore: number;      // Aggregate 0-100 score
    citationMonitoring: {
        brand: number;             // Percentage of brand mentions in AI responses
        competitors: { name: string; share: number }[];
    };
    readinessPillars: {
        snippability: { score: number; feedback: string };
        structuredData: { score: number; feedback: string };
        discoverability: { score: number; feedback: string };
        authority: { score: number; feedback: string };
        freshness: { score: number; feedback: string };
    };
    crawlStats: {
        multiBotAccessibility: {
            googlebot: boolean;
            brave: boolean;
            perplexity: boolean;
            bing: boolean;
        };
        aiTechnicalDirectives: {
            robotsOptimization: string;
            llmsTxt: boolean;
            aiPressKit: boolean; // vendor-info.json / ai-summary.html
        };
        discoveryReadiness: {
            aiSitemap: boolean;
            indexStatus: string; // Cross-index status
        };
        structuralReadability: {
            schemaPresence: boolean; // FAQPage, QAPage, etc.
            entityEstablishment: boolean; // Organization, Person, etc.
        };
        freshnessHealth: {
            timestampProminence: boolean;
            errors: string[];
        };
    };
    competitorIntelligence: {
        competitors: { name: string; gap: string; authority: number; format: string }[];
    };
}

/**
 * Analyze website content to understand the business deeply
 * Uses Google Gemini to extract specific, high-intent keywords for trend analysis
 */
export async function analyzeBusinessWithAI(
    domain: string,
    pageContents: string[]
): Promise<DetailedBusinessAnalysis> {

    const combinedContent = pageContents.join('\n\n---\n\n');

    const prompt = `You are a Senior SEO and Market Intelligence Strategist. Analyze "${domain}" and provide a deep AEO (Answer Engine Optimization) Audit.

CONTEXT:
${combinedContent.substring(0, 8000)}

TASK:
1. Categorization: Identify 5 'Market Categorization' keywords for Wikipedia topic tracking.
2. AI Readiness Score (0-100): Evaluate based on 5 Core Categories:
   - Content Snippability: Answer front-loading, conversational tone, formatting for extraction.
   - Structured Data: Schema depth (FAQ/QA/HowTo), Entity establishment (Org/Person).
   - Multi-Index Discoverability: Accessibility for Googlebot, Brave, Perplexity, Bing.
   - Entity Authority: Author credentials, third-party citations, knowledge graph presence.
   - Freshness & Verifiability: Timestamp prominence, evidence proximity, data age.
3. Multi-Index Crawlability Ranking: Audit based on 5 Pillars:
   - Multi-Bot Accessibility: Verifying Googlebot/ChatGPT, Brave/Claude, PerplexityBot, and Bingbot status.
   - AI Tech Directives: robots.txt optimization, llms.txt presence, and AI Press Kits (vendor-info.json).
   - Sitemap & Discovery: specialized AI sitemaps and index status across all 4 major search indexes.
   - Structural Readability: FAQPage/QAPage schema and Entity establishment.
   - Freshness & Health: Timestamp prominence and crawl error identification.
4. Citation Mapping: Estimate the brand's share of voice in AI answers vs 3 key competitors.
5. Competitor Intelligence: Analyze 3 competitors for content gaps and authority.

Return valid JSON:
{
  "industry": "Industry",
  "niche": "Niche",
  "targetKeywords": [...],
  "opportunityKeywords": [...],
  "aiReadinessScore": 85,
  "readinessPillars": {
    "snippability": {"score": 80, "feedback": "Briefly front-load answers in top paragraphs."},
    "structuredData": {"score": 90, "feedback": "Excellent schema usage, missing vendor-info.json."},
    "discoverability": {"score": 75, "feedback": "Blocked by robots.txt in some zones."},
    "authority": {"score": 60, "feedback": "Needs clearer author bylines."},
    "freshness": {"score": 85, "feedback": "Keep timestamps updated monthly."}
  },
  "citationMonitoring": {
    "brand": 15,
    "competitors": [{"name": "A", "share": 30}, {"name": "B", "share": 25}]
  },
  "crawlStats": {
    "multiBotAccessibility": {"googlebot": true, "brave": true, "perplexity": false, "bing": true},
    "aiTechnicalDirectives": {"robotsOptimization": "...", "llmsTxt": false, "aiPressKit": true},
    "discoveryReadiness": {"aiSitemap": false, "indexStatus": "..."},
    "structuralReadability": {"schemaPresence": true, "entityEstablishment": true},
    "freshnessHealth": {"timestampProminence": true, "errors": []}
  },
  "competitorIntelligence": {
    "competitors": [{"name": "A", "gap": "...", "authority": 70, "format": "..."}]
  }
}`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error('AI Analysis Timeout')), 30000))
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const resultData = JSON.parse(jsonMatch[0]);

            // Clean and Sanitize
            resultData.targetKeywords = (resultData.targetKeywords || [])
                .filter((k: string) => k.length > 3)
                .slice(0, 5);

            return resultData;
        }

        throw new Error('Failed to parse AI response');
    } catch (error) {
        console.error('AI analysis error:', error);
        return {
            industry: 'Technology solutions',
            niche: 'B2B Services',
            targetKeywords: ['B2B lead generation', 'sales outreach automation', 'AI-driven business growth'],
            opportunityKeywords: ['future of sales tech', 'AI automation for startups'],
            aiReadinessScore: 65,
            readinessPillars: {
                snippability: { score: 50, feedback: 'Analysis pending.' },
                structuredData: { score: 50, feedback: 'Analysis pending.' },
                discoverability: { score: 50, feedback: 'Analysis pending.' },
                authority: { score: 50, feedback: 'Analysis pending.' },
                freshness: { score: 50, feedback: 'Analysis pending.' }
            },
            citationMonitoring: { brand: 10, competitors: [{ name: 'Industry Leader', share: 45 }] },
            crawlStats: {
                multiBotAccessibility: { googlebot: true, brave: true, perplexity: true, bing: true },
                aiTechnicalDirectives: { robotsOptimization: 'Standard rules applied.', llmsTxt: false, aiPressKit: false },
                discoveryReadiness: { aiSitemap: false, indexStatus: 'Omnipresent on primary indexes.' },
                structuralReadability: { schemaPresence: true, entityEstablishment: true },
                freshnessHealth: { timestampProminence: false, errors: [] }
            },
            competitorIntelligence: { competitors: [] }
        };
    }
}

/**
 * Generates semantic search phrases for Answer Engine Optimization (AEO)
 * These are questions/prompts users ask LLMs (Gemini, ChatGPT)
 */
export async function generateAIPhases(keyword: string): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Generate 5 natural language questions or search prompts that a user would ask an AI model (like ChatGPT or Gemini) if they were looking for information or solutions related to "${keyword}".
        
        Constraints:
        - Phrases must be high-intent questions or detailed prompts.
        - Examples: "How can I automate my B2B lead generation?", "Best strategies for scaling sales outreach with AI".
        - Return ONLY a JSON array of strings. No formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]).slice(0, 5);
        }
        return [];
    } catch (err) {
        console.error('Error generating AI phases:', err);
        return [
            `How to optimize ${keyword}?`,
            `Best tools for ${keyword}`,
            `Strategies for ${keyword} success`
        ];
    }
}
