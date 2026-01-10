"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../legal.module.css';

export default function PrivacyPage() {
    return (
        <main className={styles.legalPage}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logoArea}>
                    <img src="/images/logo.svg" alt="Ventra Logo" width="32" height="32" style={{ objectFit: 'contain' }} />
                    <span className={styles.logoText}>Ventra</span>
                </Link>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <Link href="/pricing" style={{ fontSize: '0.925rem', fontWeight: 500, color: '#666', textDecoration: 'none' }}>Pricing</Link>
                    <Link href="/login" className={styles.ctaSecondary} style={{ padding: '8px 20px', borderRadius: '40px', fontSize: '0.875rem' }}>Open App</Link>
                </div>
            </nav>

            <div className={styles.legalContainer}>
                <div className={styles.legalHeader}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last updated: January 6, 2026</p>
                </div>

                <div className={styles.content}>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when creating an account, such as your name and email address. We also collect usage data when you interact with our platform.</p>

                    <h2>2. How We Use Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our services.</li>
                        <li>Process transactions and send related information.</li>
                        <li>Send technical notices, updates, and security alerts.</li>
                        <li>Respond to your comments and questions.</li>
                    </ul>

                    <h2>3. Data Handling for Leads</h2>
                    <p>Ventra AI aggregates publicly available business information to identify leads. We do not store private, non-business related personal data. Users are responsible for ensuring their use of lead data complies with their local jurisdiction's privacy laws.</p>

                    <h2>4. Data Security</h2>
                    <p>We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever 100% secure.</p>

                    <h2>5. Third-Party Services</h2>
                    <p>Our service may contain links to other websites. We are not responsible for the privacy practices of third-party sites. We use third-party processors for payments (e.g., Stripe).</p>

                    <h2>6. Your Choices</h2>
                    <p>You may update your account information at any time by logging into your account settings. You can also request the deletion of your account and personal data by contacting support.</p>

                    <h2>7. Cookies</h2>
                    <p>We use cookies to maintain your session and remember your preferences. You can disable cookies in your browser settings, but some features of the service may not function correctly.</p>
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerTop}>
                    <div>
                        <div className={styles.footerLogo}>
                            <img src="/images/logo.svg" alt="Ventra Logo" width="32" height="32" />
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
