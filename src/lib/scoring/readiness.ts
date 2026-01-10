import { CrawlResult } from '../crawler';

export interface ReadinessBreakdown {
    score: number;
    answerPositionScore: number;
    schemaScore: number;
    qaStructureScore: number;
    contentQualityScore: number;
    quickWins: {
        needsOptimization: number;
        alreadyGood: number;
        needsSchema: number;
    };
}

/**
 * Calculate AI Readiness Score (0-100) for a set of pages
 */
export function calculateReadinessScore(pages: CrawlResult[]): ReadinessBreakdown {
    if (pages.length === 0) {
        return {
            score: 0,
            answerPositionScore: 0,
            schemaScore: 0,
            qaStructureScore: 0,
            contentQualityScore: 0,
            quickWins: { needsOptimization: 0, alreadyGood: 0, needsSchema: 0 }
        };
    }

    let totalScore = 0;
    let totalAnswerScore = 0;
    let totalSchemaScore = 0;
    let totalQAScore = 0;
    let totalContentScore = 0;

    let needsOptimization = 0;
    let alreadyGood = 0;
    let needsSchema = 0;

    pages.forEach(page => {
        const pageScores = calculatePageScore(page);
        totalScore += pageScores.total;
        totalAnswerScore += pageScores.answerPosition;
        totalSchemaScore += pageScores.schema;
        totalQAScore += pageScores.qaStructure;
        totalContentScore += pageScores.contentQuality;

        // Count quick wins
        if (pageScores.total >= 70) {
            alreadyGood++;
        } else if (pageScores.total < 50) {
            needsOptimization++;
        }

        if (!page.hasSchema) {
            needsSchema++;
        }
    });

    return {
        score: Math.round(totalScore / pages.length),
        answerPositionScore: Math.round(totalAnswerScore / pages.length),
        schemaScore: Math.round(totalSchemaScore / pages.length),
        qaStructureScore: Math.round(totalQAScore / pages.length),
        contentQualityScore: Math.round(totalContentScore / pages.length),
        quickWins: {
            needsOptimization,
            alreadyGood,
            needsSchema
        }
    };
}

/**
 * Calculate score for a single page
 */
function calculatePageScore(page: CrawlResult): {
    total: number;
    answerPosition: number;
    schema: number;
    qaStructure: number;
    contentQuality: number;
} {
    const weights = {
        answerPosition: 0.3,   // 30%
        schema: 0.25,          // 25%
        qaStructure: 0.25,     // 25%
        contentQuality: 0.2    // 20%
    };

    // 1. Answer Position Score (0-100)
    let answerScore = 0;
    if (page.answerPosition === 1) {
        answerScore = 100;
    } else if (page.answerPosition === 2) {
        answerScore = 70;
    } else if (page.answerPosition === 3) {
        answerScore = 40;
    } else {
        answerScore = 20;
    }

    // 2. Schema Score (0-100)
    const schemaScore = page.hasSchema ? 100 : 0;

    // 3. Q&A Structure Score (0-100)
    const qaHeadings = page.headings.filter(h =>
        h.text.includes('?') ||
        h.text.toLowerCase().startsWith('how') ||
        h.text.toLowerCase().startsWith('what') ||
        h.text.toLowerCase().startsWith('why') ||
        h.text.toLowerCase().startsWith('when') ||
        h.text.toLowerCase().startsWith('where')
    );
    const qaScore = Math.min(100, qaHeadings.length * 20);

    // 4. Content Quality Score (0-100)
    let contentScore = 0;
    if (page.wordCount >= 300 && page.wordCount <= 1200) {
        contentScore = 100;
    } else if (page.wordCount >= 200 && page.wordCount < 300) {
        contentScore = 70;
    } else if (page.wordCount > 1200 && page.wordCount < 2000) {
        contentScore = 60;
    } else {
        contentScore = 30;
    }

    // Calculate weighted total
    const total =
        answerScore * weights.answerPosition +
        schemaScore * weights.schema +
        qaScore * weights.qaStructure +
        contentScore * weights.contentQuality;

    return {
        total,
        answerPosition: answerScore,
        schema: schemaScore,
        qaStructure: qaScore,
        contentQuality: contentScore
    };
}

/**
 * Get human-readable score category
 */
export function getScoreCategory(score: number): {
    label: string;
    color: string;
    description: string;
} {
    if (score >= 80) {
        return {
            label: 'Excellent',
            color: '#10b981',
            description: 'Your content is well-optimized for AI answer engines'
        };
    } else if (score >= 60) {
        return {
            label: 'Good',
            color: '#3b82f6',
            description: 'Some optimization needed, but you\'re on the right track'
        };
    } else if (score >= 40) {
        return {
            label: 'Needs Work',
            color: '#f59e0b',
            description: 'Significant improvements needed to appear in AI answers'
        };
    } else {
        return {
            label: 'Poor',
            color: '#ef4444',
            description: 'Major optimization required - AI systems likely won\'t cite you'
        };
    }
}
