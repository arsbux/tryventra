"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../page.module.css';
import analyticsStyles from './analytics.module.css';
import {
    Users,
    MousePointer2,
    Clock,
    Globe,
    ChevronDown,
    RefreshCcw,
    Calendar,
    ArrowUpRight,
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink,
    Code,
    Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [founderId, setFounderId] = useState<string | null>(null);
    const [showTag, setShowTag] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    // Stats State
    const [stats, setStats] = useState({
        totalVisitors: 0,
        bounceRate: "0%",
        avgSession: "0s",
        activeNow: 0
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setFounderId(user.id);
            fetchRealStats(user.id);
        }
    };

    const fetchRealStats = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('website_events')
                .select('*')
                .eq('founder_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
            processStats(data || []);
            processChartData(data || []);
        } catch (err) {
            console.error("Error fetching real analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (allEvents: any[]) => {
        // Group by hour for the last 24 hours
        const last24h = Array.from({ length: 24 }, (_, i) => {
            const d = new Date();
            d.setHours(d.getHours() - i);
            d.setMinutes(0, 0, 0);
            return {
                timestamp: d.toISOString(),
                label: d.getHours() + ":00",
                value: 0
            };
        }).reverse();

        allEvents.forEach(e => {
            const eDate = new Date(e.created_at);
            const eHourST = new Date(eDate);
            eHourST.setMinutes(0, 0, 0);
            eHourST.setSeconds(0, 0);
            const iso = eHourST.toISOString();
            const point = last24h.find(p => p.timestamp === iso);
            if (point) point.value++;
        });

        setChartData(last24h);
    };

    const processStats = (allEvents: any[]) => {
        if (allEvents.length === 0) return;

        // 1. Total Unique Visitors
        const visitors = new Set(allEvents.map(e => e.visitor_id)).size;

        // 2. Active Now (last 5 mins)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const active = new Set(allEvents.filter(e => e.created_at > fiveMinsAgo).map(e => e.visitor_id)).size;

        // 3. Bounce Rate & Session Time
        const sessions = allEvents.reduce((acc: any, e) => {
            if (!acc[e.session_id]) acc[e.session_id] = [];
            acc[e.session_id].push(e);
            return acc;
        }, {});

        const sessionList = Object.values(sessions) as any[][];
        const bouncedSessions = sessionList.filter(s => s.length === 1).length;
        const bRate = ((bouncedSessions / (sessionList.length || 1)) * 100).toFixed(1) + "%";

        let totalDuration = 0;
        sessionList.forEach(s => {
            if (s.length > 1) {
                const start = new Date(s[s.length - 1].created_at).getTime();
                const end = new Date(s[0].created_at).getTime();
                totalDuration += (end - start);
            }
        });
        const avgSecs = Math.round((totalDuration / (sessionList.length || 1)) / 1000);
        const avgDisplay = avgSecs > 60 ? `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s` : `${avgSecs}s`;

        setStats({
            totalVisitors: visitors,
            activeNow: active,
            bounceRate: bRate,
            avgSession: avgDisplay
        });
    };

    const getTopList = (key: string, limit = 5) => {
        const counts: any = {};
        events.forEach(e => {
            const val = e[key] || 'Unknown';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, limit);
    };

    const getGeoList = (limit = 3) => {
        const counts: any = {};
        events.forEach(e => {
            const g = e.metadata?.geo;
            if (g && g.country !== 'Unknown') {
                const key = `${g.flag} ${g.country}`;
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort((a: any, b: any) => b[1] - a[1])
            .slice(0, limit);
    };

    const trackingTag = `<script 
  defer 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/track.js" 
  data-id="${founderId || 'YOUR_ID'}"
></script>`;

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 235, 168, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1.1s linear infinite' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initializing Visitor Intelligence...</p>
            <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (events.length === 0) {
        return (
            <div className={analyticsStyles.container}>
                <div className={styles.topHeader}>
                    <div>
                        <h1 className={styles.title}>Visitor Intelligence</h1>
                        <p className={styles.subtitle}>No visitor signals detected yet.</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--surface)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(0, 235, 168, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(0, 235, 168, 0.2)' }}>
                            <Code size={32} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Enable Real-time Tracking</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 32px' }}>
                        Paste the snippet below into your website's <code>&lt;head&gt;</code> to start scouting visitor intent in real-time.
                    </p>
                    <div className={analyticsStyles.tagBox} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        <div className={analyticsStyles.tagHeader}>
                            <h4 style={{ color: 'var(--foreground)' }}>Tracking Snippet</h4>
                            <button onClick={() => {
                                navigator.clipboard.writeText(trackingTag);
                                alert("Snippet copied to clipboard!");
                            }}>Copy</button>
                        </div>
                        <pre className={analyticsStyles.codeBlock}><code>{trackingTag}</code></pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={analyticsStyles.container}>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Visitor Intelligence</h1>
                    <p className={styles.subtitle}>Deep-scan tracking for your digital infrastructure</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={styles.secondaryButton}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.85rem', fontWeight: 600 }}
                        onClick={() => setShowTag(!showTag)}
                    >
                        <Code size={16} />
                        Tracking Tag
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'rgba(0, 235, 168, 0.1)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(0, 235, 168, 0.2)' }}>
                        <Zap size={16} fill="var(--primary)" />
                        Real-time Scout
                    </div>
                </div>
            </div>

            {showTag && (
                <div className={analyticsStyles.tagBox} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className={analyticsStyles.tagHeader}>
                        <h4 style={{ color: 'var(--foreground)' }}>Deployment Snippet</h4>
                        <button onClick={() => {
                            navigator.clipboard.writeText(trackingTag);
                            alert("Copied!");
                        }}>Copy Code</button>
                    </div>
                    <pre className={analyticsStyles.codeBlock}>
                        <code>{trackingTag}</code>
                    </pre>
                </div>
            )}

            {/* Stats Overview */}
            <div className={analyticsStyles.statsGrid}>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <Users size={16} />
                        <span>Unique Visitors</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.totalVisitors.toLocaleString()}</div>
                    <div className={analyticsStyles.statTrend} style={{ color: 'var(--primary)' }}>
                        <span>Total scouts identities</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <MousePointer2 size={16} />
                        <span>Engagement Rank</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.bounceRate}</div>
                    <div className={analyticsStyles.statTrend} style={{ color: '#ef4444' }}>
                        <span>Clickthrough dropoff</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <Clock size={16} />
                        <span>Session Depth</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.avgSession}</div>
                    <div className={analyticsStyles.statTrend} style={{ color: 'var(--primary)' }}>
                        <span>Avg attention span</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <div className={analyticsStyles.pulseIndicator}></div>
                        <span>Active Intel</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.activeNow}</div>
                    <div className={analyticsStyles.statTrend} style={{ color: 'var(--primary)' }}>
                        <span>Live signals detected</span>
                    </div>
                </div>
            </div>

            {/* Recharts Analytics */}
            <div className={analyticsStyles.chartSection}>
                <div className={analyticsStyles.chartHeader}>
                    <h4>Traffic Intelligence Velocity</h4>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                        <span style={{ color: 'var(--primary)' }}>●</span> Event Frequency (24H)
                    </div>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                            />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.8rem' }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVis)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Breakdowns */}
            <div className={analyticsStyles.detailsGrid}>
                <div className={analyticsStyles.detailCard}>
                    <h5>Referral Intel</h5>
                    <div className={analyticsStyles.list}>
                        {getTopList('referrer').map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className={analyticsStyles.listLabel} style={{ color: 'var(--foreground)' }}>{label}</span>
                                    <span className={analyticsStyles.listValue} style={{ color: 'var(--primary)' }}>{count}</span>
                                </div>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Path Popularity</h5>
                    <div className={analyticsStyles.list}>
                        {getTopList('path').map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className={analyticsStyles.listLabel} style={{ color: 'var(--foreground)' }}>{label}</span>
                                    <span className={analyticsStyles.listValue} style={{ color: 'var(--primary)' }}>{count}</span>
                                </div>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Geographic Corridors</h5>
                    <div className={analyticsStyles.list}>
                        {getGeoList().map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className={analyticsStyles.listLabel} style={{ color: 'var(--foreground)' }}>{label}</span>
                                    <span className={analyticsStyles.listValue} style={{ color: 'var(--primary)' }}>{count}</span>
                                </div>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Device Fingerprinting</h5>
                    <div className={analyticsStyles.deviceGrid}>
                        {getTopList('device_type', 3).map(([type, count]: any) => (
                            <div key={type} className={analyticsStyles.deviceItem}>
                                {type === 'desktop' ? <Monitor size={18} color="var(--primary)" /> : <Smartphone size={18} color="var(--primary)" />}
                                <div className={analyticsStyles.deviceInfo}>
                                    <span className={analyticsStyles.deviceLabel} style={{ color: 'var(--foreground)' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    <span className={analyticsStyles.devicePercent}>{Math.round((count / events.length) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Individual Session Level Tracking */}
            <div className={analyticsStyles.sessionSection}>
                <div className={analyticsStyles.chartHeader}>
                    <h4>Live Signal Feed</h4>
                    <span className={analyticsStyles.sessionBadge} style={{ background: 'rgba(0, 235, 168, 0.1)', color: 'var(--primary)', border: '1px solid rgba(0, 235, 168, 0.2)' }}>Intelligence-Active</span>
                </div>
                <div className={analyticsStyles.sessionTableWrapper}>
                    <table className={analyticsStyles.sessionTable}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SCOUT ID</th>
                                <th style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LOCATION</th>
                                <th style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ACTION</th>
                                <th style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DESTINATION</th>
                                <th style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>TIMESTAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.slice(0, 15).map((e, i) => (
                                <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className={analyticsStyles.visitorId} style={{ opacity: 0.8 }}>{e.visitor_id.substring(0, 8).toUpperCase()}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{e.metadata?.geo?.flag || '🌐'} {e.metadata?.geo?.country || 'Unknown'}</td>
                                    <td><span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(0, 235, 168, 0.05)', padding: '4px 8px', borderRadius: '4px' }}>{e.event_name}</span></td>
                                    <td><span className={analyticsStyles.pathTag}>{e.path}</span></td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
