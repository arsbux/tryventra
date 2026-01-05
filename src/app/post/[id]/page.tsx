"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { OutreachComposer } from "@/components/OutreachComposer";
import { Sidebar } from "@/components/Sidebar";
import homeStyles from "@/app/desk/page.module.css";

interface Analysis {
    companyName: string;
    companyOverview: string;
    website?: string;
    phone?: string;
    socials?: { linkedin?: string; twitter?: string };
    intentJustification: string;
    technicalGap: string[];
    prospects: {
        name: string;
        role: string;
        link: string;
        contactMethod: string;
        rationale: string;
    }[];
    outreachStrategy: string[];
    marketValue: string;
}

const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const url = searchParams.get("url");
    const title = searchParams.get("title");
    const platform = searchParams.get("platform");

    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProspectIndex, setSelectedProspectIndex] = useState<number | null>(null);
    const [showComposer, setShowComposer] = useState(false);

    useEffect(() => {
        async function fetchAnalysis() {
            if (!url) return;
            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url, title, platform }),
                });
                const data = await response.json();
                setAnalysis(data);
                if (data.prospects?.length > 0) {
                    setSelectedProspectIndex(0);
                }
            } catch (error) {
                console.error("Failed to fetch analysis:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalysis();
    }, [url, title, platform]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Executing Lead Enrichment...</p>
                    <p style={{ opacity: 0.5, marginTop: 12 }}>Identifying decision-makers & validating buyer intent</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className={styles.container}>
                <Link href="/desk" className={styles.backButton}>← Back to Research</Link>
                <h1>Research failed.</h1>
                <p>Could not retrieve intelligence for this lead signal.</p>
            </div>
        );
    }

    return (
        <div className={homeStyles.dashboardLayout}>
            <Sidebar />

            <main className={homeStyles.mainContent}>
                <div className={homeStyles.container}>
                    <Link href="/desk" className={styles.backButton}>← Back to Research</Link>

                    <header className={styles.header}>
                        <div style={{ marginBottom: 12 }}>
                            <span className={styles.platformTag}>{platform}</span>
                        </div>
                        <h1 className={styles.title}>{title}</h1>
                        <p className={styles.overviewText}>Target Organization: <span style={{ color: '#111827', fontWeight: 600 }}>{analysis.companyName}</span></p>
                    </header>

                    <div className={styles.grid}>
                        <div className={styles.mainContent}>
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>ORGANIZATION OVERVIEW</h2>
                                <div className={styles.card}>
                                    <p className={styles.overviewText}>
                                        <FormattedText text={analysis.companyOverview} />
                                    </p>
                                    <div style={{ marginTop: 24 }}>
                                        <h4 style={{ color: '#111827', marginBottom: 12, fontSize: '0.9rem' }}>INTENT JUSTIFICATION</h4>
                                        <p className={styles.overviewText}>
                                            <FormattedText text={analysis.intentJustification} />
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>TECHNICAL GAPS / OPPORTUNITIES</h2>
                                <ul className={styles.list}>
                                    {analysis.technicalGap?.map((gap, i) => (
                                        <li key={i} className={styles.listItem}>
                                            <span className={styles.listItemDot}>•</span>
                                            {gap}
                                        </li>
                                    )) || <p className={styles.overviewText}>No specific technical gaps identified.</p>}
                                </ul>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>OUTREACH ADVISORY</h2>
                                <div className={styles.list}>
                                    {analysis.outreachStrategy?.map((step, i) => (
                                        <div key={i} className={styles.winStrategyItem}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, display: 'block', marginBottom: 4 }}>STRATEGY {i + 1}</span>
                                            <p style={{ margin: 0 }}>
                                                <FormattedText text={step} />
                                            </p>
                                        </div>
                                    )) || <p className={styles.overviewText}>Strategic advisory currently unavailable.</p>}
                                </div>
                            </section>

                            {showComposer && selectedProspectIndex !== null && analysis.prospects.filter(p => p.link || p.contactMethod)[selectedProspectIndex] && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>AI OUTREACH COMPOSER</h2>
                                    <OutreachComposer
                                        companyName={analysis.companyName}
                                        signal={analysis.intentJustification}
                                        prospectName={analysis.prospects.filter(p => p.link || p.contactMethod)[selectedProspectIndex].name}
                                        prospectRole={analysis.prospects.filter(p => p.link || p.contactMethod)[selectedProspectIndex].role}
                                    />
                                </section>
                            )}
                        </div>

                        <aside className={styles.enrichmentSidebar}>
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>ENRICHED PROSPECTS</h2>
                                {analysis.prospects?.filter(p => p.link || p.contactMethod).map((person, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.contactCard} ${selectedProspectIndex === i ? styles.selectedContact : ''}`}
                                        onClick={() => setSelectedProspectIndex(i)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className={styles.contactName}>{person.name}</span>
                                        <span className={styles.contactRole}>{person.role}</span>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '8px 0' }}>
                                            <FormattedText text={person.rationale} />
                                        </p>
                                        <a
                                            href={person.link?.startsWith('http') ? person.link : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.contactLink}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {person.contactMethod === "LinkedIn" ? "LinkedIn Profile" : `Direct Info: ${person.contactMethod}`} →
                                        </a>
                                    </div>
                                )) || <p className={styles.overviewText}>No direct prospects identified.</p>}
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>CONTACT ASSETS</h2>
                                <div className={styles.contactAssetsCard}>
                                    {analysis.website && (
                                        <div className={styles.assetItem}>
                                            <span className={styles.assetIcon}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                            </span>
                                            <a href={analysis.website} target="_blank" rel="noopener noreferrer" className={styles.assetLink}>
                                                {analysis.website.replace('https://', '').replace('www.', '').split('/')[0]}
                                            </a>
                                        </div>
                                    )}
                                    {analysis.phone && (
                                        <div className={styles.assetItem}>
                                            <span className={styles.assetIcon}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                            </span>
                                            <span className={styles.assetValue}>{analysis.phone}</span>
                                        </div>
                                    )}
                                    {analysis.socials?.linkedin && (
                                        <div className={styles.assetItem}>
                                            <span className={styles.assetIcon}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                            </span>
                                            <a href={analysis.socials.linkedin} target="_blank" rel="noopener noreferrer" className={styles.assetLink}>LinkedIn Page</a>
                                        </div>
                                    )}
                                    {analysis.socials?.twitter && (
                                        <div className={styles.assetItem}>
                                            <span className={styles.assetIcon}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                            </span>
                                            <a href={analysis.socials.twitter} target="_blank" rel="noopener noreferrer" className={styles.assetLink}>Twitter Profile</a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>POTENTIAL DEAL SIZE</h2>
                                <div className={styles.financialCard}>
                                    <span className={styles.financialLabel}>ESTIMATED VALUE</span>
                                    <div className={styles.financialValue}>
                                        {analysis.marketValue}
                                    </div>
                                </div>
                            </section>

                            <div style={{ marginTop: 40 }}>
                                <button
                                    className={styles.button}
                                    onClick={() => setShowComposer(!showComposer)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: showComposer ? '#6b7280' : 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {showComposer ? "Hide Outreach Composer" : "Generate AI Personalization"}
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
