"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../legal.module.css';

export default function TermsPage() {
    return (
        <main className={styles.legalPage}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logoArea}>
                    <img src="/images/logo.png" alt="Ventra Logo" width="32" height="32" style={{ objectFit: 'contain' }} />
                    <span className={styles.logoText}>Ventra</span>
                </Link>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <Link href="/pricing" style={{ fontSize: '0.925rem', fontWeight: 500, color: '#666', textDecoration: 'none' }}>Pricing</Link>
                    <Link href="/login" className={styles.ctaSecondary} style={{ padding: '8px 20px', borderRadius: '40px', fontSize: '0.875rem' }}>Open App</Link>
                </div>
            </nav>

            <div className={styles.legalContainer}>
                <div className={styles.legalHeader}>
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last updated: January 6, 2026</p>
                </div>

                <div className={styles.content}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using Ventra AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

                    <h2>2. Description of Service</h2>
                    <p>Ventra AI provides an AI-powered lead generation and intent signal monitoring platform. We provide tools to identify potential business opportunities and contact information for decision-makers.</p>

                    <h2>3. Use of Data</h2>
                    <p>You agree to use the data provided by Ventra AI in compliance with all applicable laws, including but not limited to GDPR, CAN-SPAM Act, and local privacy regulations. You are solely responsible for your communication with any leads identified through the platform.</p>

                    <h2>4. Subscription and Payments</h2>
                    <ul>
                        <li>Starter Tier is a one-time purchase as described during checkout.</li>
                        <li>Growth and Agency tiers are recurring monthly subscriptions.</li>
                        <li>All sales are final unless otherwise required by law.</li>
                        <li>Pricing is subject to change, but existing subscribers will be notified in advance.</li>
                    </ul>

                    <h2>5. Restrictions</h2>
                    <p>You may not:</p>
                    <ul>
                        <li>Resell or redistribute the data provided by Ventra.</li>
                        <li>Use automated systems to scrape our platform.</li>
                        <li>Attempt to reverse engineer any of our AI models.</li>
                    </ul>

                    <h2>6. Termination</h2>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior toward our systems or staff.</p>

                    <h2>7. Limitation of Liability</h2>
                    <p>Ventra AI is provided "as is". We are not liable for any business decisions made, or deals lost or won, based on the information provided by our platform.</p>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerTop}>
                    <div>
                        <div className={styles.footerLogo}>
                            <img src="/images/logo.png" alt="Ventra Logo" width="32" height="32" />
                            Ventra
                        </div>
                        <p style={{ marginTop: '16px', color: '#666', maxWidth: '300px', fontSize: '0.9rem' }}>
                            Instantly scale your outreach and find your next best client with AI-powered lead intelligence.
                        </p>
                    </div>
                    <div className={styles.footerLinks}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <b style={{ color: '#000', fontSize: '0.9rem' }}>Product</b>
                            <Link href="/" className={styles.footerNavLink}>Lead Scout</Link>
                            <Link href="/" className={styles.footerNavLink}>Intent Signals</Link>
                            <Link href="/pricing" className={styles.footerNavLink}>Pricing</Link>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2026 Ventra AI. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <Link href="/privacy" className={styles.footerNavLink}>Privacy Policy</Link>
                        <Link href="/terms" className={styles.footerNavLink}>Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
