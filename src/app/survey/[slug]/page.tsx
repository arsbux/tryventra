"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './survey.module.css';
import { useToast } from '@/components/Toaster';

export default function PublicSurveyPage() {
    const { toast } = useToast();
    const params = useParams();
    const slug = params?.slug as string;

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 is welcome screen
    const [answers, setAnswers] = useState<any>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (slug) fetchCampaign();
    }, [slug]);

    const fetchCampaign = async () => {
        try {
            const { data, error } = await supabase
                .from('survey_campaigns')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setCampaign(data);

            // Extract questions from flow_data
            const nodes = data.flow_data?.nodes || [];
            const qNodes = nodes
                .filter((n: any) => n.type === 'question')
                .sort((a: any, b: any) => a.position.x - b.position.x);

            setQuestions(qNodes);
        } catch (err) {
            console.error("Error fetching campaign:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const currentQuestion = questions[currentIndex];
        const currentAnswer = answers[currentQuestion?.id];

        if (currentQuestion?.data?.required) {
            const isEmpty = !currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0);
            if (isEmpty) return;
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            submitSurvey();
        }
    };

    const submitSurvey = async () => {
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('survey_responses')
                .insert([
                    {
                        campaign_id: campaign.id,
                        responder_email: answers.email || null,
                        answers: answers
                    }
                ]);

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting response:", err);
            toast("Failed to submit. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.centered}><div className={styles.spinner}></div></div>;
    if (!campaign) return <div className={styles.centered}><h1>404</h1><p>Survey not found.</p></div>;

    if (submitted) return (
        <div className={styles.wrapper}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <div className={styles.checkIcon}>✓</div>
                <h1 className={styles.title}>Thank you!</h1>
                <p className={styles.desc}>Your responses have been recorded. We appreciate your time.</p>
                <div className={styles.poweredBy}>Powered by Ventra</div>
            </div>
        </div>
    );

    if (currentIndex === -1) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <p className={styles.topLabel}>INTERACTIVE SURVEY</p>
                    <h1 className={styles.title}>{campaign.title}</h1>
                    <p className={styles.desc}>This will take about 2 minutes of your time.</p>
                    <button className={styles.mainButton} onClick={() => setCurrentIndex(0)}>
                        Start Survey →
                    </button>
                    <div className={styles.poweredBy}>Powered by Ventra</div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const { question, type } = currentQuestion.data;

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.progress}>
                    Question {currentIndex + 1} of {questions.length}
                </div>

                <h2 className={styles.questionText}>
                    <span className={styles.qNumber}>{currentIndex + 1} →</span>
                    {question || "Untitled Question"}
                    {currentQuestion.data.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                </h2>

                <div className={styles.inputArea}>
                    {type === 'text' && (
                        <input
                            className={styles.input}
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                            autoFocus
                        />
                    )}
                    {type === 'long_text' && (
                        <textarea
                            className={styles.textarea}
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                            autoFocus
                        />
                    )}
                    {type === 'email' && (
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="name@company.com"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAnswers({ ...answers, [currentQuestion.id]: val, email: val });
                            }}
                            autoFocus
                        />
                    )}
                    {type === 'integer' && (
                        <input
                            type="number"
                            className={styles.input}
                            placeholder="0"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                            autoFocus
                        />
                    )}
                    {type === 'radio' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            {(currentQuestion.data.options || []).map((opt: string, i: number) => (
                                <button
                                    key={i}
                                    className={answers[currentQuestion.id] === opt ? styles.selectedOption : styles.optionButton}
                                    onClick={() => {
                                        setAnswers({ ...answers, [currentQuestion.id]: opt });
                                        setTimeout(handleNext, 300);
                                    }}
                                >
                                    <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                    {type === 'multi' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            {(currentQuestion.data.options || []).map((opt: string, i: number) => {
                                const currentVals = answers[currentQuestion.id] || [];
                                const isSelected = currentVals.includes(opt);
                                return (
                                    <button
                                        key={i}
                                        className={isSelected ? styles.selectedOption : styles.optionButton}
                                        onClick={() => {
                                            const newVals = isSelected
                                                ? currentVals.filter((v: string) => v !== opt)
                                                : [...currentVals, opt];
                                            setAnswers({ ...answers, [currentQuestion.id]: newVals });
                                        }}
                                    >
                                        <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                                        {opt}
                                        {isSelected && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <button
                    className={styles.mainButton}
                    onClick={handleNext}
                    disabled={
                        submitting || (currentQuestion?.data?.required &&
                            (!answers[currentQuestion.id] || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)))
                    }
                >
                    {currentIndex === questions.length - 1 ? (submitting ? "Submitting..." : "Finish Survey") : "Continue"}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div className={styles.poweredBy}>Powered by Ventra</div>
                </div>
            </div>
        </div>
    );
}
