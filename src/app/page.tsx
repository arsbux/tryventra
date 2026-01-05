"use client";

import Link from "next/link";
import styles from "./landing.module.css";
import React from "react";

import { LeadsTable, Lead } from "@/components/LeadsTable";
import DataFlowIllustration from "@/components/DataFlowIllustration";
import NicheShowcase from "@/components/NicheShowcase";
import AgentLiveDemo from "@/components/AgentLiveDemo";
import LeadsMarquee from "@/components/LeadsMarquee";

const DEMO_LEADS: Lead[] = [
    {
        id: "demo-1",
        title: "Stripe",
        link: "stripe.com",
        contact: "John Collison",
        email: "john@stripe.com",
        phone: "+1 415-xxx-xxxx",
        platform: "LinkedIn",
        status: "Prospect",
        insight: "Expanding payment infrastructure in Southeast Asia. High intent matching your core offering.",
        socials: "linkedin.com/in/john-collison",
        isStarred: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-2",
        title: "Airbnb",
        link: "airbnb.com",
        contact: "Brian Chesky",
        email: "brian@airbnb.com",
        phone: "+1 415-xxx-xxxx",
        platform: "Twitter",
        status: "Pitching",
        insight: "Modernizing cloud infrastructure and migrating to advanced edge computing solutions.",
        socials: "twitter.com/bchesky",
        isStarred: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-3",
        title: "Vercel",
        link: "vercel.com",
        contact: "Guillermo Rauch",
        email: "guillermo@vercel.com",
        phone: "+1 415-xxx-xxxx",
        platform: "Web",
        status: "Secured lead",
        insight: "Scaling enterprise division. Needs high-performance monitoring and observability tools.",
        socials: "linkedin.com/in/rauchg",
        isStarred: true,
        createdAt: new Date().toISOString()
    }
];

export default function LandingPage() {
    const [demoLeads, setDemoLeads] = React.useState(DEMO_LEADS);

    const handleUpdateLead = (id: string, field: string, value: any) => {
        setDemoLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgPattern}></div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.logoArea}>
                    <img src="/images/logo.png" alt="Ventra Logo" width="32" height="32" style={{ objectFit: 'contain' }} />
                    <span className={styles.logoText}>Ventra</span>
                </Link>
                <div className={styles.navLinks}>
                    <a href="#features" className={styles.navLink}>Lead Scout</a>
                    <a href="#signals" className={styles.navLink}>Intent Signals</a>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                </div>
                <div className={styles.authGroup}>
                    <Link href="/login" className={styles.loginBtn}>Log In</Link>
                    <Link href="/login" className={styles.signUpBtn}>Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.hiringBadge}>
                    <div className={styles.dot}></div>
                    We are hiring
                </div>

                <h1 className={styles.title}>
                    Do you need more <span>clients?</span>
                </h1>

                <p className={styles.subtitle}>
                    Track, discover, and engage your ideal customers with high-intent signals.
                    Monitor 100+ digital platforms in real-time to find your next closed deal.
                </p>

                <div className={styles.ctaGroup}>
                    <Link href="/login" className={styles.whiteBtn}>Talk to Sales</Link>
                    <Link href="/login" className={styles.blackBtn}>Start Free Trial</Link>
                </div>

                {/* Main Product Preview (The Table) */}
                <div className={styles.previewContainer}>
                    <img src="/images/table.png" alt="Ventra Dashboard" style={{ width: '100%', display: 'block' }} />
                </div>
            </header>

            {/* Data Flow Illustration */}
            <section style={{ background: '#fff' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>
                        From Noise to Qualified Pipeline
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '700px', margin: '0 auto 60px' }}>
                        Ventra's AI continuously monitors 100+ digital signals in real-time, automatically filtering millions of data points to deliver only the highest-intent leads.
                    </p>
                </div>
                <DataFlowIllustration />
            </section>

            {/* Feature Section 1: Lead Scout */}
            <section id="features" className={styles.featureSection}>
                <div className={styles.featureGrid}>
                    <div className={styles.featureContent}>
                        <h2>Find Warm Leads with Advanced Filters</h2>
                        <p>Access our B2B database of 250M+ contacts. Filter by intent, technology, and hiring signals to find the leads that are actually ready to buy.</p>
                        <div className={styles.benefitList}>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                250M+ Verified Contacts
                            </div>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                AI-Powered Prospecting
                            </div>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Verified Email & Phone
                            </div>
                        </div>
                    </div>
                    <div className={styles.featureImage} style={{ background: 'transparent', border: 'none' }}>
                        <NicheShowcase />
                    </div>
                </div>
            </section>

            {/* Feature Section 2: Intent Signals */}
            <section id="signals" className={styles.featureSection}>
                <div className={`${styles.featureGrid} ${styles.reverse}`}>
                    <div className={styles.featureImage}>
                        <img src="/images/tags.png" alt="Intent Signals" />
                    </div>
                    <div className={styles.featureContent}>
                        <h2>Target Buyers When They're Hot</h2>
                        <p>Ventra tracks digital body language across 50+ signals. Know exactly when a prospect visits your pricing page or searches for a competitor.</p>
                        <div className={styles.benefitList}>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Real-time Intent Tracking
                            </div>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Automated Alerts
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section 3: Company Analysis */}
            <section className={styles.featureSection}>
                <div className={styles.featureGrid}>
                    <div className={styles.featureContent}>
                        <h2>Deep Account & Company Intelligence</h2>
                        <p>Get a 360-degree view of your target accounts. Analyze hiring trends, technology stacks, and financial signals to personalize every touchpoint and win larger deals.</p>
                        <div className={styles.benefitList}>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Tech Stack Discovery
                            </div>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Organizational Mapping
                            </div>
                            <div className={styles.benefitItem}>
                                <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Financial Buying Power
                            </div>
                        </div>
                    </div>
                    <div className={styles.featureImage}>
                        <img src="/images/profile.png" alt="Company Analysis" />
                    </div>
                </div>
            </section>

            <AgentLiveDemo />
            <LeadsMarquee />

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerTop}>
                    <div>
                        <div className={styles.footerLogo}>
                            <img src="/images/logo.png" alt="Ventra Logo" width="32" height="32" />
                            Ventra
                        </div>
                        <p style={{ marginTop: '16px', color: '#666', maxWidth: '300px' }}>
                            Instantly scale your outreach and find your next best client with AI-powered lead intelligence.
                        </p>
                    </div>
                    <div className={styles.footerLinks}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <b style={{ color: '#000' }}>Product</b>
                            <a href="#" className={styles.navLink}>Lead Scout</a>
                            <a href="#" className={styles.navLink}>Intent Signals</a>
                            <a href="#" className={styles.navLink}>Pricing</a>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2026 Ventra AI. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <Link href="/privacy" className={styles.navLink}>Privacy Policy</Link>
                        <Link href="/terms" className={styles.navLink}>Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
