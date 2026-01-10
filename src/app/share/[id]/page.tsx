"use client";

import { useState, useEffect } from "react";
import { LeadsTable } from "@/components/LeadsTable";
import styles from "../../desk/page.module.css";
import React from "react";

export default function SharedViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSharedLeads = async () => {
            try {
                const response = await fetch(`/api/share?id=${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to load shared table");
                }

                setLeads(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchSharedLeads();
        }
    }, [id]);

    const handleUpdateLead = async (id: string, field: string, value: any) => {
        // Optimistic update
        setLeads((prev: any) => prev.map((l: any) => l.id === id ? { ...l, [field]: value } : l));

        try {
            await fetch('/api/leads', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, field, value })
            });
        } catch (error) {
            console.error("Failed to update lead:", error);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className={styles.loadingSpinner}></div>
                    <p style={{ marginTop: '16px', color: '#666' }}>Loading shared table...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
                <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Link Error</h2>
                    <p style={{ color: '#666' }}>{error}</p>
                    <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#667eea', textDecoration: 'none' }}>Go Home</a>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111' }}>Shared Leads Database</h1>
                        <p style={{ color: '#666', marginTop: '4px' }}>Found {leads.length} leads</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111', fontWeight: 700 }}>
                        <img src="/images/logo.svg" alt="Ventra Logo" width="24" height="24" style={{ objectFit: 'contain' }} />
                        Ventra
                    </div>
                </div>

                <div className={styles.resultsSection} style={{ background: 'white', border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
                    <LeadsTable
                        leads={leads}
                        readOnly={true}
                        allowStageEdit={true}
                        onUpdate={handleUpdateLead}
                    />
                </div>

                <p style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af', fontSize: '0.85rem' }}>
                    Generated with Ventra AI Lead Scout - {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
