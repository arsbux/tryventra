"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dashStyles from '../dashboard/dashboard.module.css';
import { useTheme } from '@/components/ThemeProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
    keyword: string;
    timeline: { date: string; value: number }[];
    relatedTopics: { topic: string; value: number; type: string; status: string }[];
    relatedQueries: { query: string; value: number; status: string }[];
    averageInterest: number;
    performanceIndex?: number;
    error?: boolean;
    loaded?: boolean;
}

interface InsightsResponse {
    industry: string;
    niche: string;
    trends: TrendData[];
    opportunities: string[];
    aiReadinessScore: number;
    readinessPillars: {
        snippability: { score: number; feedback: string };
        structuredData: { score: number; feedback: string };
        discoverability: { score: number; feedback: string };
        authority: { score: number; feedback: string };
        freshness: { score: number; feedback: string };
    };
    citationMonitoring: {
        brand: number;
        competitors: { name: string; share: number }[];
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
            aiPressKit: boolean;
        };
        discoveryReadiness: {
            aiSitemap: boolean;
            indexStatus: string;
        };
        structuralReadability: {
            schemaPresence: boolean;
            entityEstablishment: boolean;
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

interface Project {
    id: string;
    domain: string;
    founder_id: string;
    created_at: string;
}

export default function AEOAnalysisPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState<InsightsResponse | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    // Onboarding state
    const [newDomain, setNewDomain] = useState('');
    const [crawling, setCrawling] = useState(false);
    const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);

    useEffect(() => {
        fetchAnalysisData();
    }, []);

    const fetchAnalysisData = async (selectedId?: string) => {
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: projectsData, error: projectsError } = await supabase
                .from('aeo_projects')
                .select('*')
                .eq('founder_id', user.id)
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;
            setAllProjects(projectsData || []);

            if (!projectsData || projectsData.length === 0) {
                setProject(null);
                setLoading(false);
                return;
            }

            const activeProject = selectedId
                ? projectsData.find((p: Project) => p.id === selectedId) || projectsData[0]
                : projectsData[0];

            setProject(activeProject);

