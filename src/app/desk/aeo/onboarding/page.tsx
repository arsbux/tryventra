"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from '../../page.module.css';
import aeoStyles from './onboarding.module.css';

export default function AEOOnboardingPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [domain, setDomain] = useState('');
    const [projectName, setProjectName] = useState('');
    const [crawling, setCrawling] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain || !userId) return;

        setCrawling(true);
        setError('');

        try {
            const response = await fetch('/api/aeo/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domain.replace(/^https?:\/\//, ''),
                    userId,
                    projectName: projectName || domain
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to crawl domain');
            }

            // Redirect to dashboard with results
            router.push(`/desk/aeo/dashboard?project=${data.projectId}&new=true`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCrawling(false);
        }
    };

    return (
        <div className={aeoStyles.container}>
            <div className={aeoStyles.header}>
                <h1 className={styles.title}>Answer Engine Optimization</h1>
                <p className={styles.subtitle}>Get found in AI-generated answers from Claude, Gemini, and more</p>
            </div>

            <div className={aeoStyles.onboardingCard}>
                <div className={aeoStyles.cardHeader}>
                    <div className={aeoStyles.iconBox}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    </div>
                    <h2>Connect Your Website</h2>
                    <p>We'll scan your site and show you where you stand</p>
                </div>

                <form onSubmit={handleSubmit} className={aeoStyles.form}>
                    <div className={aeoStyles.inputGroup}>
                        <label className={aeoStyles.label}>Website Domain *</label>
                        <input
                            type="text"
                            className={aeoStyles.input}
                            placeholder="example.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            disabled={crawling}
                            required
                        />
                        <span className={aeoStyles.hint}>Enter your domain without http:// or www</span>
                    </div>

                    <div className={aeoStyles.inputGroup}>
                        <label className={aeoStyles.label}>Project Name (Optional)</label>
                        <input
                            type="text"
                            className={aeoStyles.input}
                            placeholder="My Website"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            disabled={crawling}
                        />
                    </div>

                    {error && (
                        <div className={aeoStyles.error}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={aeoStyles.submitButton}
                        disabled={crawling || !domain}
                    >
                        {crawling ? (
                            <>
                                <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                Scanning your website...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 2v6h-6" />
                                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                                </svg>
                                Start AI Readiness Scan
                            </>
                        )}
                    </button>
                </form>

                <div className={aeoStyles.benefits}>
                    <h3>What we'll analyze:</h3>
                    <ul>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Answer positioning (are your answers easy to find?)
                        </li>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Structured data presence (FAQ schema, etc.)
                        </li>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Q&A content structure
                        </li>
                        <li>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Content quality & length optimization
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
