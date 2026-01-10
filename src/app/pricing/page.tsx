"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../landing.module.css';
import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
    return (
        <div className={styles.page}>
            {/* Global Styles for correct font/background */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                body {
                  margin: 0;
                  background: #050505;
                }
            `}</style>

            {/* Navigation */}
            <div className={styles.navWrapper}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logoArea}>
                        <img src="/images/logo.svg" alt="Ventra" width="24" height="24" />
                        <span className={styles.logoText}>Ventra</span>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link href="/#platform" className={styles.navLink}>AEO Platform</Link>
                        <Link href="/#market-radar" className={styles.navLink}>Market Radar</Link>
                        <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                        <Link href="/#intelligence" className={styles.navLink}>Intelligence</Link>
                    </div>

                    <Link href="/login" className={styles.bookBtn}>
                        Get Started
                    </Link>
                </nav>
            </div>

            <div style={{ paddingTop: '80px' }}>
                <PricingSection />
            </div>

            {/* Footer */}
            <footer style={{ padding: '80px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div className={styles.container}>
                    <div className={styles.logoArea} style={{ justifyContent: 'center', marginBottom: '24px' }}>
                        <img src="/images/logo.svg" alt="Ventra" width="24" height="24" />
                        <span className={styles.logoText}>Ventra</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
                        © {new Date().getFullYear()} Ventra AI. Pioneering the future of Answer Engine Optimization.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                        <Link href="/privacy" className={styles.navLink}>Privacy</Link>
                        <Link href="/terms" className={styles.navLink}>Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
