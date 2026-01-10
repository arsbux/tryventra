"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/desk/page.module.css";

export const Icons = {
    Validation: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    Rocket: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.5-1 1-4c2 1 3 1.5 4 2z" /><path d="M15 15v5c-1 0-2.5-.5-4-2 1.5-1 2-2 2-3z" /><path d="M15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
    ),
    Forms: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
    ),
    Mail: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
    ),
    Users: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Logo: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
    ),
    Play: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
    ),
    Chart: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
    ),
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    CheckCircle: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    Edit: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    Home: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    )
};

export function Sidebar({ activeTab, setActiveTab }: { activeTab?: string, setActiveTab?: (tab: any) => void }) {
    const pathname = usePathname();
    const isPostPage = pathname.startsWith('/post/');

    const navGroups = [
        {
            label: "INTELLIGENCE",
            items: [
                { id: "aeo/market-radar", label: "Market Radar", icon: <Icons.Logo /> },
                { id: "analytics", label: "Visitor Intelligence", icon: <Icons.Chart /> },
            ]
        },
        {
            label: "AEO PLATFORM",
            items: [
                { id: "aeo/dashboard", label: "Dashboard", icon: <Icons.Home /> },
                { id: "aeo/analysis", label: "Analysis & Audit", icon: <Icons.Search /> },
                { id: "aeo/optimize", label: "Optimizer", icon: <Icons.Edit /> },
            ]
        },
        // OLD FEATURES - Commented out but backend still works
        /* {
            label: "LAUNCH",
            items: [
                { id: "analytics", label: "Web Analytics", icon: <Icons.Chart /> },
                { id: "forms", label: "Forms", icon: <Icons.Forms /> },
                { id: "demos", label: "Video Demos", icon: <Icons.Play /> },
                { id: "waitlists", label: "Email Lists", icon: <Icons.Rocket /> },
                { id: "affiliates", label: "Partnerships", icon: <Icons.Users /> },
            ]
        } */
    ];

    return (
        <aside className={styles.sidebar}>
            <Link href="/desk" className={styles.logoArea} style={{ width: '100%', textDecoration: 'none' }}>
                <div className={styles.navIcon}>
                    <img src="/images/logo.svg" alt="Ventra Logo" width="20" height="20" style={{ objectFit: 'contain' }} />
                </div>
                <span className={styles.logoText}>Ventra</span>
            </Link>

            <nav className={styles.navSection}>
                {navGroups.map((group) => (
                    <div key={group.label} className={styles.navGroup}>
                        <div className={styles.navGroupLabel}>{group.label}</div>
                        {group.items.map((item) => {
                            const href = `/desk/${item.id}`;
                            const isActive = activeTab === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={href}
                                    className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span> {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
