"use client";

import React from 'react';
import styles from "../page.module.css";

export default function EmailPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Light Email</h1>
                    <p className={styles.subtitle}>Simple outreach and automated growth sequences</p>
                </div>
            </div>
            <div style={{ padding: '60px', textAlign: 'center', background: '#f9fafb', borderRadius: '24px', border: '1px dashed #ddd' }}>
                <p style={{ color: '#666' }}>Email automation engine is coming soon. Start finding leads to prepare your lists!</p>
            </div>
        </>
    );
}
