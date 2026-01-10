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
                    <p className={styles.lastUpdated}>Last updated: January 10, 2026</p>
                </div>

                <div className={styles.content}>
                    <h2>1. Data We Collect</h2>
                    <p>We generally collect two types of data: Personal Data (such as name, email) that you provide to us, and Usage Data (such as log files, device information) automatically collected when you interact with our platform to improve service performance.</p>

                    <h2>2. How We Use Data</h2>
                    <p>Ventra AI uses your data to:</p>
                    <ul>
                        <li>Deliver, maintain, and optimize our products and services.</li>
                        <li>Process payments and manage subscriptions.</li>
                        <li>Communicate with you regarding updates, security alerts, and support.</li>
                        <li>Analyze usage trends to enhance user experience.</li>
                    </ul>

                    <h2>3. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal data. We may share data with trusted third-party service providers (e.g., payment processors, hosting services) who assist us in operating our Services, subject to confidentiality obligations. We may also disclose data if required by law.</p>

                    <h2>4. Data Retention</h2>
                    <p>We retain your personal data only as long as necessary to provide the Services and fulfill the purposes outlined in this policy, or as required by law. Upon account termination, we may retain certain data for legitimate business purposes or legal compliance.</p>

                    <h2>5. Security</h2>
                    <p>We employ industry-standard organizational and technical measures to protect your data against unauthorized access, alteration, disclosure, or destruction. While we strive to protect your data, no transmission over the internet is completely secure.</p>

                    <h2>6. User Rights</h2>
                    <p>You have the right to access, correct, or delete your personal data. You may do so directly through your account settings or by contacting our support team if you require assistance.</p>

                    <h2>7. Cookies and Tracking</h2>
                    <p>We use cookies and similar technologies to track activity on our Services and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

                    <h2>8. Changes to This Policy</h2>
                    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

                    <h2>9. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@tryventra.com.</p>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <b style={{ color: '#000', fontSize: '0.9rem' }}>Contact</b>
                            <a href="mailto:support@tryventra.com" className={styles.footerNavLink}>support@tryventra.com</a>
                            <a href="mailto:keith@tryventra.com" className={styles.footerNavLink}>keith@tryventra.com</a>
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
