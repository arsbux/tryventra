"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './form.module.css';
import { useToast } from '@/components/Toaster';

export default function PublicStaticFormPage() {
    const { toast } = useToast();
    const params = useParams();
    const slug = params?.slug as string;

    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (slug) fetchForm();
    }, [slug]);

    const fetchForm = async () => {
        try {
            const { data, error } = await supabase
                .from('survey_campaigns')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setForm(data);

            const initial: any = {};
            (data.flow_data.fields || []).forEach((f: any) => {
                initial[f.id] = '';
            });
            setFormData(initial);
        } catch (err) {
            console.error("Error fetching form:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('survey_responses')
                .insert([
                    {
                        campaign_id: form.id,
                        responder_email: formData.email || null,
                        answers: formData
                    }
                ]);

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting form:", err);
            toast("Failed to submit. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.centered}><div className={styles.spinner}></div></div>;
    if (!form || form.flow_data.type !== 'static') return <div className={styles.centered}><h1>404</h1><p>Form not found.</p></div>;

    if (submitted) return (
        <div className={styles.wrapper}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <div className={styles.checkIcon}>✓</div>
                <h1 className={styles.title}>Success!</h1>
                <p className={styles.desc}>Your message has been sent successfully.</p>
                <button
                    className={styles.mainButton}
                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
                    onClick={() => setSubmitted(false)}
                >
                    Send another message
                </button>
                <div className={styles.poweredBy}>Powered by Ventra</div>
            </div>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h1 className={styles.title}>{form.title}</h1>
                <p className={styles.desc}>Please fill out the form below.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(form.flow_data.fields || []).map((field: any) => (
                        <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                {field.label}
                                {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                            </label>
                            {field.type === 'long_text' ? (
                                <textarea
                                    className={styles.textarea}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.id]}
                                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    className={styles.input}
                                    required={field.required}
                                    value={formData[field.id]}
                                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="" disabled>{field.placeholder || "Select an option"}</option>
                                    {(field.options || []).map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    className={styles.input}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.id]}
                                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className={styles.mainButton}
                        disabled={submitting}
                        style={{ marginTop: '8px' }}
                    >
                        {submitting ? 'Sending...' : 'Submit Message'}
                    </button>
                </form>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.poweredBy}>Powered by Ventra</div>
                </div>
            </div>
        </div>
    );
}
