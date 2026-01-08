"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../page.module.css";
import { LeadsTable } from "@/components/LeadsTable";
import { Opportunity } from "@/types";
import { useToast } from "@/components/Toaster";
import * as XLSX from 'xlsx';

export default function CRMPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Opportunity[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [dbSearchText, setDbSearchText] = useState("");
    const [minScore, setMinScore] = useState(0);
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setUserId(session.user.id);
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (userId) fetchLeads();
    }, [userId]);

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
            toast("Failed to load leads", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateLead = async (id: string, field: string, value: any) => {
        setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
        try {
            await fetch('/api/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, field, value })
            });
            toast("Lead updated successfully", "success");
        } catch (error) {
            console.error("Failed to update lead", error);
            toast("Failed to update lead", "error");
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        setResults(prev => prev.filter(p => p.id !== id));
        try {
            const response = await fetch("/api/leads", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error("Delete failed");
            toast("Lead deleted", "success");
        } catch (error) {
            console.error(error);
            toast("Failed to delete lead", "error");
        }
    };

    const handleToggleStar = async (id: string) => {
        const lead = results.find(l => l.id === id);
        if (!lead) return;
        const newStarred = !lead.isStarred;
        setResults(prev => prev.map(l => l.id === id ? { ...l, isStarred: newStarred } : l));
        const currentTags = lead.tags || [];
        const newTags = newStarred ? [...currentTags, 'starred'] : currentTags.filter(t => t !== 'starred');
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

    const handleExportXLSX = () => {
        const filtered = results.filter(opp => {
            const matchesSearch = opp.title.toLowerCase().includes(dbSearchText.toLowerCase()) ||
                opp.description.toLowerCase().includes(dbSearchText.toLowerCase());
            const matchesScore = opp.desperationScore >= minScore;
            const matchesType = typeFilter === 'All' || opp.opportunityType === typeFilter;
            return matchesSearch && matchesScore && matchesType;
        });

        const exportData = filtered.map(item => ({
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
        XLSX.writeFile(wb, `Ventra_CRM_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast("Exported to XLSX", "success");
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
                toast("Share link copied to clipboard!", "success");
            }
        } catch (error) {
            console.error("Failed to share table:", error);
            toast("Failed to generate share link", "error");
        }
    };

    const filteredResults = results.filter(opp => {
        const matchesSearch = opp.title.toLowerCase().includes(dbSearchText.toLowerCase()) ||
            opp.description.toLowerCase().includes(dbSearchText.toLowerCase());
        const matchesScore = opp.desperationScore >= minScore;
        const matchesType = typeFilter === 'All' || opp.opportunityType === typeFilter;
        return matchesSearch && matchesScore && matchesType;
    });

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

    const starred = filteredResults.filter(l => l.isStarred);
    const unstarred = filteredResults.filter(l => !l.isStarred);
    unstarred.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const grouped: Record<string, Opportunity[]> = {};
    unstarred.forEach(l => {
        const group = getDateGroup(l.createdAt);
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(l);
    });

    const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Older'];

    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Customer CRM</h1>
                    <p className={styles.subtitle}>Unified customer and lead management</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.exportButton} onClick={handleShareTable} style={{ background: 'white', color: '#667eea', border: '1px solid #667eea' }}>
                        Share Table
                    </button>
                    <button className={styles.exportButton} onClick={handleExportXLSX}>
                        Export XLSX
                    </button>
                </div>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Search Customers</span>
                    <input type="text" className={styles.filterInput} placeholder="Name or company..." value={dbSearchText} onChange={(e) => setDbSearchText(e.target.value)} />
                </div>
                <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Min. Fit Score</span>
                    <select className={styles.filterSelect} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
                        <option value={0}>Any Score</option>
                        <option value={50}>50+</option>
                        <option value={70}>70+</option>
                        <option value={85}>85+</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Type</span>
                    <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="Expansion">Expansion</option>
                        <option value="Tech Swap">Tech Swap</option>
                        <option value="Pain Point">Pain Point</option>
                        <option value="Marketplace RFP">Marketplace RFP</option>
                    </select>
                </div>
            </div>

            <section className={styles.resultsSection}>
                <h2 className={styles.resultsTitle}>{filteredResults.length} Customers Found</h2>
                {filteredResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h3>Your Pipeline is Empty</h3>
                        <p>No customers match your current filters.</p>
                    </div>
                ) : (
                    <div className={styles.spreadsheetView}>
                        {/* STARRED SECTION */}
                        {starred.length > 0 && (
                            <div className={styles.dateGroup}>
                                <div className={styles.dateGroupLabel}>Starred (Focus)</div>
                                <LeadsTable leads={starred as any} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} onToggleStar={handleToggleStar} />
                            </div>
                        )}
                        {/* UNSTARRED GROUPS */}
                        {groupOrder.map(group => {
                            const items = grouped[group];
                            if (!items || items.length === 0) return null;
                            return (
                                <div key={group} className={styles.dateGroup}>
                                    <div className={styles.dateGroupLabel}>{group}</div>
                                    <LeadsTable leads={items as any} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} onToggleStar={handleToggleStar} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}
