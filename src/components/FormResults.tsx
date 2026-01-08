"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './EmailListManager.module.css';

export function FormResults({ campaign, onClose }: { campaign: any, onClose: () => void }) {
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponses();
    }, [campaign.id]);

    const fetchResponses = async () => {
        try {
            const { data, error } = await supabase
                .from('survey_responses')
                .select('*')
                .eq('campaign_id', campaign.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResponses(data || []);
        } catch (err) {
            console.error("Error fetching responses:", err);
        } finally {
            setLoading(false);
        }
    };

    const isStatic = campaign.flow_data?.type === 'static';

    // Extract all unique question/field IDs and texts
    const questions = isStatic
        ? (campaign.flow_data.fields || []).map((f: any) => ({
            id: f.id,
            text: f.label || 'Untitled Field'
        }))
        : (campaign.flow_data.nodes || [])
            .filter((n: any) => n.type === 'question')
            .map((n: any) => ({
                id: n.id,
                text: n.data.question || 'Untitled Question'
            }));

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading results...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{campaign.title} Results</h2>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>{responses.length} total responses collected</p>
                </div>
                <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                    Back to Forms
                </button>
            </div>

            <div style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', minWidth: '150px' }}>Date</th>
                                <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', minWidth: '200px' }}>Identifier (Email)</th>
                                {questions.map((q: any) => (
                                    <th key={q.id} style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', minWidth: '250px' }}>
                                        {q.text}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {responses.length === 0 ? (
                                <tr>
                                    <td colSpan={questions.length + 2} style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                                        No responses yet. Start sharing your form link!
                                    </td>
                                </tr>
                            ) : (
                                responses.map((res) => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px', fontSize: '0.8125rem', color: '#666' }}>
                                            {new Date(res.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {res.responder_email || <span style={{ color: '#ccc', fontWeight: 400 }}>-</span>}
                                        </td>
                                        {questions.map((q: any) => {
                                            const answer = res.answers[q.id];
                                            return (
                                                <td key={q.id} style={{ padding: '16px', fontSize: '0.875rem', color: '#444' }}>
                                                    {Array.isArray(answer) ? answer.join(', ') : (answer || '-')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
