"use client";

import React from 'react';
import styles from './PricingSection.module.css';
import { supabase } from '@/lib/supabase';
import { useToast } from './Toaster';

const CheckIcon = () => (
    <svg className={styles.checkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function PricingSection() {
    const { toast } = useToast();
    const [loadingTier, setLoadingTier] = React.useState<string | null>(null);

    const handleCheckout = async (tierName: string, productId: string) => {
        try {
            setLoadingTier(tierName);

            // Get current session
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast('Please sign in to continue.', 'info');
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    userId: session.user.id,
                    customerEmail: session.user.email,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast('Something went wrong. Please try again or contact support.', 'error');
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <section className={styles.section} id="pricing">
            <div className={styles.container}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Simple, transparent pricing</h2>
                    <div className={styles.foundingNote}>Scale from tool to transformation</div>
                </header>

                <div className={styles.grid}>
                    {/* TIER 1: AEO Core Platform */}
                    <div className={styles.card}>
                        <div className={styles.tierName}>AEO Core Platform</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$99</span>
                            <span className={styles.period}>/ month</span>
                        </div>
                        <p className={styles.tagline}>Self-service tools to manage your own AI readiness.</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>Software Suite</div>
                            <div className={styles.featureItem}><CheckIcon /> AI Answer Audit & Monitoring</div>
                            <div className={styles.featureItem}><CheckIcon /> Content Snippification Engine</div>
                            <div className={styles.featureItem}><CheckIcon /> Structured Data Manager</div>
                            <div className={styles.featureItem}><CheckIcon /> Multi-Index Crawlability</div>
                            <div className={styles.featureItem}><CheckIcon /> AI Asset Generator</div>
                            <div className={styles.featureItem}><CheckIcon /> Access to Market Radar</div>
                            <div className={styles.featureItem}><CheckIcon /> Web analytics</div>
                            <div className={styles.featureItem}><CheckIcon /> AEO optimizer</div>
                        </div>

                        <button
                            disabled={loadingTier !== null}
                            onClick={() => handleCheckout('Core Platform', process.env.NEXT_PUBLIC_DODO_STARTER_ID || 'p_starter')}
                            className={`${styles.cta} ${styles.ctaLengthy}`}
                            style={{ background: '#333', color: '#fff' }}
                        >
                            {loadingTier === 'Core Platform' ? 'Processing...' : (
                                <>Get Access <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>→</span></>
                            )}
                        </button>
                        <div className={styles.positioning}>“See the problem.”</div>
                    </div>

                    {/* TIER 2: AEO Content Sprint */}
                    <div className={`${styles.card} ${styles.highlightCard}`}>
                        <div className={styles.popularBadge}>Most Popular</div>
                        <div className={styles.tierName}>AEO Content Sprint</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$1,469</span>
                            <span className={styles.period}>/ sprint</span>
                        </div>
                        <p className={styles.tagline}>Done-For-You implementation to become "answer-ready".</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>Implementation Service</div>
                            <div className={styles.featureItem}><CheckIcon /> Everything in Core Platform</div>
                            <div className={styles.featureItem}><CheckIcon /> Manual "Answer Capsule" Rewrite</div>
                            <div className={styles.featureItem}><CheckIcon /> LLM Citation Building</div>
                            <div className={styles.featureItem}><CheckIcon /> Technical AEO Deployment</div>
                            <div className={styles.featureItem}><CheckIcon /> Entity Recognition Boost</div>
                            <div className={styles.featureItem}><CheckIcon /> JSON-LD Schema Deployment</div>
                        </div>

                        <a
                            href="https://cal.com/tryventra/discoverycall"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.cta} ${styles.ctaPrimary}`}
                        >
                            Book Discovery Call <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>→</span>
                        </a>
                        <div className={styles.positioning}>“Fix the content.”</div>
                    </div>

                    {/* TIER 3: Authority & Scale Engine */}
                    <div className={styles.card}>
                        <div className={styles.tierName}>Authority Engine</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$3,948</span>
                            <span className={styles.period}>/ month</span>
                        </div>
                        <p className={styles.tagline}>Enterprise-level niche domination and scale.</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>Enterprise Partnership</div>
                            <div className={styles.featureItem}><CheckIcon /> "House Answer" Strategy</div>
                            <div className={styles.featureItem}><CheckIcon /> Competitor Intelligence & Gap Analysis</div>
                            <div className={styles.featureItem}><CheckIcon /> Advanced Entity Building</div>
                            <div className={styles.featureItem}><CheckIcon /> Share of Voice Management</div>
                            <div className={styles.featureItem}><CheckIcon /> Optional Google Ads Increment</div>
                            <div className={styles.featureItem}><CheckIcon /> Dedicated Account Manager</div>
                        </div>

                        <a
                            href="https://cal.com/tryventra/discoverycall"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.cta} ${styles.ctaSecondary}`}
                        >
                            Contact Sales <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>→</span>
                        </a>
                        <div className={styles.positioning}>“Own the entity.”</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
