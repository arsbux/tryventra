"use client";

import React from 'react';
import styles from "../page.module.css";

export default function AffiliatesPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Partnership Management</h1>
                    <p className={styles.subtitle}>Affiliate tracking and partnership management</p>
                </div>
            </div>
            <div style={{ padding: '60px', textAlign: 'center', background: '#f9fafb', borderRadius: '24px', border: '1px dashed #ddd' }}>
                <p style={{ color: '#666' }}>Affiliate and partnership tools are coming soon. Build your network today!</p>
            </div>
        </>
    );
}
