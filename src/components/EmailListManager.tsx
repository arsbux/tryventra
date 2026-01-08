"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './EmailListManager.module.css';
import { useToast } from './Toaster';

interface EmailListCampaign {
    id: string;
    slug: string;
    title: string;
    one_liner: string;
    created_at: string;
    responses_count?: number;
}

interface LeadEntry {
    id: string;
    email: string;
    created_at: string;
    campaign_title: string;
}

export function EmailListManager() {
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState<EmailListCampaign[]>([]);
    const [leads, setLeads] = useState<LeadEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Create List form state
    const [newTitle, setNewTitle] = useState('');
    const [newOneLiner, setNewOneLiner] = useState('Join our exclusive email list for early updates.');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Email Lists (campaigns of type waitlist)
            const { data: campaignData, error: campaignError } = await supabase
                .from('discovery_campaigns')
                .select(`
                    *,
                    waitlist_entries(count)
                `)
                .eq('founder_id', user.id)
                .eq('campaign_type', 'waitlist')
                .order('created_at', { ascending: false });

            if (campaignError) throw campaignError;

            const formattedCampaigns = campaignData.map((c: any) => ({
                ...c,
                responses_count: c.waitlist_entries?.[0]?.count || 0
            }));
            setCampaigns(formattedCampaigns);

            // 2. Fetch all leads for these lists
            const { data: leadData, error: leadError } = await supabase
                .from('waitlist_entries')
                .select(`
                    id,
                    email,
                    created_at,
                    discovery_campaigns (
                        title,
                        founder_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (leadError) throw leadError;

            const userLeads = leadData
                .filter((item: any) => item.discovery_campaigns.founder_id === user.id)
                .map((item: any) => ({
                    id: item.id,
                    email: item.email,
                    created_at: item.created_at,
                    campaign_title: item.discovery_campaigns.title
                }));

            setLeads(userLeads);
        } catch (err) {
            console.error("Error fetching email list data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle) {
            toast("List Name is required.", "error");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const randomSuffix = Math.random().toString(36).substring(2, 5);
            const finalSlug = `${baseSlug}-${randomSuffix}`;

            const { error } = await supabase
                .from('discovery_campaigns')
                .insert([
                    {
                        founder_id: user.id,
                        title: newTitle,
                        slug: finalSlug,
                        one_liner: newOneLiner,
                        campaign_type: 'waitlist'
                    }
                ]);

            if (error) throw error;

            setIsCreating(false);
            setNewTitle('');
            fetchData();
        } catch (err: any) {
            console.error("Error creating email list:", err);
            if (err.code === '23505') toast("This slug is already taken. Try another name.", "error");
            else toast("Error: " + err.message, "error");
        }
    };

    const copyToClipboard = (text: string, msg: string) => {
        navigator.clipboard.writeText(text);
        toast(msg, "success");
    };

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            <div style={{ marginBottom: '16px' }}>Preparing your list builder...</div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px' }}>
            {/* Setup Section */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>1. My Email Lists</h2>
                    <button
                        className={styles.button}
                        onClick={() => setIsCreating(true)}
                        style={{ padding: '8px 16px' }}
                    >
                        + Create New List
                    </button>
                </div>

                {isCreating && (
                    <div style={{ padding: '24px', background: 'white', border: '2px solid #6366f1', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>List Name</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Early Beta Access"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Heading for Sign-up Page</label>
                            <input
                                className={styles.input}
                                value={newOneLiner}
                                onChange={(e) => setNewOneLiner(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setIsCreating(false)}>Cancel</button>
                            <button className={styles.button} onClick={handleCreate}>Create List</button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {campaigns.length === 0 ? (
                        <div style={{ padding: '40px', background: '#f9fafb', borderRadius: '20px', border: '1px dashed #ddd', textAlign: 'center', gridColumn: '1 / -1' }}>
                            <p style={{ color: '#666', marginBottom: '16px' }}>You haven't created any email lists yet.</p>
                            <button className={styles.button} onClick={() => setIsCreating(true)}>Get Started</button>
                        </div>
                    ) : (
                        campaigns.map(c => (
                            <div key={c.id} style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{c.title}</h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '4px 10px', borderRadius: '100px' }}>
                                        {c.responses_count} Subs
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '20px' }}>tryventra.com/{c.slug}</p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => copyToClipboard(`https://tryventra.com/${c.slug}`, "Link copied!")}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: '#171717',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(`<iframe src="https://tryventra.com/${c.slug}" width="100%" height="400" frameborder="0"></iframe>`, "Embed code copied!")}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'white',
                                            color: '#171717',
                                            border: '1px solid #eaeaea',
                                            borderRadius: '10px',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Embed Code
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Leads Section */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>2. All Collected Emails ({leads.length})</h2>
                    {leads.length > 0 && (
                        <button
                            onClick={() => {
                                const csv = "Email,List,Date\n" + leads.map(e => `${e.email},${e.campaign_title},${new Date(e.created_at).toLocaleDateString()}`).join("\n");
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `email_leads_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                            }}
                            style={{ padding: '8px 16px', background: 'white', border: '1px solid #eaeaea', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Export CSV
                        </button>
                    )}
                </div>

                <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '20px', overflow: 'hidden' }}>
                    {leads.length === 0 ? (
                        <div style={{ padding: '60px 24px', textAlign: 'center', color: '#999' }}>
                            No emails collected yet.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Subscriber</th>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Source List</th>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Joined</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px', fontSize: '0.9375rem', fontWeight: 500 }}>{lead.email}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#666', background: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>
                                                {lead.campaign_title}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem', color: '#888' }}>
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => copyToClipboard(lead.email, "Email copied!")}
                                                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}