            const response = await fetch('/api/aeo/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: activeProject.id })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch insights');
            }

            const insights: InsightsResponse = await response.json();
            setData(insights);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'ADD_NEW') {
            setProject(null);
            setData(null);
        } else {
            fetchAnalysisData(value);
        }
    };

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!newDomain || !user) return;

        setCrawling(true);
        try {
            const response = await fetch('/api/aeo/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: newDomain.replace(/^https?:\/\//, ''),
                    userId: user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Crawl failed');
            }
            const result = await response.json();

            await fetchAnalysisData(result.projectId);
            setNewDomain('');
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        } finally {
            setCrawling(false);
        }
    };

    const renderChart = (trend: TrendData, height: number = 240) => (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={trend.timeline}>
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00eba8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00eba8" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1a1a1a' : '#f1f3f4'} />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: theme === 'dark' ? '#5f6368' : '#9ca3af' }}
                    minTickGap={30}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: theme === 'dark' ? '#5f6368' : '#9ca3af' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0c0c0c' : '#ffffff',
                        border: `1px solid ${theme === 'dark' ? '#1a1a1a' : '#dadce0'}`,
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#fff' : '#000'
                    }}
                    itemStyle={{ color: '#00eba8' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00eba8" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );

    if (loading) {
        return (
            <div className={dashStyles.container} style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #00eba8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Running Deep Audit Analysis...</p>
                <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles.header}>
                <div>
                    <select
                        className={dashStyles.projectDropdown}
                        value={project?.id || 'ADD_NEW'}
                        onChange={handleProjectChange}
                    >
                        {allProjects.map((p: Project) => (
                            <option key={p.id} value={p.id}>{p.domain}</option>
                        ))}
                        <option value="ADD_NEW">+ Add New Website</option>
                    </select>
                    <p className={dashStyles.subtitle}>
                        Analysis Hub • {data?.industry || 'Audit Readiness'} / {data?.niche || 'Strategy'}
                    </p>
                </div>
                <button
                    onClick={toggleTheme}
                    className={dashStyles.themeToggle}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="animate-fade-in" style={{ marginTop: '32px' }}>
                {!project || !data ? (
                    <div className={dashStyles.analysisCard} style={{ maxWidth: '600px', margin: '40px auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(0, 235, 168, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" y1="22" x2="18" y2="18" /></svg>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Analyze New Website</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Enter a domain to run a full AI readiness audit.</p>
                        </div>

                        <form onSubmit={handleAddSite}>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Website URL</label>
                                <input
                                    type="text"
                                    placeholder="example.com"
                                    className={dashStyles.onboardingInput}
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    disabled={crawling}
                                />
                            </div>
                            <button
                                className={dashStyles.onboardingButton}
                                disabled={crawling || !newDomain}
                            >
                                {crawling ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        Analyzing Site...
                                    </div>
                                ) : 'Start Full Audit'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Strategy Summary Header */}
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Identification</span>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '4px 0' }}>{data.industry} • {data.niche}</h2>
                            </div>
                            <div className={dashStyles.nichePills}>
                                <span className={dashStyles.nichePill}>AEO Optimized</span>
                                <span className={dashStyles.nichePill}>Market Leader</span>
                            </div>
                        </div>

                        {/* Top Summary: Score & Basic Info */}
                        <div className={dashStyles.analysisGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className={dashStyles.analysisCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4>AI Readiness Score</h4>
                                    <div style={{ position: 'relative', width: '120px', height: '120px', marginTop: '10px' }}>
                                        <svg width="120" height="120" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                                            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="8"
                                                strokeDasharray={`${(data.aiReadinessScore / 100) * 339.29} 339.29`}
                                                strokeLinecap="round"
                                                style={{
                                                    transform: 'rotate(-90deg)',
                                                    transformOrigin: 'center',
                                                    transition: 'stroke-dasharray 1.5s ease-out'
                                                }}
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem', fontWeight: 800 }}>
                                            {data.aiReadinessScore}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { label: 'Snippability', value: data.readinessPillars.snippability.score },
                                        { label: 'Structured Data', value: data.readinessPillars.structuredData.score },
                                        { label: 'Discoverability', value: data.readinessPillars.discoverability.score },
                                        { label: 'Entity Authority', value: data.readinessPillars.authority.score },
                                        { label: 'Freshness', value: data.readinessPillars.freshness.score },
                                    ].map((pillar, i) => (
                                        <div key={i} style={{ fontSize: '0.65rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{pillar.label}</span>
                                                <span style={{ fontWeight: 700 }}>{pillar.value}%</span>
                                            </div>
                                            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pillar.value}%`, height: '100%', background: 'var(--primary)', opacity: 0.6 }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={dashStyles.analysisCard} style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                                <h4>Multi-Index Crawlability</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                    {[
                                        { name: 'Googlebot', status: data.crawlStats.multiBotAccessibility.googlebot },
                                        { name: 'Brave (Claude)', status: data.crawlStats.multiBotAccessibility.brave },
                                        { name: 'PerplexityBot', status: data.crawlStats.multiBotAccessibility.perplexity },
                                        { name: 'Bing (Copilot)', status: data.crawlStats.multiBotAccessibility.bing }
                                    ].map((bot, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                borderRadius: '50%',
                                                background: bot.status ? 'var(--primary)' : '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '8px',
                                                color: '#000'
                                            }}>
                                                {bot.status ? '✓' : '✗'}
                                            </div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bot.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>AI Technical Directives</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>llms.txt Standard</span>
                                            <span style={{ color: data.crawlStats.aiTechnicalDirectives.llmsTxt ? 'var(--primary)' : '#ef4444' }}>{data.crawlStats.aiTechnicalDirectives.llmsTxt ? 'VERIFIED' : 'MISSING'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '4px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>AI Press Kit</span>
                                            <span style={{ color: data.crawlStats.aiTechnicalDirectives.aiPressKit ? 'var(--primary)' : '#64748b' }}>{data.crawlStats.aiTechnicalDirectives.aiPressKit ? 'ACTIVE' : 'NONE'}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Structural Health</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: data.crawlStats.structuralReadability.schemaPresence ? 'var(--primary)' : '#64748b' }}></div>
                                            <span style={{ fontSize: '0.7rem' }}>Semantic Schema Detection</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: data.crawlStats.structuralReadability.entityEstablishment ? 'var(--primary)' : '#64748b' }}></div>
                                            <span style={{ fontSize: '0.7rem' }}>Brand Entity Discovery</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={dashStyles.analysisCard} style={{ minHeight: '320px' }}>
                                <h4>Citation Leaderboard</h4>
                                <div style={{ marginTop: '16px' }}>
                                    {(data.citationMonitoring.competitors || []).sort((a, b) => b.share - a.share).map((comp, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            marginBottom: '8px',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: i === 0 ? 'var(--primary)' : 'var(--border)',
                                                color: i === 0 ? '#000' : 'var(--text-muted)',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '12px'
                                            }}>
                                                {i + 1}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {comp.name}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{comp.share}%</span>
                                                </div>
                                                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${comp.share}%`,
                                                        height: '100%',
                                                        background: '#64748b'
                                                    }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Wins / Optimizations */}
                        <div style={{ marginTop: '24px' }}>
                            <div className={dashStyles.listCard} style={{ border: '1px solid rgba(0, 235, 168, 0.2)' }}>
                                <div className={dashStyles.cardHeader} style={{ background: 'linear-gradient(90deg, rgba(0,235,168,0.05) 0%, transparent 100%)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.25rem' }}>⚡</span>
                                        <div>
                                            <h3 style={{ color: 'var(--primary)' }}>AEO Strategic "Quick Wins"</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>High-impact optimizations to boost your AI Readiness Score immediately</p>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
                                    <div className={dashStyles.list}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Infrastructure Fixes</div>
                                        {[
                                            { action: 'Implement llms.txt', impact: 'CRITICAL', status: data.crawlStats.aiTechnicalDirectives.llmsTxt },
                                            { action: 'Fix PerplexityBot Access', impact: 'HIGH', status: data.crawlStats.multiBotAccessibility.perplexity },
                                            { action: 'Add AI Sitemap Indexing', impact: 'MEDIUM', status: data.crawlStats.discoveryReadiness.aiSitemap },
                                        ].map((win, i) => (
                                            <div key={i} className={dashStyles.listItem} style={{ border: 'none', background: 'rgba(255,255,255,0.02)', marginBottom: '8px', borderRadius: '8px', opacity: win.status ? 0.5 : 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                                    <span style={{ color: win.status ? 'var(--primary)' : '#64748b' }}>{win.status ? '✓' : '→'}</span>
                                                    <span style={{ fontSize: '0.75rem', textDecoration: win.status ? 'line-through' : 'none' }}>{win.action}</span>
                                                </div>
                                                {!win.status && <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: win.impact === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 235, 168, 0.1)', color: win.impact === 'CRITICAL' ? '#ef4444' : 'var(--primary)', fontWeight: 700 }}>{win.impact}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className={dashStyles.list}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Content Semantic Fixes</div>
                                        {[
                                            { action: 'Front-load Snippet Answers', pillar: 'Snippability', score: data.readinessPillars.snippability.score },
                                            { action: 'Deploy FAQ JSON-LD Schema', pillar: 'Structured Data', score: data.readinessPillars.structuredData.score },
                                            { action: 'Update Knowledge Graph Bylines', pillar: 'Entity Authority', score: data.readinessPillars.authority.score },
                                        ].map((win, i) => (
                                            <div key={i} className={dashStyles.listItem} style={{ border: 'none', background: 'rgba(255,255,255,0.02)', marginBottom: '8px', borderRadius: '8px', opacity: win.score > 80 ? 0.5 : 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                                    <span style={{ color: win.score > 80 ? 'var(--primary)' : '#64748b' }}>{win.score > 80 ? '✓' : '→'}</span>
                                                    <span style={{ fontSize: '0.75rem', textDecoration: win.score > 80 ? 'line-through' : 'none' }}>{win.action}</span>
                                                </div>
                                                {win.score <= 80 && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pillar: {win.pillar}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mid Section: Competitor Intel & Errors */}
                        <div className={dashStyles.grid} style={{ marginTop: '24px' }}>
                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <div>
                                        <h3>Competitor Intelligence</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>How you stack up in the Answer Engine</p>
                                    </div>
                                </div>
                                <div className={dashStyles.list}>
                                    {(data.competitorIntelligence?.competitors || []).length > 0 ? (data.competitorIntelligence.competitors || []).map((comp: any, i: number) => (
                                        <div key={i} className={dashStyles.listItem} style={{ padding: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{comp.name}</span>
                                                    <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'rgba(0, 235, 168, 0.1)', color: 'var(--primary)', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(0, 235, 168, 0.2)' }}>AUTH SCORE: {comp.authority}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '20px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Content Gap</span>
                                                        <div style={{ fontSize: '0.85rem' }}>{comp.gap}</div>
                                                    </div>
                                                    <div style={{ width: '120px' }}>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Format</span>
                                                        <div style={{ fontSize: '0.85rem' }}>{comp.format}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No competitor data analyzed.</div>}
                                </div>
                            </div>

                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <div>
                                        <h3>Crawl Health & Index Status</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time cross-index discovery monitoring</p>
                                    </div>
                                </div>
                                <div className={dashStyles.list}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Discovery Readiness</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--foreground)' }}>{data.crawlStats.discoveryReadiness.indexStatus}</p>
                                    </div>
                                    {(data.crawlStats.freshnessHealth.errors || []).length > 0 ? (data.crawlStats.freshnessHealth.errors || []).map((err: string, i: number) => (
                                        <div key={i} className={dashStyles.listItem}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '16px',
                                                fontSize: '14px',
                                                fontWeight: 800,
                                                border: '1px solid rgba(239, 68, 68, 0.2)'
                                            }}>!</div>
                                            <div className={dashStyles.itemContent}>
                                                <span className={dashStyles.itemTitle} style={{ fontSize: '0.9rem' }}>{err}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '60px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Zero Critical Errors</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Your infrastructure is perfectly optimized for AI discovery.</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Market Expansion Intel */}
                        <div style={{ marginTop: '24px' }}>
                            <div className={dashStyles.tabsContainer}>
                                {(data.trends || []).map((trend, idx) => (
                                    <button
                                        key={idx}
                                        className={`${dashStyles.tab} ${idx === selectedTrendIndex ? dashStyles.activeTab : ''}`}
                                        onClick={() => setSelectedTrendIndex(idx)}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                            <span style={{ fontWeight: idx === selectedTrendIndex ? 600 : 500 }}>{trend.keyword}</span>
                                            {trend.performanceIndex && (
                                                <span style={{ fontSize: '0.65rem', color: idx === selectedTrendIndex ? '#050505' : 'var(--text-muted)', opacity: 0.8 }}>
                                                    Score: {Math.round(trend.performanceIndex)}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className={dashStyles.grid} style={{ marginTop: '16px' }}>
                                <div className={dashStyles.listCard}>
                                    <div className={dashStyles.cardHeader}>
                                        <h3>Related AI Search Intents</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Queries and topics currently rising in relevance</p>
                                    </div>
                                    <div className={dashStyles.list}>
                                        {data.trends[selectedTrendIndex]?.relatedTopics && data.trends[selectedTrendIndex].relatedTopics.length > 0 ? (
                                            data.trends[selectedTrendIndex].relatedTopics.map((topic, i) => (
                                                <div key={i} className={dashStyles.listItem}>
                                                    <span className={dashStyles.rank}>{i + 1}</span>
                                                    <div className={dashStyles.itemContent}>
                                                        <span className={dashStyles.itemTitle}>{topic.topic}</span>
                                                        <span className={dashStyles.itemType}>{topic.type}</span>
                                                    </div>
                                                    <span className={dashStyles.badge} data-status={topic.status}>
                                                        {topic.status}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No intent data available for this trend.</div>
                                        )}
                                    </div>
                                </div>

                                <div className={dashStyles.listCard}>
                                    <div className={dashStyles.cardHeader}>
                                        <h3>Breakout AI Queries</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Direct searches showing exponential growth</p>
                                    </div>
                                    <div className={dashStyles.list}>
                                        {data.trends[selectedTrendIndex]?.relatedQueries && data.trends[selectedTrendIndex].relatedQueries.length > 0 ? (
                                            data.trends[selectedTrendIndex].relatedQueries.map((query, i) => (
                                                <div key={i} className={dashStyles.listItem}>
                                                    <span className={dashStyles.rank}>{i + 1}</span>
                                                    <div className={dashStyles.itemContent}>
                                                        <span className={dashStyles.itemTitle}>{query.query}</span>
                                                    </div>
                                                    <span className={dashStyles.badge} data-status={query.status} style={{ fontWeight: 600 }}>
                                                        {query.status === 'Breakout' ? '🚀 Breakout' : `+${query.value}%`}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No query data available for this trend.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Strategic Chart Focus */}
                        <div style={{ marginTop: '24px' }}>
                            <div className={dashStyles.chartCard}>
                                <div className={dashStyles.cardHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                        <h3 style={{ textTransform: 'capitalize' }}>{data.trends[selectedTrendIndex]?.keyword} Market Potential</h3>
                                    </div>
                                </div>
                                <div className={dashStyles.chartContainer} style={{ height: '320px' }}>
                                    {renderChart(data.trends[selectedTrendIndex], 280)}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
