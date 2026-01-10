"use client";

import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';
import { ChevronRight, ArrowRight } from 'lucide-react';
import PricingSection from '@/components/PricingSection';

const LOGOS = [
    { path: '/early-adopters/image.png' },
    { path: '/early-adopters/image copy.png' },
    { path: '/early-adopters/image copy 2.png' },
    { path: '/early-adopters/image copy 3.png' },
    { path: '/early-adopters/image copy 4.png' },
    { path: '/early-adopters/image copy 5.png' },
    { path: '/early-adopters/image copy 6.png' },
    { path: '/early-adopters/image copy 7.png' },
    { path: '/early-adopters/image copy 8.png' },
    { path: '/early-adopters/image copy 9.png' },
    { path: '/early-adopters/image copy 10.png' },
];

const AI_LOGOS = [
    { path: '/logos/chatgpt.png', name: 'ChatGPT' },
    { path: '/logos/gemini.png', name: 'Gemini' },
    { path: '/logos/google.png', name: 'Google' },
    { path: '/logos/perplexity.png', name: 'Perplexity' },
    { path: '/logos/bing.png', name: 'Bing' },
    { path: '/logos/claude.png', name: 'Claude' },
];

const TESTIMONIALS = [
    {
        name: 'Angellos Koulli',
        title: 'CEO of Alphaveata',
        image: '/people/QzHaccUuiiTxyRtIkLrRDPEG9Gw.avif',
        quote: '"Ventra has completely transformed how we view search. It\'s no longer just about SEO; with their AEO platform, we\'re finally visible across ChatGPT and Perplexity. The depth of their Market Radar is unlike anything I\'ve seen before. Genuinely the best intelligence tool in the AI era."'
    },
    {
        name: 'Jake Duffy',
        title: 'Co-founder of Fueled',
        image: '/people/ekZBFZKN5TB5l8UFo37dX5A728.avif',
        quote: '"We were struggling to keep up with how AI was changing search behavior until we started using Ventra. Their optimization strategies helped us capture a massive segment of traffic from Gemini and Claude that we didn\'t even know we were missing. It\'s been a game-changer for our growth."'
    },
    {
        name: 'Sam Bar',
        title: 'CEO of Roc',
        image: '/people/iVwPaTgAlEs6DPvn3G7ax6Q8ylY.avif',
        quote: '"The level of clarity Ventra provides into AI search indices is incredible. Their platform isn\'t just a tool; it\'s a strategic partner that has helped us dominate our niche. The visitor intelligence alone is worth its weight in gold."'
    },
    {
        name: 'Oliver Hudson',
        title: 'Marketing Director',
        image: '/people/jzRZOY16b9xi4tV4SK9QACKvI.avif',
        quote: '"The insights provided by the Ventra platform have been transformative for our AEO strategy. We now have a clear roadmap for dominating search across all AI engines, not just Google. Truly a clinical approach to modern search visibility."'
    }
];

