"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import dashStyles from '../dashboard/dashboard.module.css';
import { useTheme } from '@/components/ThemeProvider';
import { Icons } from '@/components/Sidebar';

interface OptimizationChunk {
    originalHeading: string;
    optimizedHeading: string;
    originalContent: string;
    optimizedContent: string;
    type: 'snippet' | 'conversational' | 'structural';
    implementationNotes: string;
}

interface OptimizationData {
    pageTitle: string;
    chunks: OptimizationChunk[];
    schema: {
        faq: any;
        organization: any;
        howTo?: any;
    };
    aiAssets: {
        vendorInfo: any;
        aiSummary: string;
    };
}

interface Project {
    id: string;
    domain: string;
    founder_id: string;
    created_at: string;
}

export default function AEOOptimizePage() {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OptimizationData | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [error, setError] = useState('');
    const [activeCodeTab, setActiveCodeTab] = useState<'faq' | 'org' | 'vendor' | 'summary'>('faq');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async (selectedId?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: projectsData } = await supabase
                .from('aeo_projects')
                .select('*')
                .eq('founder_id', user.id)
                .order('created_at', { ascending: false });

            setAllProjects(projectsData || []);

            if (projectsData && projectsData.length > 0) {
                const active = selectedId
                    ? projectsData.find((p: any) => p.id === selectedId) || projectsData[0]
                    : projectsData[0];
                setProject(active);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRunOptimization = async () => {
        if (!project) return;
        setLoading(true);
        setError('');
        setData(null);

        try {
            const response = await fetch('/api/aeo/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id })
            });

            if (!response.ok) throw new Error('Failed to generate optimizations');
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
        alert('Copied to clipboard!');
    };

    return (
        <div className={dashStyles.container}>
            <div className={dashStyles.header}>
                <div style={{ flex: 1 }}>
                    <select
                        className={dashStyles.projectDropdown}
                        value={project?.id || ''}
                        onChange={(e) => fetchInitialData(e.target.value)}
                    >
                        {allProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.domain}</option>
                        ))}
                    </select>
                    <p className={dashStyles.subtitle}>AEO Intelligence & Generation Engine</p>
                </div>

                <button
                    className={dashStyles.onboardingButton}
                    style={{ width: 'auto', padding: '12px 24px' }}
                    onClick={handleRunOptimization}
                    disabled={loading || !project}
                >
                    {loading ? 'Analyzing Content...' : '⚡ Run Optimization Scan'}
                </button>
            </div>

            <div style={{ marginTop: '24px' }}>
                {!data && !loading && (
                    <div className={dashStyles.emptyState} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '80px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠</div>
                        <h3>Optimizer Engine Offline</h3>
                        <p>Select a project and run the AEO scan to generate snippet-ready content and technical schema for AI agents.</p>
                    </div>
                )}

                {loading && (
                    <div className={dashStyles.emptyState} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '80px' }}>
                        <div className={dashStyles.spinner} style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', marginBottom: '20px' }}></div>
                        <h3>Generating Intelligence...</h3>
                        <p>Our AI architect is rewriting your copy into answer capsules and building structural schemas.</p>
                    </div>
                )}

                {data && (
                    <div className={dashStyles.animationFadeIn}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div style={{
                                background: 'linear-gradient(90deg, rgba(0,235,168,0.1) 0%, transparent 100%)',
                                border: '1px solid rgba(0,235,168,0.2)',
                                borderRadius: '12px',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                                <div>
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Target Page: {data.pageTitle}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>All optimizations are mapped to high-intent AI search patterns.</p>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>👔</span>
                                <div>
                                    <h3 style={{ fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Architect Role</h3>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '2px 0 0' }}>AEO Ghostwriter Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Optimizer: Before vs After */}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Icons.Edit /> Content "Snippification"
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
                            {data.chunks.map((chunk, i) => (
                                <div key={i} className={dashStyles.analysisCard} style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{
                                        padding: '12px 24px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--primary)', color: '#000', padding: '2px 8px', borderRadius: '4px' }}>
                                                {chunk.type.toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{chunk.optimizedHeading}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(chunk.optimizedContent)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                            COPY CAPSULE
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                                        <div style={{ padding: '24px', borderRight: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>Original (Buried)</div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{chunk.originalContent}</p>
                                        </div>
                                        <div style={{ padding: '24px', background: 'rgba(0, 235, 168, 0.02)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 800 }}>AEO Answer Capsule</div>
                                            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>{chunk.optimizedContent}</p>
                                            <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.7rem' }}>
                                                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Architect Note:</span> {chunk.implementationNotes}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Technical Architecture: Schema & Assets */}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Icons.Validation /> Technical Architecture
                        </h2>

                        <div className={dashStyles.grid} style={{ alignItems: 'flex-start' }}>
                            <div className={dashStyles.listCard}>
                                <div className={dashStyles.cardHeader} style={{ padding: '0 24px', height: '60px' }}>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <button
                                            className={`${dashStyles.viewTab} ${activeCodeTab === 'faq' ? dashStyles.activeViewTab : ''}`}
                                            style={{ fontSize: '0.7rem' }}
                                            onClick={() => setActiveCodeTab('faq')}
                                        >FAQ JSON-LD</button>
                                        <button
                                            className={`${dashStyles.viewTab} ${activeCodeTab === 'org' ? dashStyles.activeViewTab : ''}`}
                                            style={{ fontSize: '0.7rem' }}
                                            onClick={() => setActiveCodeTab('org')}
                                        >Organization</button>
                                        <button
                                            className={`${dashStyles.viewTab} ${activeCodeTab === 'vendor' ? dashStyles.activeViewTab : ''}`}
                                            style={{ fontSize: '0.7rem' }}
                                            onClick={() => setActiveCodeTab('vendor')}
                                        >AI Press Kit</button>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(
                                            activeCodeTab === 'faq' ? data.schema.faq :
                                                activeCodeTab === 'org' ? data.schema.organization :
                                                    activeCodeTab === 'vendor' ? data.aiAssets.vendorInfo :
                                                        data.aiAssets.aiSummary
                                        )}
                                        style={{ background: 'rgba(0,235,168,0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                    >COPY CODE</button>
                                </div>
                                <div style={{ padding: '24px', background: '#0a0a0a', minHeight: '300px' }}>
                                    <pre style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        color: '#00eba8',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.5
                                    }}>
                                        {activeCodeTab === 'faq' && JSON.stringify(data.schema.faq, null, 2)}
                                        {activeCodeTab === 'org' && JSON.stringify(data.schema.organization, null, 2)}
                                        {activeCodeTab === 'vendor' && JSON.stringify(data.aiAssets.vendorInfo, null, 2)}
                                        {activeCodeTab === 'summary' && data.aiAssets.aiSummary}
                                    </pre>
                                </div>
                            </div>

                            <div className={dashStyles.listCard} style={{ background: 'var(--surface)' }}>
                                <div className={dashStyles.cardHeader}>
                                    <h3>AEO Implementation Delivery</h3>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,235,168,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                                            <span style={{ fontWeight: 600 }}>Manual Deployment</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '44px' }}>
                                            Copy the "Answer Capsules" into your CMS and paste the JSON-LD code into your page's &lt;head&gt; section.
                                        </p>
                                    </div>

                                    <div style={{ opacity: 0.6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                                            <span style={{ fontWeight: 600 }}>One-Click Integration</span>
                                            <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--border)', color: 'var(--text-muted)' }}>COMING SOON</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginLeft: '44px' }}>
                                            <button disabled style={{ padding: '8px 16px', background: 'var(--border)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', cursor: 'not-allowed' }}>WordPress Plugin</button>
                                            <button disabled style={{ padding: '8px 16px', background: 'var(--border)', border: 'none', borderRadius: '8px', fontSize: '0.75rem', cursor: 'not-allowed' }}>Shopify App</button>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                        <h4 style={{ fontSize: '0.8rem', marginBottom: '8px', color: 'var(--primary)' }}>AI Asset Hosting</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                            For maximum authority, upload the <strong>vendor-info.json</strong> file to your site root (e.g. yoursite.com/vendor-info.json). This allows AI agents to verify your brand entity directly from the source.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
