"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './EmailListManager.module.css';
import { Icons } from './Sidebar';
import { useToast } from './Toaster';
import { useRouter } from 'next/navigation';

interface Campaign {
    id: string;
    slug: string;
    title: string;
    flow_data: any;
    created_at: string;
    responses_count?: number;
}

const PRESETS = {
    contact: {
        title: "Basic Contact Form",
        fields: [
            { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
            { id: 'message', label: 'Message', type: 'long_text', placeholder: 'How can we help?', required: true }
        ]
    },
    outreach: {
        title: "Outreach & Collaboration",
        fields: [
            { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Jane Smith', required: true },
            { id: 'company', label: 'Company / Project', type: 'text', placeholder: 'Acme Corp', required: false },
            { id: 'email', label: 'Work Email', type: 'email', placeholder: 'jane@acme.com', required: true },
            { id: 'intent', label: 'Purpose of Outreach', type: 'select', placeholder: 'Select reason...', options: ['Partnership', 'Press Inquiry', 'Investment', 'Other'], required: true },
            { id: 'message', label: 'Brief Introduction', type: 'long_text', placeholder: 'Tell us a bit about why you are reaching out...', required: true }
        ]
    },
    waitlist: {
        title: "Simple Waitlist",
        fields: [
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
            { id: 'role', label: 'Your Role', type: 'text', placeholder: 'e.g. Founder, Designer', required: false },
            { id: 'source', label: 'How did you hear about us?', type: 'select', placeholder: 'Pick one...', options: ['Twitter/X', 'LinkedIn', 'Product Hunt', 'Friend', 'Other'], required: false }
        ]
    }
};

export function FormManager() {
    const { toast } = useToast();
    const router = useRouter();
    const [forms, setForms] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'interactive' | 'static'>('interactive');
    const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>('contact');

    // Create form state
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('survey_campaigns')
                .select('*')
                .eq('founder_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setForms(data || []);
        } catch (err) {
            console.error("Error fetching forms:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle) {
            toast("Title is required.", "error");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            const randomSuffix = Math.random().toString(36).substring(2, 5);
            const finalSlug = `${baseSlug}-${randomSuffix}`;

            const initialFlow = activeTab === 'interactive'
                ? {
                    type: 'interactive',
                    nodes: [
                        { id: 'start', type: 'start', data: { label: 'Welcome Screen' }, position: { x: 50, y: 150 }, style: { background: '#171717', color: '#fff', borderRadius: '12px', border: 'none', padding: '20px' } }
                    ],
                    edges: []
                }
                : {
                    type: 'static',
                    preset: selectedPreset,
                    fields: PRESETS[selectedPreset].fields
                };

            const { data, error } = await supabase
                .from('survey_campaigns')
                .insert([
                    {
                        founder_id: user.id,
                        title: newTitle,
                        slug: finalSlug,
                        flow_data: initialFlow
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setIsCreating(false);
            setNewTitle('');
            toast(`${activeTab === 'interactive' ? 'Campaign' : 'Form'} created!`, "success");

            if (activeTab === 'interactive') {
                router.push(`/desk/forms/builder/${data.id}`);
            } else {
                fetchForms();
            }
        } catch (err: any) {
            console.error("Error creating form:", err);
            if (err.code === '23505') toast("Slug already taken.", "error");
            else toast("Error: " + err.message, "error");
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all its responses.`)) return;

        try {
            const { error } = await supabase
                .from('survey_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchForms();
            toast("Form deleted", "success");
        } catch (err) {
            console.error("Error deleting form:", err);
            toast("Failed to delete form.", "error");
        }
    };

    const copyToClipboard = (text: string, msg: string) => {
        navigator.clipboard.writeText(text);
        toast(msg, "success");
    };

    const filteredForms = forms.filter(f => {
        const type = f.flow_data?.type || 'interactive';
        return type === activeTab;
    });

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading forms...</div>;

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #eee', marginBottom: '32px' }}>
                <button
                    onClick={() => { setActiveTab('interactive'); setIsCreating(false); }}
                    style={{
                        padding: '12px 0',
                        fontSize: '0.9375rem',
                        fontWeight: activeTab === 'interactive' ? 700 : 500,
                        color: activeTab === 'interactive' ? 'var(--primary)' : '#666',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: activeTab === 'interactive' ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 0.2s',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Interactive Surveys
                </button>
                <button
                    onClick={() => { setActiveTab('static'); setIsCreating(false); }}
                    style={{
                        padding: '12px 0',
                        fontSize: '0.9375rem',
                        fontWeight: activeTab === 'static' ? 700 : 500,
                        color: activeTab === 'static' ? 'var(--primary)' : '#666',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: activeTab === 'static' ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 0.2s',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Static Forms
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {activeTab === 'interactive' ? 'Interactive Flow Campaigns' : 'Minimal Static Forms'}
                </h2>
                <button className={styles.button} onClick={() => {
                    setIsCreating(true);
                    if (activeTab === 'static') {
                        setNewTitle(PRESETS[selectedPreset].title);
                    }
                }}>
                    + New {activeTab === 'interactive' ? 'Campaign' : 'Form'}
                </button>
            </div>

            {isCreating && (
                <div style={{ padding: '24px', background: 'white', border: '2px solid #6366f1', borderRadius: '16px', marginBottom: '32px' }}>

                    {activeTab === 'static' && (
                        <div style={{ marginBottom: '24px' }}>
                            <label className={styles.label} style={{ marginBottom: '12px', display: 'block' }}>Choose a Preset Template</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                {(Object.entries(PRESETS) as [keyof typeof PRESETS, any][]).map(([key, p]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSelectedPreset(key);
                                            setNewTitle(p.title);
                                        }}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: selectedPreset === key ? '2px solid #6366f1' : '1px solid #eee',
                                            background: selectedPreset === key ? '#f5f3ff' : '#fff',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedPreset === key ? '#6366f1' : '#111', marginBottom: '4px' }}>{p.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{p.fields.length} predefined fields</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{activeTab === 'interactive' ? 'Campaign' : 'Form'} Title</label>
                            <input
                                className={styles.input}
                                placeholder={activeTab === 'interactive' ? "e.g. Q1 Beta Discovery" : "e.g. Contact Us"}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setIsCreating(false)}>Cancel</button>
                        <button className={styles.button} onClick={handleCreate}>
                            {activeTab === 'interactive' ? 'Create & Build Flow' : 'Generate Static Form'}
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                {filteredForms.length === 0 ? (
                    <div style={{ padding: '60px', background: '#f9fafb', borderRadius: '20px', border: '1px dashed #ddd', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <p style={{ color: '#666' }}>
                            {activeTab === 'interactive'
                                ? 'No interactive campaigns yet. Build your first Typeform-style discovery flow.'
                                : 'No static forms yet. Create a minimal contact form for your site.'}
                        </p>
                    </div>
                ) : (
                    filteredForms.map(c => (
                        <div key={c.id} className={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{c.title}</h3>
                                <span className={styles.badgeActive}>LIVE</span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '20px' }}>
                                {activeTab === 'interactive' ? `tryventra.com/survey/${c.slug}` : `tryventra.com/form/${c.slug}`}
                            </p>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {activeTab === 'interactive' && (
                                    <button className={styles.button} style={{ flex: 1 }} onClick={() => router.push(`/desk/forms/builder/${c.id}`)}>
                                        Builder
                                    </button>
                                )}
                                <button className={`${styles.button} ${styles.secondaryButton}`} style={{ flex: 1 }} onClick={() => router.push(`/desk/forms/responses/${c.id}`)}>
                                    Responses
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px', color: '#ff4d4f' }}
                                    onClick={() => handleDelete(c.id, c.title)}
                                    title="Delete Form"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px' }}
                                    onClick={() => {
                                        const url = activeTab === 'interactive' ? `https://tryventra.com/survey/${c.slug}` : `https://tryventra.com/form/${c.slug}`;
                                        copyToClipboard(url, "Link copied!");
                                    }}
                                    title="Copy Link"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                </button>
                                {activeTab === 'static' && (
                                    <button
                                        className={`${styles.button} ${styles.secondaryButton}`}
                                        style={{ padding: '0 12px' }}
                                        onClick={() => {
                                            const embedCode = `<iframe src="https://tryventra.com/form/${c.slug}" width="100%" height="500px" frameborder="0"></iframe>`;
                                            copyToClipboard(embedCode, "Embed code copied!");
                                        }}
                                        title="Copy Embed Code"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