export default function LandingPage() {
    return (
        <div className={styles.page}>
            {/* Navigation */}
            <div className={styles.navWrapper}>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logoArea}>
                        <img src="/images/logo.svg" alt="Ventra" width="24" height="24" />
                        <span className={styles.logoText}>Ventra</span>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link href="#platform" className={styles.navLink}>AEO Platform</Link>
                        <Link href="#market-radar" className={styles.navLink}>Market Radar</Link>
                        <Link href="#pricing" className={styles.navLink}>Pricing</Link>
                        <Link href="#intelligence" className={styles.navLink}>Intelligence</Link>
                    </div>

                    <Link href="/login" className={styles.bookBtn}>
                        Get Started
                    </Link>
                </nav>
            </div>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroGlow} />
                <div className={styles.container}>
                    <div className={styles.heroBadge}>
                        <img src="/logos/google.png" alt="Google" className={styles.googleIcon} />
                        Official AEO Research Partner
                    </div>

                    <h1 className={styles.heroTitle}>
                        The Search Platform<br />
                        For The AI Era
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Leveraging proven strategies to help businesses dominate Google Search, Perplexity, Claude, and Gemini.
                    </p>

                    <Link href="/login" className={styles.founderCTA}>
                        <span className={styles.ctaMain}>Get Started</span>
                        <div className={styles.arrowCircle}>
                            <ArrowRight size={18} strokeWidth={3} />
                        </div>
                    </Link>
                </div>
            </section>

            {/* Social Proof */}
            <section className={styles.socialProof}>
                <div className={styles.container}>
                    <p className={styles.trustLabel}>Trusted by 50+ forward-thinking companies</p>
                    <div className={styles.logoGrid}>
                        {LOGOS.map((logo, idx) => (
                            <div key={idx} className={styles.logoItem}>
                                <img src={logo.path} alt={`Partner ${idx}`} style={{ maxHeight: '24px', opacity: 0.8, filter: 'brightness(0) invert(1)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* AEO Funnel Section */}
            <section className={styles.funnelSection}>
                <div className={styles.container}>
                    <div className={styles.funnelBadge}>
                        <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                        Transform Your Search Visibility
                    </div>
                    <h2 className={styles.funnelTitle}>From Google to AI — be seen everywhere.</h2>
                    <p className={styles.funnelSubtitle}>
                        From Google and ChatGPT to other emerging AI engines, we ensure your brand is visible wherever your customers search.
                    </p>

                    <div className={styles.funnelContainer}>
                        <div className={styles.aiLogoRow}>
                            {AI_LOGOS.map((logo, idx) => (
                                <div key={idx} className={styles.aiLogoItem}>
                                    <img src={logo.path} alt={logo.name} />
                                </div>
                            ))}
                        </div>

                        <svg className={styles.funnelLines} viewBox="0 0 800 300" preserveAspectRatio="none">
                            {[28, 176, 325, 474, 623, 772].map((x, i) => (
                                <g key={i}>
                                    <path
                                        d={`M 400 300 Q ${x} 150, ${x} 50 L ${x} 0`}
                                        className={styles.funnelPath}
                                    />
                                    <path
                                        d={`M 400 300 Q ${x} 150, ${x} 50 L ${x} 0`}
                                        className={styles.activeFunnelPath}
                                    />
                                </g>
                            ))}
                        </svg>

                        <div className={styles.ventraTarget}>
                            <img src="/images/logo.svg" alt="Ventra" width="32" height="32" />
                            <span className={styles.logoText}>Ventra</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Marquee */}
            <section className={styles.testimonialsSection}>
                <div className={styles.container}>
                    <div className={styles.testimonialsHeader}>
                        <div className={styles.testimonialsBadge}>
                            <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                            Testimonials
                        </div>
                        <h2 className={styles.testimonialsTitle}>Don't just take our word for it.</h2>
                    </div>

                    <div className={styles.marqueeWrapper}>
                        <div className={styles.marquee}>
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((item, idx) => (
                                <div key={idx} className={styles.testimonialCard}>
                                    <div className={styles.testimonialUser}>
                                        <img src={item.image} alt={item.name} className={styles.userPhoto} />
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{item.name}</span>
                                            <span className={styles.userTitle}>{item.title}</span>
                                        </div>
                                    </div>
                                    <p className={styles.testimonialQuote}>{item.quote}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 1: Audit */}
            <section className={styles.featureSection} id="platform">
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureContent}>
                            <div className={styles.featureBadge}>
                                Technical Audit
                            </div>
                            <h2 className={styles.featureHeading}>
                                Fix what's stopping your site from appearing in AI responses.
                            </h2>
                            <p className={styles.featureDescription}>
                                Stop guessing why you're invisible. Ventra's clinical audit engine deep-scans your site's architecture and content hierarchy through the lens of ChatGPT, Perplexity, and Gemini. Identify technical blockers and content gaps that prevent your brand from being the top-cited answer.
                            </p>
                        </div>
                        <div className={styles.featureVisual}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/me.png"
                                alt="Ventra Audit Interface"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Market Intelligence */}
            <section className={styles.featureSection} id="market-radar" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.container}>
                    <div className={styles.featureGrid} style={{ direction: 'rtl' }}>
                        <div className={styles.featureContent} style={{ direction: 'ltr' }}>
                            <div className={styles.featureBadge}>
                                Market Intelligence
                            </div>
                            <h2 className={styles.featureHeading}>
                                Know what people search when looking for products like yours.
                            </h2>
                            <p className={styles.featureDescription}>
                                Get inside the mind of the modern searcher. Ventra captures real-time natural language queries that traditional SEO tools miss. Understand the exact questions, pain points, and comparison intents your customers are entering into AI search engines.
                            </p>
                        </div>
                        <div className={styles.featureVisual} style={{ direction: 'ltr' }}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/recentTopics.png"
                                alt="Ventra Market Intelligence"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Trend Analytics */}
            <section className={styles.featureSection} style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureContent}>
                            <div className={styles.featureBadge}>
                                Trend Analytics
                            </div>
                            <h2 className={styles.featureHeading}>
                                We help you track what search queries are popular overtime.
                            </h2>
                            <p className={styles.featureDescription}>
                                Anticipate what's next. Ventra's temporal analytics engine tracks the velocity and volume of AI search queries over time, allowing you to identify emerging market shifts before they saturate. Pivot your strategy with data-backed precision as search behaviors evolve.
                            </p>
                        </div>
                        <div className={styles.featureVisual}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/aeo.png"
                                alt="Ventra Trend Analytics"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 4: Multi-Platform Optimization */}
            <section className={styles.featureSection} style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.container}>
                    <div className={styles.featureGrid} style={{ direction: 'rtl' }}>
                        <div className={styles.featureContent} style={{ direction: 'ltr' }}>
                            <div className={styles.featureBadge}>
                                Multi-Platform AEO
                            </div>
                            <h2 className={styles.featureHeading}>
                                Optimize your website's performance in all AI platforms.
                            </h2>
                            <p className={styles.featureDescription}>
                                Don't let your brand be a footnote. Ventra provides specialized directives for every major AI engine—from ChatGPT and Claude to Gemini and Perplexity. Ensure your content is indexed, understood, and recommended across the entire AI ecosystem.
                            </p>
                        </div>
                        <div className={styles.featureVisual} style={{ direction: 'ltr' }}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/ai-tools.png"
                                alt="Ventra AI Platform Optimization"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 5: Continuous Optimization */}
            <section className={styles.featureSection} style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureContent}>
                            <div className={styles.featureBadge}>
                                Continuous Recalibration
                            </div>
                            <h2 className={styles.featureHeading}>
                                Constant optimization to make your website visible.
                            </h2>
                            <p className={styles.featureDescription}>
                                AI search engine algorithms evolve daily. Ventra's automated optimizer creates a closed-loop system that continuously monitors platform shifts and recalibrates your technical directives in real-time. Stay ahead of the curve with an optimization engine that never sleeps.
                            </p>
                        </div>
                        <div className={styles.featureVisual}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/optimizer.png"
                                alt="Ventra Continuous Optimizer"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 6: Live Monitoring */}
            <section className={styles.featureSection} id="intelligence" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className={styles.container}>
                    <div className={styles.featureGrid} style={{ direction: 'rtl' }}>
                        <div className={styles.featureContent} style={{ direction: 'ltr' }}>
                            <div className={styles.featureBadge}>
                                Real-time Insights
                            </div>
                            <h2 className={styles.featureHeading}>
                                Stay updated of what people are looking for.
                            </h2>
                            <p className={styles.featureDescription}>
                                The AI search landscape moves fast. Ventra provides live dashboards that track shifting user interests and query volumes, ensuring you never miss a trending topic or a new customer intent.
                            </p>
                        </div>
                        <div className={styles.featureVisual} style={{ direction: 'ltr' }}>
                            <div className={styles.featureGlow} />
                            <img
                                src="/images/screenshots/chart.png"
                                alt="Ventra Live Monitoring"
                                className={styles.featureImage}
                            />
                        </div>
                    </div>
                </div>
            </section>



            {/* FAQ Section */}
            <section className={styles.faqSection}>
                <div className={styles.container}>
                    <div className={styles.faqContainer}>
                        <div className={styles.faqHeader}>
                            <h2 className={styles.faqTitle}>Your questions, answered.</h2>
                            <p className={styles.faqDescription}>Everything you need to know about the product and billing.</p>
                        </div>
                        <div className={styles.faqList}>
                            {[
                                {
                                    q: "What is AEO (AI Engine Optimization)?",
                                    a: "AEO is the process of optimizing your website and content so that AI-driven search engines like Google AI Mode, ChatGPT, and Perplexity can understand, recommend, and cite your brand in their answers."
                                },
                                {
                                    q: "How is AEO different from traditional SEO?",
                                    a: "Traditional SEO focuses on ranking in search results for keywords, while AEO ensures your brand appears in conversational, AI-powered answers - often where customers are making faster decisions."
                                },
                                {
                                    q: "Do you also manage Google Ads?",
                                    a: "Yes - unlike most agencies, we combine Google Ads with AEO. This means you get both instant visibility through paid campaigns and long-term growth through AI-driven optimisation."
                                },
                                {
                                    q: "Which platforms do you optimize for?",
                                    a: "We currently specialise for Google Search + AI Mode, Bing Copilot, Google Gemini, ChatGPT, and Perplexity, with more engines added as they emerge."
                                },
                                {
                                    q: "How do you measure success?",
                                    a: "We track success through increased answer citations, improved sentiment in AI responses, and direct traffic from AI platforms. Our dashboards provide granular metrics on your brand's share of voice in the AI ecosystem."
                                },
                                {
                                    q: "How quickly will I see results?",
                                    a: "Initial technical optimizations are indexed within days. However, building 'entity authority' for consistent AI citations typically takes 3-6 months of sustained optimization, depending on your niche's competitiveness."
                                },
                                {
                                    q: "Do you work with any industry?",
                                    a: "We specialize in B2B SaaS, E-commerce, and high-value service industries where research-driven purchase decisions are common. We vet all potential partners to ensure our AI strategies will be effective for their specific market."
                                }
                            ].map((item, idx) => (
                                <FAQItem key={idx} question={item.q} answer={item.a} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section (Existing) */}
            <div id="pricing">
                <PricingSection />
            </div>

            {/* Footer (Simplified for new design) */}
            <footer style={{ padding: '80px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <div className={styles.container}>
                    <div className={styles.logoArea} style={{ justifyContent: 'center', marginBottom: '24px' }}>
                        <img src="/images/logo.svg" alt="Ventra" width="24" height="24" />
                        <span className={styles.logoText}>Ventra</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
                        © {new Date().getFullYear()} Ventra AI. Pioneering the future of Answer Engine Optimization.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                        <Link href="/privacy" className={styles.navLink}>Privacy</Link>
                        <Link href="/terms" className={styles.navLink}>Terms</Link>
                    </div>
                </div>
            </footer>

            {/* Global styles for the logos if needed or transitions */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
          margin: 0;
          background: #050505;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div >
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className={styles.faqItem}>
            <button
                className={styles.faqQuestion}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {question}
                <div className={styles.faqIcon} style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 1V11M1 6H11" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
            <div className={`${styles.faqAnswer} ${isOpen ? styles.open : ''}`}>
                <p className={styles.faqAnswerText}>{answer}</p>
            </div>
        </div>
    );
}
