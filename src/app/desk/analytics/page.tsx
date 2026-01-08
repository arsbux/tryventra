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
    Code
} from 'lucide-react';

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [founderId, setFounderId] = useState<string | null>(null);
    const [showTag, setShowTag] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

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
        } catch (err) {
            console.error("Error fetching real analytics:", err);
        } finally {
            setLoading(false);
        }
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
        const bRate = ((bouncedSessions / sessionList.length) * 100).toFixed(1) + "%";

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

    if (loading) return <div className={styles.centered}><div className={styles.spinner}></div></div>;

    if (events.length === 0) {
        return (
            <div className={analyticsStyles.container}>
                <div className={styles.topHeader}>
                    <div>
                        <h1 className={styles.title}>Web Analytics</h1>
                        <p className={styles.subtitle}>No data detected yet.</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'white', borderRadius: '32px', border: '1px dashed #ddd' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                            <Code size={32} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Start Tracking Your Website</h2>
                    <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto 32px' }}>
                        You haven't added the tracking tag to your site yet, or we're still waiting for your first visitor. Paste the code below to start.
                    </p>
                    <div className={analyticsStyles.tagBox} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        <div className={analyticsStyles.tagHeader}>
                            <h4>Tracking Tag</h4>
                            <button onClick={() => {
                                navigator.clipboard.writeText(trackingTag);
                                alert("Copied!");
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
                    <h1 className={styles.title}>Web Analytics</h1>
                    <p className={styles.subtitle}>Live tracking for your decentralized websites</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={styles.secondaryButton}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                        onClick={() => setShowTag(!showTag)}
                    >
                        <Code size={18} />
                        Code Tag
                    </button>
                    <div className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
                        <Calendar size={18} />
                        Real-time Data
                    </div>
                </div>
            </div>

            {showTag && (
                <div className={analyticsStyles.tagBox}>
                    <div className={analyticsStyles.tagHeader}>
                        <h4>Tracking Tag</h4>
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
                        <span>Visitors</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.totalVisitors.toLocaleString()}</div>
                    <div className={analyticsStyles.statTrend}>
                        <span>Total unique visitors</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <MousePointer2 size={16} />
                        <span>Bounce Rate</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.bounceRate}</div>
                    <div className={analyticsStyles.statTrend}>
                        <span>Single-page sessions</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <Clock size={16} />
                        <span>Avg. Session</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.avgSession}</div>
                    <div className={analyticsStyles.statTrend}>
                        <span>Time per visit</span>
                    </div>
                </div>
                <div className={analyticsStyles.statCard}>
                    <div className={analyticsStyles.statLabel}>
                        <div className={analyticsStyles.pulseIndicator}></div>
                        <span>Active Now</span>
                    </div>
                    <div className={analyticsStyles.statValue}>{stats.activeNow}</div>
                    <div className={analyticsStyles.statTrend}>
                        <span>Last 5 minutes</span>
                    </div>
                </div>
            </div>

            {/* Simple Visual Chart */}
            <div className={analyticsStyles.chartSection}>
                <div className={analyticsStyles.chartHeader}>
                    <h4>Traffic Velocity</h4>
                </div>
                <div className={analyticsStyles.chartPlaceholder}>
                    <svg viewBox="0 0 1000 300" className={analyticsStyles.svgChart}>
                        <path
                            d="M0 280 Q 200 270, 400 250 T 700 180 T 1000 220"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="3"
                        />
                    </svg>
                </div>
            </div>

            {/* Detailed Breakdowns */}
            <div className={analyticsStyles.detailsGrid}>
                <div className={analyticsStyles.detailCard}>
                    <h5>Top Referrers</h5>
                    <div className={analyticsStyles.list}>
                        {getTopList('referrer').map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <span className={analyticsStyles.listLabel}>{label}</span>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%`, opacity: 0.3 }}></div>
                                    <span className={analyticsStyles.listValue}>{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Top Pages</h5>
                    <div className={analyticsStyles.list}>
                        {getTopList('path').map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <span className={analyticsStyles.listLabel}>{label}</span>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%`, background: '#10b981', opacity: 0.3 }}></div>
                                    <span className={analyticsStyles.listValue}>{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Top Locations</h5>
                    <div className={analyticsStyles.list}>
                        {getGeoList().map(([label, count]: any) => (
                            <div key={label} className={analyticsStyles.listItem}>
                                <span className={analyticsStyles.listLabel}>{label}</span>
                                <div className={analyticsStyles.listBarWrapper}>
                                    <div className={analyticsStyles.listBar} style={{ width: `${(count / events.length) * 100}%`, background: '#f59e0b', opacity: 0.3 }}></div>
                                    <span className={analyticsStyles.listValue}>{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={analyticsStyles.detailCard}>
                    <h5>Devices</h5>
                    <div className={analyticsStyles.deviceGrid}>
                        {getTopList('device_type', 3).map(([type, count]: any) => (
                            <div key={type} className={analyticsStyles.deviceItem}>
                                {type === 'desktop' ? <Monitor size={18} /> : <Smartphone size={18} />}
                                <div className={analyticsStyles.deviceInfo}>
                                    <span className={analyticsStyles.deviceLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
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
                    <h4>Recent Activity</h4>
                    <span className={analyticsStyles.sessionBadge}>Live</span>
                </div>
                <div className={analyticsStyles.sessionTableWrapper}>
                    <table className={analyticsStyles.sessionTable}>
                        <thead>
                            <tr>
                                <th>Visitor</th>
                                <th>Location</th>
                                <th>Event</th>
                                <th>Page</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.slice(0, 10).map((e, i) => (
                                <tr key={e.id}>
                                    <td className={analyticsStyles.visitorId}>{e.visitor_id.substring(0, 8)}...</td>
                                    <td>{e.metadata?.geo?.flag || '🌐'} {e.metadata?.geo?.country || 'Unknown'}</td>
                                    <td><span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{e.event_name}</span></td>
                                    <td><span className={analyticsStyles.pathTag}>{e.path}</span></td>
                                    <td>{new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
