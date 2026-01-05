"use client";

import React from 'react';
import styles from './NicheShowcase.module.css';

const ROW_1 = [
    { name: "Real Estate", icon: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { name: "SaaS & Tech", icon: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" },
    { name: "E-commerce", icon: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" },
    { name: "Solar & Energy", icon: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }
];

const ROW_2 = [
    { name: "Healthcare", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
    { name: "Finance", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    { name: "Insurance", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" },
    { name: "Fintech", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }
];

const ROW_3 = [
    { name: "Education", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
    { name: "Hospitality", icon: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
    { name: "Manufacturing", icon: "M2 20V4l6 4 6-4 6 4v16l-6-4-6 4-6-4z" },
    { name: "Logistics", icon: "M10 17h4M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" }
];

const ROW_4 = [
    { name: "Legal", icon: "M16 16 20 20M4 20 8 16M12 12v10M2 12h20M7 2h10" },
    { name: "Marketing", icon: "M11 5h2M11 9h2M11 13h2M11 17h2M7 5h2M7 9h2M7 13h2M7 17h2" },
    { name: "Agriculture", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" },
    { name: "Construction", icon: "M2 20V4l6 4 6-4 6 4v16l-6-4-6 4-6-4z" }
];

const NicheCard = ({ name, iconPath, isProcessing }: { name: string, iconPath: string, isProcessing?: boolean }) => (
    <div className={styles.card}>
        <div className={styles.iconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPath} />
            </svg>
        </div>
        <span className={styles.name}>{name}</span>
        {isProcessing ? (
            <span className={styles.status}>Processing <span className={styles.spinner} /></span>
        ) : (
            <svg className={styles.check} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        )}
    </div>
);

export default function NicheShowcase() {
    return (
        <div className={styles.container}>
            <div className={styles.scrollWrapper}>
                <div className={styles.track}>
                    {[...ROW_1, ...ROW_1].map((niche, i) => (
                        <NicheCard key={i} name={niche.name} iconPath={niche.icon} isProcessing={i === 2} />
                    ))}
                </div>
            </div>
            <div className={styles.scrollWrapper}>
                <div className={`${styles.track} ${styles.reverse}`}>
                    {[...ROW_2, ...ROW_2].map((niche, i) => (
                        <NicheCard key={i} name={niche.name} iconPath={niche.icon} isProcessing={i === 1} />
                    ))}
                </div>
            </div>
            <div className={styles.scrollWrapper}>
                <div className={styles.track}>
                    {[...ROW_3, ...ROW_3].map((niche, i) => (
                        <NicheCard key={i} name={niche.name} iconPath={niche.icon} />
                    ))}
                </div>
            </div>
            <div className={styles.scrollWrapper}>
                <div className={`${styles.track} ${styles.reverse}`}>
                    {[...ROW_4, ...ROW_4].map((niche, i) => (
                        <NicheCard key={i} name={niche.name} iconPath={niche.icon} isProcessing={i === 3} />
                    ))}
                </div>
            </div>

            <div className={styles.glow} />
        </div>
    );
}
