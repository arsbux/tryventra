"use client";

import Link from 'next/link';
import styles from './LeadsTable.module.css';
import { useState } from 'react';
import { useToast } from './Toaster';

export interface Lead {
    id: string;
    title: string;
    contact: string;
    status: string;
    email: string;
    phone?: string;
    socials?: string;
    link: string;
    platform: string;
    insight?: string;
    isStarred?: boolean;
    createdAt?: string;
}

const STATUS_OPTIONS = [
    'Prospect',
    'Pitching',
    'Secured lead',
    'Proposal sent',
    'Closed',
    'Lost'
];

export function LeadsTable({
    leads,
    onUpdate,
    onDelete,
    onToggleStar,
    readOnly = false,
    allowStageEdit = false,
    hideHeader = false,
    disableInteractions = false
}: {
    leads: Lead[],
    onUpdate?: (id: string, field: string, value: any) => void,
    onDelete?: (id: string) => void,
    onToggleStar?: (id: string) => void,
    readOnly?: boolean,
    allowStageEdit?: boolean,
    hideHeader?: boolean,
    disableInteractions?: boolean
}) {
    const { toast } = useToast();

    const handleChange = (id: string, field: keyof Lead, value: any) => {
        if (onUpdate) onUpdate(id, field as string, value);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Prospect': return styles.statusProspect;
            case 'Pitching': return styles.statusPitching;
            case 'Secured lead': return styles.statusSecured;
            case 'Proposal sent': return styles.statusProposal;
            case 'Closed': return styles.statusClosed;
            case 'Lost': return styles.statusLost;
            default: return styles.statusDefault;
        }
    };

    const cleanEmail = (email: string) => {
        // Remove (inferred), (assumed), and any other parenthetical text
        return email.replace(/\s*\(.*?\)\s*/g, '').trim();
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast("Email copied to clipboard!", "success");
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div
            className={styles.tableContainer}
            style={disableInteractions ? { pointerEvents: 'none', userSelect: 'none' } : {}}
        >
            <table className={styles.table}>
                {!hideHeader && (
                    <thead>
                        <tr>
                            {!readOnly && <th className={styles.th} style={{ width: '40px', paddingLeft: '12px', paddingRight: '4px' }}></th>}
                            <th className={styles.th} style={{ width: readOnly ? '22%' : '18%' }}>Company</th>
                            <th className={styles.th} style={{ width: '15%' }}>Website</th>
                            <th className={styles.th} style={{ width: '22%' }}>Contact</th>
                            <th className={styles.th} style={{ width: '25%' }}>Insight / Status</th>
                            <th className={styles.th} style={{ width: '10%' }}>Stage</th>
                            {!readOnly && <th className={styles.th} style={{ width: '10%' }}>Action</th>}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {leads.map((lead) => (
                        <tr key={lead.id} className={styles.row}>
                            {!readOnly && (
                                <td className={styles.td} style={{ paddingLeft: '12px', paddingRight: '4px' }}>
                                    <button
                                        onClick={() => onToggleStar && onToggleStar(lead.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: lead.isStarred ? '#f59e0b' : '#d1d5db', display: 'flex' }}
                                        title={lead.isStarred ? "Remove Star" : "Star Lead"}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill={lead.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                        </svg>
                                    </button>
                                </td>
                            )}
                            <td className={styles.td}>
                                <div className={styles.companyCell}>
                                    {lead.title}
                                </div>
                            </td>
                            <td className={styles.td}>
                                <div className={styles.contactCell}>
                                    {lead.link ? (
                                        <a
                                            href={lead.link.startsWith('http') ? lead.link : `https://${lead.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.tableLink}
                                        >
                                            {lead.link.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#d1d5db' }}>—</span>
                                    )}
                                </div>
                            </td>
                            <td className={styles.td}>
                                <div className={styles.contactCell}>
                                    <div className={styles.contactInfo}>
                                        <div className={styles.personalInfo}>{lead.contact || 'Decision Maker'}</div>

                                        {lead.email && (
                                            <div className={styles.contactRow}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        copyToClipboard(cleanEmail(lead.email));
                                                    }}
                                                    className={styles.contactValue}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline',
                                                        textDecorationStyle: 'dotted',
                                                        textUnderlineOffset: '2px'
                                                    }}
                                                    title="Click to copy email"
                                                >
                                                    {cleanEmail(lead.email)}
                                                </button>
                                            </div>
                                        )}

                                        {lead.socials && (
                                            <div className={styles.contactRow}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                                <a href={lead.socials.startsWith('http') ? lead.socials : `https://${lead.socials}`} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                                    View Profile
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className={styles.td}>
                                <div className={styles.insightCell}>{lead.insight || 'No analysis available.'}</div>
                            </td>
                            <td className={styles.td}>
                                {(readOnly && !allowStageEdit) ? (
                                    <div className={`${styles.statusPill} ${getStatusClass(lead.status)}`} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        {lead.status}
                                    </div>
                                ) : (
                                    <div className={styles.cellSelectWrapper}>
                                        <select
                                            className={`${styles.cellSelect} ${getStatusClass(lead.status)}`}
                                            value={lead.status}
                                            onChange={(e) => handleChange(lead.id, 'status', e.target.value)}
                                        >
                                            <option value="" disabled>Status</option>
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt} style={{ background: 'white', color: 'black' }}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </td>
                            {!readOnly && (
                                <td className={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Link
                                            href={`/desk/analysis/${encodeURIComponent(lead.id)}?url=${encodeURIComponent(lead.link)}&title=${encodeURIComponent(lead.title)}&platform=${encodeURIComponent(lead.platform)}`}
                                            className={styles.actionButton}
                                        >
                                            Analyze
                                        </Link>
                                        <button
                                            onClick={() => onDelete && onDelete(lead.id)}
                                            className={styles.deleteButton}
                                            title="Delete Lead"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
