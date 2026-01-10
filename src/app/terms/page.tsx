"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../legal.module.css';

export default function TermsPage() {
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
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last updated: January 10, 2026</p>
                </div>

                <div className={styles.content}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By registering for, accessing, or using the Ventra AI platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you differ with these Terms, you must not use our Services. These Terms constitute a binding legal agreement between you and Ventra AI.</p>

                    <h2>2. Services Description</h2>
                    <p>Ventra AI provides Answer Engine Optimization (AEO) tools, market intelligence, and analytics software tailored for AI search visibility. We grant you a limited, non-exclusive, non-transferable license to use our Services for your internal business purposes, subject to these Terms.</p>

                    <h2>3. Account Registration</h2>
                    <p>To use our Services, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>

                    <h2>4. Subscription and Billing</h2>
                    <ul>
                        <li><strong>Subscription Terms:</strong> Services are offered on a subscription basis. You agree to pay the fees applicable to your selected plan.</li>
                        <li><strong>Billing Cycle:</strong> Subscriptions renew automatically at the end of each billing period unless canceled.</li>
                        <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings. Access will continue until the end of the current billing cycle.</li>
                        <li><strong>Refunds:</strong> Payments are generally non-refundable unless required by applicable law or specifically stated otherwise.</li>
                    </ul>

                    <h2>5. Acceptable Use and Restrictions</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Services for any illegal or unauthorized purpose.</li>
                        <li>Reverse engineer, decompile, or attempt to extract the source code of the software.</li>
                        <li>Use automated systems (bots, scrapers) to access the Services without permission.</li>
                        <li>Resell, sublicense, or redistribute the Services without our express written consent.</li>
                    </ul>

                    <h2>6. Intellectual Property</h2>
                    <p>Ventra AI retains all rights, title, and interest in and to the Services, including all related intellectual property rights. Your use of the Services does not grant you any ownership rights.</p>

                    <h2>7. Data and Analytics</h2>
                    <p>We may collect and analyze data relating to the provision, use, and performance of the Services. You grant us the right to use such data to improve and enhance the Services and for other development, diagnostic, and corrective purposes.</p>

                    <h2>8. Limitation of Liability</h2>
                    <p>To the maximum extent permitted by law, Ventra AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or related to your use of the Services.</p>

                    <h2>9. Modifications to Terms</h2>
                    <p>We may update these Terms from time to time. We will notify you of material changes by posting the new Terms on this page. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>

                    <h2>10. Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at support@tryventra.com.</p>
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
