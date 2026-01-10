"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dashStyles from './dashboard.module.css';
import { useTheme } from '@/components/ThemeProvider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
}

interface Project {
    id: string;
    domain: string;
    founder_id: string;
    created_at: string;
}

export default function AEODashboardPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState<string | null>(null);
    const [addingKeyword, setAddingKeyword] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [data, setData] = useState<InsightsResponse | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(0);
    const [timeframe, setTimeframe] = useState('6m');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async (selectedId?: string) => {
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
            setSelectedKeywordIndex(0);

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
            router.push('/desk/aeo/analysis');
        } else {
            fetchDashboardData(value);
        }
    };

    const handleTimeframeChange = async (newTimeframe: string) => {
        setTimeframe(newTimeframe);
        if (data && data.trends[selectedKeywordIndex]) {
            const keyword = data.trends[selectedKeywordIndex].keyword;
            await refreshTrendData(keyword, newTimeframe);
        }
    };

    const refreshTrendData = async (keyword: string, tf: string) => {
        setLoadingTab(keyword);
        try {
            const response = await fetch('/api/aeo/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, timeframe: tf })
            });

            if (response.ok) {
                const { trend: newTrend } = await response.json();
                if (newTrend && data) {
                    const updatedTrends = [...data.trends];
                    const idx = updatedTrends.findIndex(t => t.keyword === keyword);
                    if (idx !== -1) {
                        updatedTrends[idx] = { ...newTrend, loaded: true };
                        setData({ ...data, trends: updatedTrends });
                    }
                }
            }
        } catch (err) {
            console.error('Timeframe refresh failed', err);
        } finally {
            setLoadingTab(null);
        }
    };

    const handleTabClick = async (index: number) => {
        if (!data) return;
        setSelectedKeywordIndex(index);
        const trend = data.trends[index];

        if (!trend.loaded && !trend.error) {
            setLoadingTab(trend.keyword);
            try {
                const response = await fetch('/api/aeo/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keyword: trend.keyword, timeframe })
                });

                if (response.ok) {
                    const { trend: newTrend } = await response.json();
                    if (newTrend) {
                        const updatedTrends = [...data.trends];
                        updatedTrends[index] = { ...newTrend, loaded: true };
                        setData({ ...data, trends: updatedTrends });
                    }
                }
            } catch (err) {
                console.error('Lazy load failed', err);
            } finally {
                setLoadingTab(null);
            }
        }
    };

    const handleOpportunityClick = async (keyword: string) => {
        if (!data) return;
        const existingIdx = data.trends.findIndex(t => t.keyword === keyword);
        if (existingIdx !== -1) {
            handleTabClick(existingIdx);
            return;
        }

        setAddingKeyword(keyword);
        try {
            const response = await fetch('/api/aeo/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, timeframe })
            });

            if (!response.ok) throw new Error('Failed to fetch keyword data');

            const { trend } = await response.json();
            if (trend) {
                const newTrend = { ...trend, loaded: true };
                const newTrends = [...data.trends, newTrend];
                setData({ ...data, trends: newTrends });
                setSelectedKeywordIndex(newTrends.length - 1);
            }
        } catch (err) {
            console.error('Failed to add keyword:', err);
        } finally {
            setAddingKeyword(null);
        }
    };

    const renderChart = (trend: TrendData, height: number = 300) => (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={trend.timeline}>
                <defs>
                    <linearGradient id="dashboardChartGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="value" stroke="#00eba8" strokeWidth={3} fillOpacity={1} fill="url(#dashboardChartGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    );

    if (loading) {
        return (
            <div className={dashStyles.container} style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #00eba8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Deep Researching Market Trends...</p>
                <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className={dashStyles.container} style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#ef4444' }}>Unable to load niche data</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
                <button onClick={() => fetchDashboardData(project?.id)} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Try Again
                </button>
            </div>
        );
    }

    const currentTrend = data?.trends[selectedKeywordIndex];
    const isLazyLoading = loadingTab === currentTrend?.keyword;

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
                        Intelligence for <strong>{data?.industry || 'Unknown'} / {data?.niche || 'Unknown'}</strong>
                    </p>
                </div>
                <button
                    onClick={toggleTheme}
                    className={dashStyles.themeToggle}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="animate-fade-in" style={{ marginTop: '24px' }}>
                {!project ? (
                    <div className={dashStyles.emptyState} style={{ marginTop: '80px' }}>
                        <h3>No projects found</h3>
                        <p>Go to the <strong>Analysis & Audit</strong> tab to add your first website.</p>
                        <button
                            onClick={() => router.push('/desk/aeo/analysis')}
                            style={{
                                marginTop: '20px',
                                padding: '12px 24px',
                                background: 'var(--primary)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Go to Analysis
                        </button>
                    </div>
                ) : data && (
                    <>
                        <div className={dashStyles.tabsContainer}>
                            {data.trends.map((trend, idx) => (
                                <button
                                    key={trend.keyword}
                                    className={`${dashStyles.tab} ${idx === selectedKeywordIndex ? dashStyles.activeTab : ''}`}
                                    onClick={() => handleTabClick(idx)}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                        <span style={{ fontWeight: idx === selectedKeywordIndex ? 600 : 500 }}>{trend.keyword}</span>
                                        {trend.performanceIndex ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '0.65rem', color: idx === selectedKeywordIndex ? '#050505' : 'var(--text-muted)', opacity: 0.8 }}>
                                                    Score: {Math.round(trend.performanceIndex)}
                                                </span>
                                                {idx === 0 && (
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        padding: '1px 6px',
                                                        background: idx === selectedKeywordIndex ? 'rgba(0,0,0,0.15)' : 'rgba(0, 235, 168, 0.1)',
                                                        color: idx === selectedKeywordIndex ? '#000' : 'var(--primary)',
                                                        borderRadius: '4px',
                                                        fontWeight: 700
                                                    }}>
                                                        BEST
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.65rem', color: idx === selectedKeywordIndex ? '#050505' : 'var(--text-muted)', opacity: 0.6 }}>Analyzing...</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className={dashStyles.chartCard}>
                            <div className={dashStyles.cardHeader}>
                                <div>
                                    <h3>Market Interest Index: "{currentTrend?.keyword}"</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '4px 0 0 0' }}>Past 12 months • Global Topic Views</p>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['1m', '3m', '6m', '1y', '5y', '10y'].map((tf) => (
                                        <button
                                            key={tf}
                                            onClick={() => handleTimeframeChange(tf)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                border: '1px solid',
                                                borderColor: timeframe === tf ? 'var(--primary)' : 'var(--border)',
                                                background: timeframe === tf ? 'var(--primary)' : 'var(--surface)',
                                                color: timeframe === tf ? '#050505' : 'var(--foreground)',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            {tf.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={dashStyles.chartContainer}>
                                {isLazyLoading ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className={dashStyles.smallSpinner} style={{ width: '24px', height: '24px', borderTopColor: '#3b82f6' }}></div>
                                        <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.875rem' }}>Fetching live data...</p>
                                    </div>
                                ) : currentTrend?.error ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '10px', opacity: 0.5 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        <p style={{ fontWeight: 500 }}>Topic data unavailable</p>
                                        <p style={{ fontSize: '0.875rem' }}>We could not match this keyword to a verified public topic.</p>
                                    </div>
                                ) : !currentTrend?.loaded ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
                                ) : (
                                    currentTrend && renderChart(currentTrend)
                                )}
                            </div>
                        </div>

                        {data.opportunities && data.opportunities.length > 0 && (
                            <div className={dashStyles.opportunitiesSection}>
                                <h3 className={dashStyles.sectionTitle}>🔥 Recommended High-Traffic Keywords</h3>
                                <div className={dashStyles.chipsGrid}>
                                    {data.opportunities.map((opp, i) => (
                                        <button
                                            key={i}
                                            className={dashStyles.oppChip}
                                            onClick={() => handleOpportunityClick(opp)}
                                            disabled={addingKeyword === opp}
                                        >
                                            {addingKeyword === opp ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span className={dashStyles.smallSpinner}></span> Loading...
                                                </span>
                                            ) : (
                                                <>
                                                    <span className={dashStyles.plusIcon}>+</span>
                                                    {opp}
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={dashStyles.grid}>
                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>Related Topics</h3>
                                </div>
                                {isLazyLoading ? (
                                    <div className={dashStyles.list} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading topics...</div>
                                ) : !currentTrend?.error && currentTrend?.relatedTopics && currentTrend.relatedTopics.length > 0 ? (
                                    <div className={dashStyles.list}>
                                        {currentTrend.relatedTopics.map((topic, i) => (
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
                                        ))}
                                    </div>
                                ) : (
                                    <div className={dashStyles.emptyState}>No related topics data available.</div>
                                )}
                            </div>

                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>Breakout Queries</h3>
                                </div>
                                {isLazyLoading ? (
                                    <div className={dashStyles.list} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading queries...</div>
                                ) : !currentTrend?.error && currentTrend?.relatedQueries && currentTrend.relatedQueries.length > 0 ? (
                                    <div className={dashStyles.list}>
                                        {currentTrend.relatedQueries.map((query, i) => (
                                            <div key={i} className={dashStyles.listItem}>
                                                <span className={dashStyles.rank}>{i + 1}</span>
                                                <div className={dashStyles.itemContent}>
                                                    <span className={dashStyles.itemTitle}>{query.query}</span>
                                                </div>
                                                <span className={dashStyles.badge} data-status={query.status} style={{ fontWeight: 600 }}>
                                                    {query.status === 'Breakout' ? '🚀 Breakout' : `+${query.value}%`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={dashStyles.emptyState}>No query data available.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
