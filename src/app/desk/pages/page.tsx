"use client";

import React from 'react';
import styles from "../page.module.css";

export default function PagesPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Pre-launch Builder</h1>
                    <p className={styles.subtitle}>Build high-converting pre-launch landing pages</p>
                </div>
            </div>
            <div style={{ padding: '60px', textAlign: 'center', background: '#f9fafb', borderRadius: '24px', border: '1px dashed #ddd' }}>
                <p style={{ color: '#666' }}>Landing page builder is coming soon. Stay tuned!</p>
            </div>
        </>
    );
}
