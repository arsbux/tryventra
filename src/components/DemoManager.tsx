"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './EmailListManager.module.css';
import { useToast } from './Toaster';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from './Sidebar';

interface VideoDemo {
    id: string;
    slug: string;
    title: string;
    video_url: string;
    video_path: string;
    created_at: string;
}

export function DemoManager() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [demos, setDemos] = useState<VideoDemo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchDemos();

        const justSaved = searchParams?.get('new_demo');
        if (justSaved) {
            toast("New video demo saved successfully!", "success");
            router.replace('/desk/demos');
        }
    }, [searchParams]);

    const fetchDemos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('video_demos')
                .select('*')
                .eq('founder_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDemos(data || []);
        } catch (err: any) {
            console.error("Error fetching video demos:", err);
            toast(`Fetch Error: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = () => {
        if (!newTitle) {
            toast("Please enter a title for your video demo.", "error");
            return;
        }

        sessionStorage.setItem('pending_video_title', newTitle);
        router.push('/desk/demos/record');
    };

    const handleDelete = async (id: string, path: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            // Delete from storage first
            const { error: storageError } = await supabase.storage
                .from('demos')
                .remove([path]);

            if (storageError) console.error("Storage delete error:", storageError);

            const { error } = await supabase
                .from('video_demos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchDemos();
            toast("Video demo deleted", "success");
        } catch (err) {
            console.error("Error deleting demo:", err);
            toast("Failed to delete video demo.", "error");
        }
    };

    const copyToClipboard = (text: string, msg: string) => {
        navigator.clipboard.writeText(text);
        toast(msg, "success");
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading video demos...</div>;

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Video Demos</h2>
                <button className={styles.button} onClick={() => setIsCreating(true)}>
                    + Record New Demo
                </button>
            </div>

            {isCreating && (
                <div style={{ padding: '24px', background: 'white', border: '2px solid #6366f1', borderRadius: '16px', marginBottom: '32px' }}>
                    <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                        <label className={styles.label}>Demo Title</label>
                        <input
                            className={styles.input}
                            placeholder="e.g. Dashboard Walkthrough"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setIsCreating(false)}>Cancel</button>
                        <button className={styles.button} onClick={handleCreateRequest}>
                            Go to Recorder
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.grid}>
                {demos.length === 0 ? (
                    <div style={{ padding: '60px', background: '#f9fafb', borderRadius: '20px', border: '1px dashed #ddd', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            No video demos yet. Record your screen and share it with a link.
                        </p>
                        <button className={styles.button} onClick={() => setIsCreating(true)}>Record Your First Demo</button>
                    </div>
                ) : (
                    demos.map(d => (
                        <div key={d.id} className={styles.card}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
                                <video src={d.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'} onClick={() => window.open(`/demo/${d.slug}`, '_blank')}>
                                    {/* Placeholder for Play Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{d.title}</h3>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '20px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                /demo/{d.slug}
                            </p>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    className={styles.button}
                                    style={{ flex: 1, minWidth: '80px' }}
                                    onClick={() => window.open(`/demo/${d.slug}`, '_blank')}
                                >
                                    Open
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px' }}
                                    onClick={() => {
                                        sessionStorage.setItem('pending_video_title', d.title);
                                        router.push(`/desk/demos/record?edit=${d.slug}`);
                                    }}
                                    title="Edit / Trim"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px' }}
                                    onClick={() => {
                                        const embedCode = `<iframe src="${window.location.origin}/demo/${d.slug}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
                                        copyToClipboard(embedCode, "Embed code copied!");
                                    }}
                                    title="Copy Embed Code"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px' }}
                                    onClick={() => {
                                        const url = `${window.location.origin}/demo/${d.slug}`;
                                        copyToClipboard(url, "Demo link copied!");
                                    }}
                                    title="Copy Link"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    style={{ padding: '0 12px', color: '#ff4d4f' }}
                                    onClick={() => handleDelete(d.id, d.video_path, d.title)}
                                    title="Delete Demo"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
