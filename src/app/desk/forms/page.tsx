"use client";

import React from 'react';
import { FormManager } from "@/components/FormManager";
import styles from "../page.module.css";

export default function FormsPage() {
    return (
        <>
            <div className={styles.topHeader}>
                <div>
                    <h1 className={styles.title}>Form Builder</h1>
                    <p className={styles.subtitle}>Create interactive surveys or minimal static forms</p>
                </div>
            </div>
            <FormManager />
        </>
    );
}
