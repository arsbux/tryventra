export type Opportunity = {
    id: string;
    title: string;
    description: string;
    platform: 'Reddit' | 'AngelList' | 'Discord' | 'X/Twitter' | 'GitHub' | 'Hacker News' | 'Crunchbase' | 'Other' | 'BuiltWith' | 'Product Hunt' | 'G2' | 'Clutch' | 'Google Maps' | 'Database';
    link: string;
    tags: string[];
    postedAt?: string;
    opportunityType: 'Expansion' | 'Tech Swap' | 'Pain Point' | 'Marketplace RFP';
    signal: string;
    insight: string;
    desperationScore: number; // Intent Score
    actionLabel?: string;
    status?: string;
    estimatedValue?: string;
    probability?: number;
    notes?: string;
    contact?: string;
    owner?: string;
    isStarred?: boolean;
    createdAt?: string;
    email?: string;
};
