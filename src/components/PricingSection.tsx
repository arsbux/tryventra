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
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
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
                    <h2 className={styles.title}>Simple, predictable pricing</h2>
                    <div className={styles.foundingNote}>Founding pricing — will increase</div>
                </header>

                <div className={styles.grid}>
                    {/* TIER 1: STARTER */}
                    <div className={styles.card}>
                        <div className={styles.tierName}>Starter</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$199</span>
                            <span className={styles.period}>/ one-time</span>
                        </div>
                        <p className={styles.tagline}>Everything you need to kickstart your client acquisition.</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>What you get</div>
                            <div className={styles.featureItem}><CheckIcon /> All lead generation features</div>
                            <div className={styles.featureItem}><CheckIcon /> Unlimited leads / contacts</div>
                            <div className={styles.featureItem}><CheckIcon /> All contact information</div>
                            <div className={styles.featureItem}><CheckIcon /> Export to Notion, Sheets, Zapier</div>
                            <div className={styles.featureItem}><CheckIcon /> All market signals</div>
                            <div className={styles.featureItem}><CheckIcon /> Email + LinkedIn + Twitter + Phone</div>
                            <div className={styles.featureItem}><CheckIcon /> Email accuracy priority</div>

                            <div className={styles.featureGroupTitle}>Limits</div>
                            <div className={styles.featureItem} style={{ color: '#9ca3af' }}><CheckIcon /> No recurring platform updates</div>
                        </div>

                        <button
                            disabled={loadingTier !== null}
                            onClick={() => handleCheckout('Starter', process.env.NEXT_PUBLIC_DODO_STARTER_ID || 'p_starter')}
                            className={`${styles.cta} ${styles.ctaSecondary}`}
                        >
                            {loadingTier === 'Starter' ? 'Processing...' : (
                                <>Get Starter <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>→</span></>
                            )}
                        </button>
                        <div className={styles.positioning}>“Get clients now. No subscription.”</div>
                    </div>

                    {/* TIER 2: GROWTH (MOST POPULAR) */}
                    <div className={`${styles.card} ${styles.highlightCard}`}>
                        <div className={styles.popularBadge}>Most Popular</div>
                        <div className={styles.tierName}>Growth</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$299</span>
                            <span className={styles.period}>/ month</span>
                        </div>
                        <p className={styles.tagline}>For scaling agencies and dedicated sales teams.</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>What you get</div>
                            <div className={styles.featureItem}><CheckIcon /> All lead generation features</div>
                            <div className={styles.featureItem}><CheckIcon /> Unlimited leads / contacts</div>
                            <div className={styles.featureItem}><CheckIcon /> All contact information</div>
                            <div className={styles.featureItem}><CheckIcon /> Export to Notion, Sheets, Zapier</div>
                            <div className={styles.featureItem}><CheckIcon /> All market signals</div>
                            <div className={styles.featureItem}><CheckIcon /> Email + LinkedIn + Twitter + Phone</div>
                            <div className={styles.featureItem}><CheckIcon /> Platform Customizations</div>
                            <div className={styles.featureItem}><CheckIcon /> Support</div>
                            <div className={styles.featureItem}><CheckIcon /> Email accuracy priority</div>
                        </div>

                        <button
                            disabled={loadingTier !== null}
                            onClick={() => handleCheckout('Growth', process.env.NEXT_PUBLIC_DODO_GROWTH_ID || 'p_growth')}
                            className={`${styles.cta} ${styles.ctaPrimary}`}
                        >
                            {loadingTier === 'Growth' ? 'Processing...' : (
                                <>Get Growth <span style={{ fontSize: '1.1rem', marginLeft: '4px', color: '#fff' }}>→</span></>
                            )}
                        </button>
                    </div>

                    {/* TIER 3: AGENCY */}
                    <div className={styles.card}>
                        <div className={styles.tierName}>Agency</div>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>$999</span>
                            <span className={styles.period}>/ month</span>
                        </div>
                        <p className={styles.tagline}>The ultimate AI-powered outbound engine.</p>

                        <div className={styles.featureList}>
                            <div className={styles.featureGroupTitle}>What you get</div>
                            <div className={styles.featureItem}><CheckIcon /> All lead generation features</div>
                            <div className={styles.featureItem}><CheckIcon /> Unlimited leads / contacts</div>
                            <div className={styles.featureItem}><CheckIcon /> All contact information</div>
                            <div className={styles.featureItem}><CheckIcon /> Export to Notion, Sheets, Zapier</div>
                            <div className={styles.featureItem}><CheckIcon /> All market signals</div>
                            <div className={styles.featureItem}><CheckIcon /> Email + LinkedIn + Twitter + Phone</div>
                            <div className={styles.featureItem}><CheckIcon /> Platform Customizations</div>
                            <div className={styles.featureItem}><CheckIcon /> 24/7 Support</div>
                            <div className={styles.featureItem}><CheckIcon /> Email accuracy priority</div>
                            <div className={styles.featureItem}><CheckIcon /> Custom AI agent delivery</div>
                            <div className={styles.featureItem}><CheckIcon /> Voice call AI agent 24/7</div>
                        </div>

                        <button
                            disabled={loadingTier !== null}
                            onClick={() => handleCheckout('Agency', process.env.NEXT_PUBLIC_DODO_AGENCY_ID || 'p_agency')}
                            className={`${styles.cta} ${styles.ctaSecondary}`}
                        >
                            {loadingTier === 'Agency' ? 'Processing...' : (
                                <>Get Agency <span style={{ fontSize: '1.1rem', marginLeft: '4px' }}>→</span></>
                            )}
                        </button>
                        <div className={styles.positioning}>“Replace junior SDRs with software.”</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
