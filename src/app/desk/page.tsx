"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Sidebar } from "@/components/Sidebar";
import { LeadsTable } from "@/components/LeadsTable";
import * as XLSX from 'xlsx';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  platform: 'Reddit' | 'AngelList' | 'Discord' | 'X/Twitter' | 'GitHub' | 'Hacker News' | 'Crunchbase' | 'Other' | 'BuiltWith' | 'Product Hunt' | 'G2' | 'Clutch' | 'Google Maps' | 'Database';
  link: string;
  tags: string[];
  postedAt?: string;
  opportunityType: 'Expansion' | 'Tech Swap' | 'Pain Point' | 'Marketplace RFP';
  signal: string;
  insight: string;
  desperationScore: number; // Intent Score
  actionLabel?: string;
  // New Spreadsheet Fields
  status?: string;
  estimatedValue?: string;
  probability?: number;
  notes?: string;
  contact?: string;
  owner?: string;
  isStarred?: boolean;
  createdAt?: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'signals' | 'scout' | 'pipeline'>('pipeline');
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Opportunity[]>([]);

  // Filter States
  const [dbSearchText, setDbSearchText] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [typeFilter, setTypeFilter] = useState("All");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Copied to clipboard!");

  /* State for Scout Builder */
  const [scoutTags, setScoutTags] = useState<string[]>([]);
  const [scoutInput, setScoutInput] = useState("");
  // const [scoutLocation, setScoutLocation] = useState("United States"); // Removed
  const [scoutTier, setScoutTier] = useState("SMB");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searchLogs, setSearchLogs] = useState<string[]>([]);

  // Static fallback or mix
  const STATIC_SUGGESTIONS = [
    'SaaS', 'Fintech', 'Agencies', 'Healthcare', 'Real Estate', 'Crypto', 'Construction', 'Marketing', 'Recruiting'
  ];
  const TIERS = ['SMB', 'Mid-Market', 'Enterprise', 'Startup (Seed)', 'Startup (Series A+)'];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (scoutInput.length < 2) {
        setAiSuggestions([]);
        return;
      }
      // Debounce simple locally or just call for now. 
      // For production, use lodash.debounce. Here, let's just use a timeout effect.
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
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
    };
    fetchSuggestions();
  }, [scoutInput]);


  /* ... inside Home component ... */
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      // Check for active subscription in Supabase
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'one-time'])
        .maybeSingle();

      if (error) {
        console.error('Subscription Check Error:', error);
      }

      if (!subscription) {
        console.warn('No active subscription found for user:', session.user.id);
        // Allow access during test mode for easier development
        if (process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === 'live_mode') {
          router.push("/pricing");
          return;
        }
      }

      setUserId(session.user.id);
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'pipeline' && userId) {
      fetchLeads();
    } else {
      setResults([]);
    }
  }, [activeTab, userId]);

  const fetchLeads = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leads?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch leads");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLead = async (id: string, field: string, value: any) => {
    // Optimistic Update relative to results state
    setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });
    } catch (error) {
      console.error("Failed to update lead", error);
      // Ideally revert state here on error
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    // Optimistic update
    setResults(prev => prev.filter(p => p.id !== id));

    try {
      const response = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Delete failed");
    } catch (error) {
      console.error(error);
      alert("Failed to delete lead");
    }
  };

  const handleToggleStar = async (id: string) => {
    const lead = results.find(l => l.id === id);
    if (!lead) return;

    const isStarred = lead.isStarred;
    const newStarred = !isStarred;

    // Optimistic
    setResults(prev => prev.map(l => l.id === id ? { ...l, isStarred: newStarred } : l));

    // Update Tags
    const currentTags = lead.tags || [];
    const newTags = newStarred
      ? [...currentTags, 'starred']
      : currentTags.filter(t => t !== 'starred');

    // De-dupe tags
    const uniqueTags = Array.from(new Set(newTags));

    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field: 'tags', value: uniqueTags.join(',') })
      });
    } catch (error) {
      console.error("Failed to toggle star", error);
    }
  };

  const cleanEmail = (email: string) => {
    // Remove (inferred), (assumed), and any other parenthetical text
    return email.replace(/\s*\(.*?\)\s*/g, '').trim();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage("Copied to clipboard!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !scoutTags.includes(tag)) {
      setScoutTags([...scoutTags, tag]);
    }
    setScoutInput("");
  };

  const handleExportXLSX = (data: any[], fileName: string) => {
    const exportData = data.map(item => ({
      Company: item.title,
      Website: item.link,
      Contact: item.contact || 'N/A',
      Email: item.email || (item.signal?.includes('Email:') ? item.signal.split('Email:')[1].split('|')[0].trim() : 'N/A'),
      Status: item.status || 'Prospect',
      Type: item.opportunityType,
      Score: item.desperationScore,
      Description: item.description,
      Insight: item.insight,
      Signal: item.signal
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleShareTable = async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      if (data.id) {
        const shareUrl = `${window.location.origin}/share/${data.id}`;
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("Share link copied!");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Failed to share table:", error);
      alert("Failed to generate share link");
    }
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

    // Auto-add input if it exists when clicking search
    let tagsToSearch = [...scoutTags];
    if (scoutInput) {
      tagsToSearch.push(scoutInput);
      setScoutTags(tagsToSearch);
      setScoutInput("");
    }

    if (tagsToSearch.length === 0) return;

    if (!userId) return;

    // Construct query for the API
    const constructedQuery = `${tagsToSearch.join(', ')} companies (${scoutTier})`;

    setIsLoading(true);
    setResults([]);
    setSearchLogs([]); // Clear logs

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: 'prospect',
          query: constructedQuery,
          valueProp: `Services for ${tagsToSearch.join(', ')}`,
          targetAudience: `${scoutTier} companies`,
          userId: userId
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
        // Handle potential split JSON by buffering (simplified here: assume mostly complete lines or robust enough)
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              setSearchLogs(prev => [...prev, data.message]);
            } else if (data.type === 'result') {
              setResults(data.data);
            } else if (data.type === 'error') {
              // Log error but don't break fully unless needed
              setSearchLogs(prev => [...prev, `Error: ${data.message}`]);
            }
          } catch (e) {
            // Ignore partial JSON parse errors
          }
        }
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong during the search. Please check logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const isScoutMode = activeTab === 'scout';
    if (isScoutMode) {
      if (!niche.trim()) return;
    } else if (activeTab === 'signals') {
      if (!query.trim()) return;
    } else {
      return;
    }

    if (!userId) return;

    setIsLoading(true);
    setResults([]);
    setSearchLogs([]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isScoutMode ? 'prospect' : 'intent',
          query: isScoutMode ? niche : query,
          valueProp: isScoutMode ? `Services for ${niche}` : undefined,
          targetAudience: isScoutMode ? niche : undefined,
          userId: userId // Add userId to the request
        }),
      });

      if (!response.ok) throw new Error("Search failed");

      // Handle the same streaming logic for text search if upgraded
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
      } else {
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong during the search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {toastMessage}
        </div>
      )}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.topHeader}>
            <div>
              <h1 className={styles.title}>
                {activeTab === 'signals' ? 'Intent Signals' : activeTab === 'scout' ? 'Lead Scout' : 'Leads DB'}
              </h1>
              <p className={styles.subtitle}>
                {activeTab === 'signals'
                  ? 'Real-time B2B triggers and signals'
                  : activeTab === 'scout'
                    ? 'Direct multi-channel lead discovery'
                    : 'Personalized lead database and history'}
              </p>
            </div>
          </div>

          {activeTab === 'signals' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '24px' }}>
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

              {/* Activity Feed for Signals */}
              {(isLoading || (searchLogs.length > 0 && results.length === 0)) && (
                <div className={styles.feedContainer} style={{ marginTop: 0 }}>
                  <div className={styles.feedHeader}>
                    <div className={styles.pulse}></div>
                    <span>AI Agent Active</span>
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
                          <div style={{ flex: 1 }}>
                            {log.replace('➜ ', '')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scout' && (
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
                      <div className={styles.spinner} style={{ width: '16px', height: '16px', borderTopColor: 'white', borderWidth: '2px' }}></div>
                      Scouting...
                    </div>
                  ) : "Start Scouting"}
                </button>
              </div>

              {/* Activity Feed UI */}
              {(isLoading || (searchLogs.length > 0 && results.length === 0)) && (
                <div className={styles.feedContainer}>
                  <div className={styles.feedHeader}>
                    <div className={styles.pulse}></div>
                    <span>AI Agent Active</span>
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
                          <div style={{ flex: 1 }}>
                            {log.replace('➜ ', '')}
                          </div>
                        </div>
                      );
                    })}
                    {/* Invisible element to auto-scroll could go here */}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Search Leads</span>
                <input
                  type="text"
                  className={styles.filterInput}
                  placeholder="Company or keyword..."
                  value={dbSearchText}
                  onChange={(e) => setDbSearchText(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Min. Intent Score</span>
                <select
                  className={styles.filterSelect}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                >
                  <option value={0}>Any Score</option>
                  <option value={50}>50+</option>
                  <option value={70}>70+</option>
                  <option value={85}>85+</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Type</span>
                <select
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Expansion">Expansion</option>
                  <option value="Tech Swap">Tech Swap</option>
                  <option value="Pain Point">Pain Point</option>
                  <option value="Marketplace RFP">Marketplace RFP</option>
                </select>
              </div>
            </div>
          )}

          {(results.length > 0 || activeTab === 'pipeline') && (
            <section className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <div>
                  <h2 className={styles.resultsTitle}>
                    {results.filter(opp => {
                      if (activeTab !== 'pipeline') return true;
                      const matchesSearch = opp.title.toLowerCase().includes(dbSearchText.toLowerCase()) ||
                        opp.description.toLowerCase().includes(dbSearchText.toLowerCase());
                      const matchesScore = opp.desperationScore >= minScore;
                      const matchesType = typeFilter === 'All' || opp.opportunityType === typeFilter;
                      return matchesSearch && matchesScore && matchesType;
                    }).length} {activeTab === 'signals' ? 'Signals' : 'Leads'} Found
                  </h2>
                </div>
                {(activeTab === 'pipeline' || activeTab === 'scout' || activeTab === 'signals') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={styles.exportButton}
                      onClick={handleShareTable}
                      style={{ background: 'white', color: '#667eea', border: '1px solid #667eea' }}
                      title="Generate a public link to share this table"
                    >
                      Share Table
                    </button>
                    <button
                      className={styles.exportButton}
                      onClick={() => {
                        const dataToExport = activeTab === 'pipeline'
                          ? results.filter(opp => {
                            const matchesSearch = opp.title.toLowerCase().includes(dbSearchText.toLowerCase()) ||
                              opp.description.toLowerCase().includes(dbSearchText.toLowerCase());
                            const matchesScore = opp.desperationScore >= minScore;
                            const matchesType = typeFilter === 'All' || opp.opportunityType === typeFilter;
                            return matchesSearch && matchesScore && matchesType;
                          })
                          : results;
                        handleExportXLSX(dataToExport, `Ventra_${activeTab}_${new Date().toISOString().split('T')[0]}`);
                      }}
                    >
                      Export XLSX
                    </button>
                  </div>
                )}
              </div>

              {activeTab === 'pipeline' ? (
                /* LEADS DB SPREADSHEET VIEW */
                (() => {
                  const filtered = results.filter(opp => {
                    const matchesSearch = opp.title.toLowerCase().includes(dbSearchText.toLowerCase()) ||
                      opp.description.toLowerCase().includes(dbSearchText.toLowerCase());
                    const matchesScore = opp.desperationScore >= minScore;
                    const matchesType = typeFilter === 'All' || opp.opportunityType === typeFilter;
                    return matchesSearch && matchesScore && matchesType;
                  });

                  const starred = filtered.filter(l => l.isStarred);
                  const unstarred = filtered.filter(l => !l.isStarred);

                  // Sort unstarred by date desc
                  unstarred.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

                  const getDateGroup = (dateStr?: string) => {
                    if (!dateStr) return 'Older';
                    const date = new Date(dateStr);
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    if (date.toDateString() === today.toDateString()) return 'Today';
                    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

                    const diffTime = Math.abs(today.getTime() - date.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 7) return 'Last 7 Days';
                    if (diffDays <= 30) return 'Last 30 Days';
                    return 'Older';
                  };

                  const grouped: Record<string, Opportunity[]> = {};
                  unstarred.forEach(l => {
                    const group = getDateGroup(l.createdAt);
                    if (!grouped[group]) grouped[group] = [];
                    grouped[group].push(l);
                  });

                  const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Older'];

                  // Check if there are no leads at all
                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '100px 24px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        marginTop: '20px'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '24px'
                        }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                          Your Pipeline is Empty
                        </h3>
                        <p style={{ fontSize: '1.05rem', color: '#666', marginBottom: '32px', maxWidth: '440px', lineHeight: '1.6' }}>
                          Start building your lead database by discovering high-intent opportunities with the Lead Scout.
                        </p>
                        <button
                          onClick={() => setActiveTab('scout')}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '16px 36px',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                          </svg>
                          Start Discovery
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {starred.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            Starred Leads
                          </h3>
                          <LeadsTable leads={starred as any} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} onToggleStar={handleToggleStar} />
                        </div>
                      )}

                      {groupOrder.map(group => {
                        const leads = grouped[group];
                        if (!leads || leads.length === 0) return null;
                        return (
                          <div key={group}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#6b7280' }}>{group}</h3>
                            <LeadsTable leads={leads as any} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} onToggleStar={handleToggleStar} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : activeTab === 'signals' ? (
                /* SIGNALS GRID VIEW */
                <div className={styles.opportunitiesGrid}>
                  {results.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      {...opp}
                      isStarred={opp.isStarred}
                      onToggleStar={() => handleToggleStar(opp.id)}
                    />
                  ))}
                </div>
              ) : (
                /* SCOUT TABLE VIEW */
                <div className={styles.tableWrapper}>
                  <table className={styles.leadsTable}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Website</th>
                        <th>Contact</th>
                        <th>Status / Gap</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((opp) => (
                        <tr key={opp.id}>
                          <td className={styles.companyName}>{opp.title}</td>
                          <td>
                            <a href={opp.link} target="_blank" rel="noopener noreferrer" className={styles.tableLink}>
                              {opp.link.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                            </a>
                          </td>
                          <td className={styles.signalCell}>
                            <div className={styles.contactInfo}>
                              {opp.signal.split('|').map((part, i) => {
                                const trimmed = part.trim();
                                if (trimmed.toLowerCase().includes('email:')) {
                                  const email = trimmed.split(':')[1]?.trim() || 'N/A';
                                  const cleanedEmail = cleanEmail(email);
                                  return (
                                    <div key={i} className={styles.contactRow}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          copyToClipboard(cleanedEmail);
                                        }}
                                        className={styles.contactValue}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          padding: 0,
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                          textDecorationStyle: 'dotted',
                                          textUnderlineOffset: '2px'
                                        }}
                                        title="Click to copy email"
                                      >
                                        {cleanedEmail}
                                      </button>
                                    </div>
                                  );
                                }
                                if (trimmed.toLowerCase().includes('linkedin:')) {
                                  const url = trimmed.split(/linkedin:/i)[1]?.trim();
                                  return (
                                    <div key={i} className={styles.contactRow}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                      <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                        View Profile
                                      </a>
                                    </div>
                                  );
                                }
                                if (trimmed.toLowerCase().includes('phone:')) {
                                  return (
                                    <div key={i} className={styles.contactRow}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                      <span className={styles.contactValue}>{trimmed.split(':')[1]?.trim() || 'N/A'}</span>
                                    </div>
                                  );
                                }
                                // Handle Name/Role or other text
                                return (
                                  <div key={i} className={styles.personalInfo}>
                                    {trimmed}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className={styles.insightCell}>{opp.insight}</td>
                          <td>
                            <span
                              className={styles.scoreTag}
                              style={{
                                backgroundColor: opp.desperationScore >= 80 ? '#f0fdf4' : opp.desperationScore >= 50 ? '#fffbeb' : '#f8fafc',
                                color: opp.desperationScore >= 80 ? '#16a34a' : opp.desperationScore >= 50 ? '#d97706' : '#64748b'
                              }}
                            >
                              {opp.desperationScore}
                            </span>
                          </td>
                          <td>
                            <Link
                              href={`/post/${encodeURIComponent(opp.id)}?url=${encodeURIComponent(opp.link)}&title=${encodeURIComponent(opp.title)}&platform=${encodeURIComponent(opp.platform)}`}
                              className={styles.tableAction}
                            >
                              Analyze
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {isLoading && (!searchLogs.length || activeTab !== 'scout') && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {activeTab === 'signals' ? "Analyzing data sources..." : "Crawling lead databases..."}
              </p>
            </div>
          )}
        </div>
      </main >
    </div >
  );
}
