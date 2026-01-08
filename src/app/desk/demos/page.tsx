"use client";

import React from 'react';
import { DemoManager } from "@/components/DemoManager";
import styles from "../page.module.css";

export default function DemosPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Video Demos</h1>
                    <p className={styles.subtitle}>Create and share Loom-like video demos of your product</p>
                </div>
            </div>
            <React.Suspense fallback={<div className={styles.centered}><div className={styles.spinner}></div></div>}>
                <DemoManager />
            </React.Suspense>
        </>
    );
}
