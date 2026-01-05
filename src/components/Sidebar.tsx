"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/desk/page.module.css";

export const Icons = {
    Signals: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 7V5" /><path d="M12 19v-2" /><path d="m16.95 7.05 1.41-1.41" /><path d="m5.64 18.36 1.41-1.41" /><path d="M17 12h2" /><path d="M5 12H7" /><path d="m16.95 16.95 1.41 1.41" /><path d="m5.64 5.64 1.41 1.41" /></svg>
    ),
    Scout: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Pipeline: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
    ),
    Logo: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
    )
};

export function Sidebar({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab?: (tab: any) => void }) {
    const pathname = usePathname();
    const isPostPage = pathname.startsWith('/post/');

    return (
        <aside className={styles.sidebar}>
            <Link href="/desk" className={styles.logoArea} style={{ width: '100%', textDecoration: 'none' }}>
                <div className={styles.navIcon}>
                    <img src="/images/logo.png" alt="Ventra Logo" width="20" height="20" style={{ objectFit: 'contain' }} />
                </div>
                <span className={styles.logoText}>Ventra</span>
            </Link>

            <nav className={styles.navSection}>
                <Link
                    href="/desk"
                    className={`${styles.navItem} ${!isPostPage && activeTab === 'pipeline' ? styles.activeNavItem : ''}`}
                    onClick={() => setActiveTab?.('pipeline')}
                >
                    <span className={styles.navIcon}><Icons.Pipeline /></span> Leads DB
                </Link>
                <Link
                    href="/desk"
                    className={`${styles.navItem} ${!isPostPage && activeTab === 'scout' ? styles.activeNavItem : ''}`}
                    onClick={() => setActiveTab?.('scout')}
                >
                    <span className={styles.navIcon}><Icons.Scout /></span> Lead Scout
                </Link>
                <Link
                    href="/desk"
                    className={`${styles.navItem} ${!isPostPage && activeTab === 'signals' ? styles.activeNavItem : ''}`}
                    onClick={() => setActiveTab?.('signals')}
                >
                    <span className={styles.navIcon}><Icons.Signals /></span> Intent Signals
                </Link>
            </nav>
        </aside>
    );
}
