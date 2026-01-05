"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './DataFlowIllustration.module.css';

const DATA_SOURCES = [
    { name: "LinkedIn", icon: "/apps/linkedin.png", signal: "Hiring Data" },
    { name: "Crunchbase", icon: "/apps/crunchbase.png", signal: "Funding Rounds" },
    { name: "X/Twitter", icon: "/apps/x.png", signal: "Social Trends" },
    { name: "G2", icon: "/apps/g2.png", signal: "Reviews" },
    { name: "Product Hunt", icon: "/apps/producthunt.png", signal: "Launches" },
    { name: "TechCrunch", icon: "/apps/techcrunch.png", signal: "News" },
    { name: "Reddit", icon: "/apps/reddit.png", signal: "Discussions" },
    { name: "Google Maps", icon: "/apps/googleMaps.png", signal: "Locations" }
];

export default function DataFlowIllustration() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sourceRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const aiRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [points, setPoints] = useState<{
        sources: { x: number; y: number }[];
        ai: { x: number; y: number };
        leads: { x: number; y: number }[];
    } | null>(null);

    const updatePoints = () => {
        if (!containerRef.current || !aiRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const aiRect = aiRef.current.getBoundingClientRect();

        const aiCenter = {
            x: aiRect.left - containerRect.left + aiRect.width / 2,
            y: aiRect.top - containerRect.top + aiRect.height / 2,
        };

        const sourcePoints = sourceRefs.current.map((ref) => {
            if (!ref) return { x: 0, y: 0 };
            const rect = ref.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2,
            };
        });

        const leadPoints = cardRefs.current.map((ref) => {
            if (!ref) return { x: 0, y: 0 };
            const rect = ref.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left, // Connect to left edge
                y: rect.top - containerRect.top + rect.height / 2,
            };
        });

        setPoints({
            sources: sourcePoints,
            ai: aiCenter,
            leads: leadPoints,
        });
    };

    useEffect(() => {
        // Initial calculation
        updatePoints();

        // Use ResizeObserver for reliability
        const observer = new ResizeObserver(() => {
            updatePoints();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // Also update on window resize and small delays to ensure layout settled
        window.addEventListener('resize', updatePoints);
        const timers = [100, 500, 1000].map(t => setTimeout(updatePoints, t));

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updatePoints);
            timers.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className={styles.wrapper} ref={containerRef}>
            {/* SVG Connection Lines */}
            {points && (
                <svg className={styles.svg} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <linearGradient id="sourceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#e5e7eb" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="outputGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>

                    {/* Source to AI curves */}
                    {points.sources.map((p, idx) => {
                        const controlX1 = p.x + (points.ai.x - p.x) * 0.4;
                        const controlX2 = points.ai.x - (points.ai.x - p.x) * 0.4;
                        return (
                            <path
                                key={`source-${idx}`}
                                d={`M ${p.x} ${p.y} C ${controlX1} ${p.y}, ${controlX2} ${points.ai.y}, ${points.ai.x} ${points.ai.y}`}
                                fill="none"
                                stroke="url(#sourceGrad)"
                                strokeWidth="1.5"
                                className={styles.pathLine}
                            />
                        );
                    })}

                    {/* AI to Dashboard curves */}
                    {points.leads.map((p, idx) => {
                        const controlX1 = points.ai.x + (p.x - points.ai.x) * 0.4;
                        const controlX2 = p.x - (p.x - points.ai.x) * 0.4;
                        return (
                            <path
                                key={`output-${idx}`}
                                d={`M ${points.ai.x} ${points.ai.y} C ${controlX1} ${points.ai.y}, ${controlX2} ${p.y}, ${p.x} ${p.y}`}
                                fill="none"
                                stroke="url(#outputGrad)"
                                strokeWidth="2"
                                className={styles.pathLine}
                            />
                        );
                    })}
                </svg>
            )}

            <div className={styles.layout}>
                {/* Sources */}
                <div className={styles.sources}>
                    {DATA_SOURCES.map((source, idx) => (
                        <div key={idx} className={styles.sourceCard} style={{ zIndex: 10 }}>
                            <img src={source.icon} alt={source.name} className={styles.icon} />
                            <div className={styles.info}>
                                <span className={styles.name}>{source.name}</span>
                                <span className={styles.label}>{source.signal}</span>
                            </div>
                            <span
                                className={styles.dot}
                                ref={el => { sourceRefs.current[idx] = el; }}
                            />
                        </div>
                    ))}
                </div>

                {/* AI Node */}
                <div className={styles.center}>
                    <div className={styles.aiNode} ref={aiRef}>
                        <div className={styles.aiTitle}>Deep analysis</div>
                    </div>
                </div>

                {/* Dashboard */}
                <div className={styles.dashWrapper}>
                    <div className={styles.dashboard}>
                        <div className={styles.dashHeader}>
                            <span className={styles.trafficDot} style={{ background: '#ef4444' }} />
                            <span className={styles.trafficDot} style={{ background: '#f59e0b' }} />
                            <span className={styles.trafficDot} style={{ background: '#10b981' }} />
                            <span className={styles.dashTitle}>Recent Leads</span>
                        </div>
                        <div className={styles.cards}>
                            <div className={styles.leadCard} ref={el => { cardRefs.current[0] = el; }}>
                                <span className={styles.badge} style={{ background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>Proposal Sent</span>
                                <div className={styles.leadName}>Jason Bocchi</div>
                                <div className={styles.leadMeta}>Happy Harbor Restaurant • Digital Marketing Strategy</div>
                            </div>
                            <div className={styles.leadCard} ref={el => { cardRefs.current[1] = el; }}>
                                <span className={styles.badge} style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>Pitching</span>
                                <div className={styles.leadName}>Danny Lledó</div>
                                <div className={styles.leadMeta}>Apéro & La Bohème • Unique Dining Concepts</div>
                            </div>
                            <div className={styles.leadCard} ref={el => { cardRefs.current[2] = el; }}>
                                <span className={styles.badge} style={{ background: '#f3f4f6', color: '#4b5563', borderColor: '#e5e7eb' }}>Prospect</span>
                                <div className={styles.leadName}>Maria Fundora</div>
                                <div className={styles.leadMeta}>Casa Nuova Restaurant • Sustainable Solutions</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
