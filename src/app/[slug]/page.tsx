"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './public_form.module.css';
import { useToast } from '@/components/Toaster';

export default function PublicFeedbackPage() {
    const { toast } = useToast();
    const params = useParams();
    const slug = params?.slug as string;

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (slug) fetchCampaign();
    }, [slug]);

    const fetchCampaign = async () => {
        try {
            const { data, error } = await supabase
                .from('discovery_campaigns')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setCampaign(data);
        } catch (err) {
            console.error("Error fetching campaign:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const tableName = campaign.campaign_type === 'waitlist' ? 'waitlist_entries' : 'discovery_responses';
            const payload: any = {
                campaign_id: campaign.id,
                email
            };

            if (campaign.campaign_type !== 'waitlist') {
                payload.feedback_text = feedback;
            }

            const { error } = await supabase
                .from(tableName)
                .insert([payload]);

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            toast("Something went wrong. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
        </div>
    );

    if (!campaign) return (
        <div className={styles.errorContainer}>
            <h1>404</h1>
            <p>Discovery campaign not found.</p>
        </div>
    );

    if (submitted) return (
        <div className={styles.successContainer}>
            <div className={styles.successCard}>
                <div className={styles.checkIcon}>✓</div>
                <h1>Thank You!</h1>
                <p>Your feedback is invaluable. If you're selected for a discovery call regarding the <strong>{campaign.incentive}</strong>, we'll reach out to your email.</p>
                <button onClick={() => setSubmitted(false)} className={styles.secondaryButton}>Submit another response</button>
            </div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={campaign.campaign_type === 'waitlist' ? styles.minimalWrapper : styles.formCard}>
                {campaign.campaign_type !== 'waitlist' && (
                    <div className={styles.header}>
                        <p className={styles.topLabel}>PILOT PROGRAM</p>
                        <h1 className={styles.oneLiner}>"{campaign.one_liner}"</h1>
                        {campaign.incentive && (
                            <div className={styles.incentiveBadge}>
                                🎁 Earn: {campaign.incentive}
                            </div>
                        )}
                    </div>
                )}

                {campaign.campaign_type === 'waitlist' ? (
                    <div className={styles.waitlistWrapper}>
                        <form onSubmit={handleSubmit} className={styles.waitlistForm}>
                            <div className={styles.waitlistPill}>
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.waitlistInput}
                                />
                                <button type="submit" disabled={submitting} className={styles.waitlistButton}>
                                    {submitting ? "..." : "Join"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Your Email</label>
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>What's your biggest pain point regarding this?</label>
                            <textarea
                                required
                                placeholder="Be brutally honest..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className={styles.textarea}
                            />
                        </div>

                        <button type="submit" disabled={submitting} className={styles.submitButton}>
                            {submitting ? "Submitting..." : "Get Early Access"}
                        </button>

                        <p className={styles.footerNote}>
                            Powered by <strong>Ventra</strong> Strategy Suite
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
