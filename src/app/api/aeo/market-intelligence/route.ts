import { NextResponse } from 'next/server';
import { analyzeMarketIntelligence } from '@/lib/ai/market-intelligence';
import { fetchIndustryTrends } from '@/lib/trends/google-trends';

export async function POST(request: Request) {
    try {
        const { query, timeframe = '6m' } = await request.json();
        if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

        // Parallel fetch of Trend charts and AI Intelligence
        const [intel, trends] = await Promise.all([
            analyzeMarketIntelligence(query),
            fetchIndustryTrends(query, timeframe)
        ]);

        return NextResponse.json({
            intel,
            trends
        });
    } catch (error: any) {
        console.error('Market Intelligence API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
