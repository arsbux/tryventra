import React from 'react';
import Link from 'next/link';
import styles from './OpportunityCard.module.css';

interface OpportunityCardProps {
  title: string;
  description: string;
  platform: 'Reddit' | 'AngelList' | 'Discord' | 'X/Twitter' | 'GitHub' | 'Hacker News' | 'Crunchbase' | 'Other' | 'BuiltWith' | 'Product Hunt' | 'G2' | 'Clutch' | 'Google Maps' | 'Database';
  link: string;
  tags?: string[];
  postedAt?: string;
  opportunityType: 'Expansion' | 'Tech Swap' | 'Pain Point' | 'Marketplace RFP' | 'Quick Gig' | 'Freelance' | 'Agency Lead' | 'Full-Time';
  signal: string;
  insight: string;
  desperationScore: number; // Intent or Match Score
  actionLabel?: string;
  isStarred?: boolean;
  onToggleStar?: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps & { id: string }> = ({
  id,
  title,
  description,
  platform,
  link,
  tags,
  postedAt,
  opportunityType,
  signal,
  insight,
  desperationScore,
  actionLabel,
  isStarred,
  onToggleStar
}) => {
  const getIcon = () => {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#64748b';
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>{getIcon()}</span>
          <div className={styles.headerTexts}>
            <span className={styles.platform}>{platform}</span>
            <span className={styles.typeTag}>{opportunityType}</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          {onToggleStar && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleStar();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: isStarred ? '#f59e0b' : '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}
              title={isStarred ? "Remove Star" : "Star Lead"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          )}
          <div className={styles.scoreBadge} style={{ color: getScoreColor(desperationScore) }}>
            {desperationScore}
          </div>
        </div>
      </div >

      <h3 className={styles.title}>{title}</h3>

      <div className={styles.deepSearchSection}>
        <div className={styles.signalBlock}>
          <span className={styles.sectionLabel}>SIGNAL</span>
          <p className={styles.signalText}>"{signal}"</p>
        </div>
        <div className={styles.insightBlock}>
          <span className={styles.sectionLabel}>INSIGHT</span>
          <p className={styles.insightText}>{insight}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <Link
          href={`/post/${encodeURIComponent(id)}?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}&platform=${encodeURIComponent(platform)}`}
          className={styles.button}
        >
          {actionLabel || 'Analyze'}
        </Link>
      </div>
    </div >
  );
};
