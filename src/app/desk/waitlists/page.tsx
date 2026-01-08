"use client";

import React from 'react';
import { EmailListManager } from "@/components/EmailListManager";
import styles from "../page.module.css";

export default function EmailListPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Email List Builder</h1>
                    <p className={styles.subtitle}>Build and manage your audience lists</p>
                </div>
            </div>
            <EmailListManager />
        </>
    );
}
