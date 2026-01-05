"use client";

import React, { useState } from 'react';
import styles from './OutreachComposer.module.css';

interface OutreachComposerProps {
    companyName: string;
    signal: string;
    prospectName: string;
    prospectRole: string;
}

export const OutreachComposer: React.FC<OutreachComposerProps> = ({
    companyName,
    signal,
    prospectName,
    prospectRole
}) => {
    const [template, setTemplate] = useState<'email' | 'linkedin' | 'twitter'>('email');
    const [generatedText, setGeneratedText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateOutreach = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/generate-outreach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, signal, prospectName, prospectRole, type: template }),
            });
            const data = await response.json();
            setGeneratedText(data.content);
        } catch (error) {
            console.error("Failed to generate outreach:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.composerCard}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${template === 'email' ? styles.active : ''}`}
                    onClick={() => setTemplate('email')}
                >
                    Email
                </button>
                <button
                    className={`${styles.tab} ${template === 'linkedin' ? styles.active : ''}`}
                    onClick={() => setTemplate('linkedin')}
                >
                    LinkedIn
                </button>
                <button
                    className={`${styles.tab} ${template === 'twitter' ? styles.active : ''}`}
                    onClick={() => setTemplate('twitter')}
                >
                    Twitter
                </button>
            </div>

            <div className={styles.content}>
                <p className={styles.prospectHeader}>
                    Composing for: <strong>{prospectName}</strong> ({prospectRole})
                </p>

                {generatedText ? (
                    <textarea
                        className={styles.textField}
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        Click generate to create an AI-personalized message based on the <strong>{signal.substring(0, 30)}...</strong> signal.
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button
                    className={styles.generateButton}
                    onClick={generateOutreach}
                    disabled={isGenerating}
                >
                    {isGenerating ? "Analyzing Signal..." : "Generate Personalized Message"}
                </button>
                {generatedText && (
                    <button
                        className={styles.copyButton}
                        onClick={() => navigator.clipboard.writeText(generatedText)}
                    >
                        Copy to Clipboard
                    </button>
                )}
            </div>
        </div>
    );
};
