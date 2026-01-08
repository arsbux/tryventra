"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../page.module.css";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Opportunity } from "@/types";
import { useToast } from "@/components/Toaster";

export default function ValidationPage() {
    const { toast } = useToast();
    const [validationMode, setValidationMode] = useState<'signals' | 'scout'>('signals');
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Opportunity[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    /* State for Scout Builder */
    const [scoutTags, setScoutTags] = useState<string[]>([]);
    const [scoutInput, setScoutInput] = useState("");
    const [scoutTier, setScoutTier] = useState("SMB");
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [searchLogs, setSearchLogs] = useState<string[]>([]);

    const STATIC_SUGGESTIONS = [
        'SaaS', 'Fintech', 'Agencies', 'Healthcare', 'Real Estate', 'Crypto', 'Construction', 'Marketing', 'Recruiting'
    ];
    const TIERS = ['SMB', 'Mid-Market', 'Enterprise', 'Startup (Seed)', 'Startup (Series A+)'];

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUserId(session.user.id);
        };
        checkUser();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (scoutInput.length < 2) {
                setAiSuggestions([]);
                return;
            }
            const timer = setTimeout(async () => {
                try {
                    const res = await fetch('/api/suggestions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ input: scoutInput })
                    });
                    const data = await res.json();
                    if (data.suggestions) setAiSuggestions(data.suggestions);
                } catch (e) {
                    console.error(e);
                }
            }, 500);
            return () => clearTimeout(timer);
        };
        fetchSuggestions();
    }, [scoutInput]);

    const handleAddTag = (tag: string) => {
        if (tag && !scoutTags.includes(tag)) {
            setScoutTags([...scoutTags, tag]);
        }
        setScoutInput("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setScoutTags(scoutTags.filter(tag => tag !== tagToRemove));
    };

    const handleScoutKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(scoutInput);
        } else if (e.key === 'Backspace' && !scoutInput && scoutTags.length > 0) {
            handleRemoveTag(scoutTags[scoutTags.length - 1]);
        }
    };

    const filteredSuggestions = (aiSuggestions.length > 0 ? aiSuggestions : STATIC_SUGGESTIONS).filter(s =>
        s.toLowerCase().includes(scoutInput.toLowerCase()) && !scoutTags.includes(s)
    );

    const executeScoutSearch = async () => {
        if (scoutTags.length === 0 && !scoutInput) return;
        let tagsToSearch = [...scoutTags];
        if (scoutInput) {
            tagsToSearch.push(scoutInput);
            setScoutTags(tagsToSearch);
            setScoutInput("");
        }
        if (tagsToSearch.length === 0 || !userId) return;

        const constructedQuery = `${tagsToSearch.join(', ')} companies (${scoutTier})`;
        setIsLoading(true);
        setResults([]);
        setSearchLogs([]);

        try {
            const response = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: 'prospect',
                    query: constructedQuery,
                    valueProp: `Services for ${tagsToSearch.join(', ')}`,
                    targetAudience: `${scoutTier} companies`,
                    userId
                }),
            });

            if (!response.ok) throw new Error("Search failed");
            const reader = response.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.type === 'log') {
                            setSearchLogs(prev => [...prev, data.message]);
                        } else if (data.type === 'result') {
                            setResults(data.data);
                        } else if (data.type === 'error') {
                            setSearchLogs(prev => [...prev, `Error: ${data.message}`]);
                        }
                    } catch (e) { }
                }
            }
        } catch (error) {
            console.error(error);
            toast("Something went wrong during the search. Please check logs.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !userId) return;

        setIsLoading(true);
        setResults([]);
        setSearchLogs([]);

        try {
            const response = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: 'intent',
                    query: query,
                    userId
                }),
            });

            if (!response.ok) throw new Error("Search failed");
            const reader = response.body?.getReader();
            if (reader) {
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.type === 'log') setSearchLogs(prev => [...prev, data.message]);
                            else if (data.type === 'result') setResults(data.data);
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast("Something went wrong during the search. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Idea Validation</h1>
                    <p className={styles.subtitle}>Identify competitors and validate your SaaS idea</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '24px' }}>
                <div className={styles.agentTabs} style={{ marginBottom: '8px' }}>
                    <button
                        className={`${styles.agentTabBtn} ${validationMode === 'signals' ? styles.activeAgentTab : ''}`}
                        onClick={() => setValidationMode('signals')}
                    >
                        Intent Signals
                    </button>
                    <button
                        className={`${styles.agentTabBtn} ${validationMode === 'scout' ? styles.activeAgentTab : ''}`}
                        onClick={() => setValidationMode('scout')}
                    >
                        Lead Scout
                    </button>
                </div>

                {validationMode === 'signals' ? (
                    <form onSubmit={handleSearch} className={styles.searchContainer}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search niche, tech, or company..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className={styles.searchButton} disabled={isLoading}>
                            {isLoading ? "Searching..." : "Search"}
                        </button>
                    </form>
                ) : (
                    <div className={results.length > 0 ? '' : styles.scoutCenterWrapper} style={results.length > 0 ? { marginBottom: '32px' } : {}}>
                        <div className={styles.scoutSearchBox}>
                            {scoutTags.map(tag => (
                                <div key={tag} className={styles.tagPill}>
                                    {tag}
                                    <span className={styles.tagRemove} onClick={() => handleRemoveTag(tag)}>×</span>
                                </div>
                            ))}
                            <input
                                type="text"
                                className={styles.inputGhost}
                                placeholder={scoutTags.length === 0 ? "Enter niche or keyword..." : ""}
                                value={scoutInput}
                                onChange={(e) => setScoutInput(e.target.value)}
                                onKeyDown={handleScoutKeyDown}
                            />
                        </div>

                        {scoutInput && filteredSuggestions.length > 0 && (
                            <div className={styles.suggestionContainer}>
                                {filteredSuggestions.map(s => (
                                    <div key={s} className={styles.suggestionItem} onClick={() => handleAddTag(s)}>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.filterRow}>
                            <div className={styles.controlGroup}>
                                <label className={styles.controlLabel}>Company Tier</label>
                                <select className={styles.controlSelect} value={scoutTier} onChange={(e) => setScoutTier(e.target.value)}>
                                    {TIERS.map(tier => <option key={tier} value={tier}>{tier}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ width: '100%', maxWidth: '700px' }}>
                            <button className={styles.searchButtonLarge} onClick={executeScoutSearch} disabled={isLoading}>
                                {isLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                        <div className={styles.spinner} style={{ width: '16px', height: '16px', borderTopColor: 'white', borderWidth: '2px' }}>
                                        </div>
                                        Scouting...
                                    </div>
                                ) : "Start Scouting"}
                            </button>
                        </div>
                    </div>
                )}

                {(isLoading || (searchLogs.length > 0 && results.length === 0)) && (
                    <div className={styles.feedContainer} style={{ marginTop: 0 }}>
                        <div className={styles.feedHeader}>
                            <div className={styles.pulse}></div>
                            <span>AI Research Engine Active</span>
                        </div>
                        <div className={styles.feedList}>
                            {searchLogs.map((log, i) => {
                                const isLast = i === searchLogs.length - 1;
                                return (
                                    <div key={i} className={styles.feedItem}>
                                        <div className={styles.feedIcon}>
                                            {isLast && isLoading ? (
                                                <div className={styles.spinner} style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: '#3b82f6', borderRightColor: '#e5e7eb', borderBottomColor: '#e5e7eb', borderLeftColor: '#e5e7eb', margin: 0 }}></div>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>{log}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {results.length > 0 && (
                    <section className={styles.resultsSection}>
                        <div className={styles.resultsHeader}>
                            <h2 className={styles.resultsTitle}>{results.length} Research Items Found</h2>
                        </div>
                        <div className={styles.opportunitiesGrid}>
                            {results.slice(0, 50).map((opp) => (
                                <OpportunityCard key={opp.id} {...opp} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
