"use client";

import React, { useState } from 'react';
import dashStyles from '../dashboard/dashboard.module.css';
import { useTheme } from '@/components/ThemeProvider';
import { Icons } from '@/components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IntelData {
    intel: {
        niche: string;
        intentAnalysis: {
            informational: string[];
            transactional: string[];
            comparison: string[];
        };
        aiShareOfVoice: {
            platform: string;
            momentum: number;
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
    };
    trends: {
        keyword: string;
        timeline: { date: string; value: number }[];
        averageInterest: number;
    } | null;
}

export default function MarketIntelligencePage() {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<IntelData | null>(null);
    const [error, setError] = useState('');
    const [timeframe, setTimeframe] = useState('6m');

    const handleSearch = async (e?: React.FormEvent, newTimeframe?: string) => {
        if (e) e.preventDefault();
        const activeTimeframe = newTimeframe || timeframe;
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        // We keep the old data visible while loading if it's just a timeframe change
        if (!newTimeframe) setData(null);

        try {
            const response = await fetch('/api/aeo/market-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, timeframe: activeTimeframe })
            });

            if (!response.ok) throw new Error('Failed to fetch intelligence');
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeframeChange = (newTf: string) => {
        setTimeframe(newTf);
        if (query) {
            handleSearch(undefined, newTf);
        }
    };

    const COLORS = ['#00eba8', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

    return (
        <div className={dashStyles.container} style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={dashStyles.header} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', width: '100%', marginBottom: '40px' }}>
                <div>
                    <h1 className={dashStyles.title} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>AEO Market Radar</h1>
                    <p className={dashStyles.subtitle} style={{ fontSize: '1rem' }}>Shift from keyword volume to AI Search Intent & Entity Authority</p>
                </div>

                <form onSubmit={(e) => handleSearch(e)} style={{ width: '100%', maxWidth: '650px', position: 'relative', margin: '20px auto 0' }}>
                    <input
                        type="text"
                        placeholder="Search any niche or keyword (e.g. 'Sustainable Fashion', 'B2B SaaS')..."
                        className={dashStyles.onboardingInput}
                        style={{ paddingRight: '120px', marginBottom: 0, textAlign: 'center' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={dashStyles.onboardingButton}
                        style={{ position: 'absolute', right: '8px', top: '8px', width: 'auto', padding: '8px 24px', fontSize: '0.85rem' }}
                    >
                        {loading ? 'Scanning...' : 'Search'}
                    </button>
                </form>
            </div>

            <div style={{ width: '100%' }}>
                {!data && !loading && (
                    <div className={dashStyles.emptyState} style={{ padding: '80px', width: '100%' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📡</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Ready to Scan the AI Ecosystem</h2>
                        <p style={{ maxWidth: '500px' }}>Enter a niche above to see real-time AI Share of Voice, search intent gaps, and a strategic playbook to dominate AI answers.</p>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            {['Cybersecurity SaaS', 'Healthy Meal Prep', 'Remote Work Tools'].map(s => (
                                <button key={s} onClick={() => { setQuery(s); handleSearch(undefined, timeframe); }} style={{
                                    background: 'rgba(0, 235, 168, 0.1)',
                                    border: '1px solid rgba(0, 235, 168, 0.3)',
                                    color: 'var(--primary)',
                                    padding: '10px 20px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>
                                    Try "{s}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading && !data && (
                    <div className={dashStyles.emptyState} style={{ padding: '80px', width: '100%' }}>
                        <div className={dashStyles.spinner} style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)', marginBottom: '24px' }}></div>
                        <h2>Orchestrating AI Intelligence...</h2>
                        <p>Mining natural language queries and calculating share of voice across 5 major AI search engines.</p>
                    </div>
                )}

                {data && (
                    <div className={dashStyles.animationFadeIn}>
                        {/* Full Width Chart Card */}
                        <div className={dashStyles.chartCard} style={{ marginBottom: '32px', width: '100%' }}>
                            <div className={dashStyles.cardHeader} style={{ padding: '20px 32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Interest & Trend Visualization</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical search interest for "{data.intel.niche}"</p>
                                    </div>
                                    <div style={{ padding: '6px 14px', background: 'rgba(0,235,168,0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                                        AVG INTEREST: {Math.round(data.trends?.averageInterest || 0)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                                    {['1m', '3m', '6m', '12m'].map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => handleTimeframeChange(tf)}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                background: timeframe === tf ? 'var(--primary)' : 'transparent',
                                                color: timeframe === tf ? '#000' : 'var(--text-muted)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {tf.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={dashStyles.chartContainer} style={{ height: '350px', padding: '32px' }}>
                                {data.trends ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.trends.timeline}>
                                            <defs>
                                                <linearGradient id="colorValueIntel" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValueIntel)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Historical data unavailable</div>
                                )}
                            </div>
                        </div>

                        {/* Mid Row: Share of Voice & Intent Matching */}
                        <div className={dashStyles.grid} style={{ gridTemplateColumns: '1.2fr 2fr', marginBottom: '32px' }}>
                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>AI Share of Voice Trends</h3>
                                </div>
                                <div className={dashStyles.list} style={{ padding: '24px' }}>
                                    {data.intel.aiShareOfVoice.map((platform, i) => (
                                        <div key={i} style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{platform.platform}</span>
                                                <span style={{ fontSize: '0.85rem', color: COLORS[i % COLORS.length], fontWeight: 800 }}>{platform.momentum}% Momentum</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                                                <div style={{ width: `${platform.momentum}%`, height: '100%', background: COLORS[i % COLORS.length] }}></div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                Current Winners: {platform.winners.join(', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>Intent Matching (AI Search Patterns)</h3>
                                </div>
                                <div className={dashStyles.list}>
                                    {[
                                        { label: 'Informational', data: data.intel.intentAnalysis.informational, icon: '📖', color: '#3b82f6' },
                                        { label: 'Comparison', data: data.intel.intentAnalysis.comparison, icon: '⚖️', color: '#8b5cf6' },
                                        { label: 'Transactional', data: data.intel.intentAnalysis.transactional, icon: '💰', color: '#00eba8' }
                                    ].map((intent, i) => (
                                        <div key={i} style={{ padding: '20px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: intent.color, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <span>{intent.icon}</span> {intent.label} Intent
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                {intent.data.map((q, j) => (
                                                    <div key={j} style={{
                                                        background: 'rgba(255,255,255,0.02)',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        border: '1px solid var(--border)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px'
                                                    }}>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{j + 1}</span>
                                                        {q}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Gaps & Playbook */}
                        <div className={dashStyles.grid} style={{ marginBottom: '32px' }}>
                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>AEO Gap Analysis</h3>
                                </div>
                                <div className={dashStyles.list}>
                                    {data.intel.nicheGaps.map((gap, i) => (
                                        <div key={i} className={dashStyles.listItem} style={{ padding: '20px', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', width: '100%' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{i + 1} QUERY</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{gap.query}</span>
                                            </div>
                                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ef4444', marginBottom: '8px', width: '100%' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800, display: 'block' }}>REASONING GAP</span>
                                                <p style={{ fontSize: '0.75rem', margin: '4px 0 0' }}>{gap.gap}</p>
                                            </div>
                                            <div style={{ background: 'rgba(0, 235, 168, 0.05)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', width: '100%' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, display: 'block' }}>OPPORTUNITY</span>
                                                <p style={{ fontSize: '0.75rem', margin: '4px 0 0' }}>{gap.opportunity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={dashStyles.analysisCard} style={{ background: 'linear-gradient(135deg, rgba(0,235,168,0.05) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(0,235,168,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ fontSize: '2rem' }}>💎</div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>"How to Win" Strategic Playbook</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Roadmap for {data.intel.niche}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Content Pillars</div>
                                        {data.intel.strategicPlaybook.contentPillars.slice(0, 3).map((pillar, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                                <div style={{ minWidth: '18px', height: '18px', borderRadius: '4px', background: 'rgba(0,235,168,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>{i + 1}</div>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{pillar}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Entity Authority</div>
                                        {data.intel.strategicPlaybook.entityStrategy.slice(0, 2).map((step, i) => (
                                            <p key={i} style={{ fontSize: '0.75rem', marginBottom: '6px' }}>• {step}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '32px', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Is your brand ready for this niche?</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                                Run an AEO Readiness Audit to see if your infrastructure can capture this share of voice.
                            </p>
                            <button
                                className={dashStyles.onboardingButton}
                                style={{
                                    width: 'auto',
                                    padding: '16px 48px',
                                    background: 'var(--primary)',
                                    boxShadow: '0 0 20px rgba(0, 235, 168, 0.2)',
                                    border: '1px solid rgba(0, 235, 168, 0.3)'
                                }}
                                onClick={() => { window.location.href = '/desk/aeo/analysis'; }}
                            >
                                Check My Site's Readiness
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
