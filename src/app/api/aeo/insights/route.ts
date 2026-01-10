import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeBusinessWithAI } from '@/lib/ai/business-analyzer';
import { fetchIndustryTrends } from '@/lib/trends/google-trends';

export async function POST(request: Request) {
    try {
        const { domain, projectId, keyword, timeframe } = await request.json();

        // MODE 1: Single Keyword Fetch (User clicked a recommendation or lazy-load tab)
        if (keyword) {
            const trendData = await fetchIndustryTrends(keyword, timeframe);
            if (!trendData) {
                // Return empty structure vs error to prevent UI crash, but marked as error
                return NextResponse.json({
                    trend: {
                        keyword,
                        timeline: [],
                        relatedTopics: [],
                        relatedQueries: [],
                        averageInterest: 0,
                        error: true,
                        loaded: true
                    }
                });
            }
            return NextResponse.json({ trend: { ...trendData, loaded: true, error: false } });
        }

        // MODE 2: Full Initial Dashboard Load
        if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

        const { data: project } = await supabase
            .from('aeo_projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (!project) throw new Error('Project not found');

        const { data: pages } = await supabase
            .from('crawled_pages')
            .select('content_text, title')
            .eq('project_id', projectId)
            .limit(5); // Reduced limit since we have main content now

        // Prioritize the curated database content (User requested this specific source)
        const primaryContext = `
OFFICIAL META DESCRIPTION: ${project.meta_description || 'N/A'}

MAIN PAGE CONTENT: ${project.content_text || 'N/A'}
`;

        const pageContents = (pages || []).map((p: any) => `PAGE TITLE: ${p.title}\n\nCONTENT: ${p.content_text}`);

        // Prepend the primary content to ensures it's treated as the main source of truth
        const finalContent = [primaryContext, ...pageContents];

        // 1. Audit Business & Identify Keywords (Real Analysis)
        const analysis = await analyzeBusinessWithAI(project.domain, finalContent);

        // 2. Fetch & Rank ALL Target Keywords by Performance
        const trendResults = await Promise.all(
            analysis.targetKeywords.map(async (kw) => {
                try {
                    const data = await Promise.race([
                        fetchIndustryTrends(kw, timeframe || '6m'),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000))
                    ]) as any;

                    if (data && data.timeline.length > 0) {
                        // Calculate Trend Velocity (Last 20% vs Previous 80% to find recent breakouts)
                        const pivot = Math.floor(data.timeline.length * 0.8);
                        const baseline = data.timeline.slice(0, pivot);
                        const recent = data.timeline.slice(pivot);

                        const avgBaseline = baseline.reduce((a: number, b: any) => a + b.value, 0) / (baseline.length || 1);
                        const avgRecent = recent.reduce((a: number, b: any) => a + b.value, 0) / (recent.length || 1);

                        const velocity = (avgRecent - avgBaseline) / (avgBaseline || 1);

                        // Performance = Volume (60%) + Velocity (40%)
                        // We normalize velocity contribution
                        const velocityScore = Math.min(100, Math.max(0, 50 + (velocity * 50)));
                        const performanceIndex = (data.averageInterest * 0.6) + (velocityScore * 0.4);

                        return {
                            ...data,
                            performanceIndex,
                            loaded: true,
                            error: false
                        };
                    }
                } catch (err) {
                    console.warn(`Trend fetch failed for ${kw}:`, err);
                }

                return {
                    keyword: kw,
                    timeline: [],
                    relatedTopics: [],
                    relatedQueries: [],
                    averageInterest: 0,
                    performanceIndex: 0,
                    error: true,
                    loaded: true
                };
            })
        );

        // Deduplicate and Sort
        const uniqueTrends: any[] = [];
        const seenKeywords = new Set();

        const sortedResults = trendResults.sort((a, b) => (b.performanceIndex || 0) - (a.performanceIndex || 0));

        for (const t of sortedResults) {
            if (!seenKeywords.has(t.keyword)) {
                seenKeywords.add(t.keyword);
                uniqueTrends.push(t);
            }
        }

        return NextResponse.json({
            industry: analysis.industry,
            niche: analysis.niche,
            trends: uniqueTrends,
            opportunities: analysis.opportunityKeywords,
            aiReadinessScore: analysis.aiReadinessScore,
            readinessPillars: analysis.readinessPillars,
            citationMonitoring: analysis.citationMonitoring,
            crawlStats: analysis.crawlStats,
            competitorIntelligence: analysis.competitorIntelligence
        });
    } catch (error: any) {
        console.error('Insights API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
