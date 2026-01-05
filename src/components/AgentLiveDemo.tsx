"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './AgentLiveDemo.module.css';

const MOCK_LOGS = [
    "Initializing Ventra AI Agent...",
    "Deep Scanning: Targeted B2B Databases",
    "➜ found 42 potential leads in 'SaaS Tech'",
    "Verifying Domain Authority & Email deliverability...",
    "➜ found Danny Lledó (Decision Maker) | Email: d****@****.com",
    "Analyzing Intent Signals: Recent funding round detected",
    "➜ matching with 'Expansion' opportunity type",
    "Enriching profile: Technology stack identified (Next.js, AWS)",
    "Deduplicating leads across 4 search clusters...",
    "➜ 12 unique high-intent leads verified",
    "Syncing results to your leads database...",
    "Ready for personalized outreach."
];

export default function AgentLiveDemo() {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentIndex < MOCK_LOGS.length) {
            const timer = setTimeout(() => {
                setLogs(prev => [...prev, MOCK_LOGS[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            // Loop the demo after a delay
            const timer = setTimeout(() => {
                setLogs([]);
                setCurrentIndex(0);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>Watch the Agent in Action</h2>
                    <p className={styles.description}>
                        Ventra's AI doesn't just search—it analyzes, verifies, and enriches every lead in real-time.
                        Experience the power of automated, high-intent lead intelligence.
                    </p>
                </div>

                <div className={styles.feedContainer}>
                    <div className={styles.feedHeader}>
                        <div className={styles.pulse}></div>
                        <span>Agent Live Activity</span>
                    </div>
                    <div className={styles.feedList} ref={feedRef}>
                        {logs.map((log, i) => {
                            const isLast = i === logs.length - 1;
                            const isProcessing = isLast && currentIndex < MOCK_LOGS.length;
                            return (
                                <div key={i} className={styles.feedItem}>
                                    <div className={styles.feedIcon}>
                                        {isProcessing ? (
                                            <div className={styles.spinner}></div>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <div className={styles.logText}>
                                        {log.startsWith('➜') ? (
                                            <span className={styles.resultText}>{log}</span>
                                        ) : (
                                            log
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {logs.length === 0 && (
                            <div className={styles.emptyState}>
                                Searching for new opportunities...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
