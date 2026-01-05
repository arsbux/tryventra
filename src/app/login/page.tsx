"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/desk");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/desk");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logoArea}>
                    <img src="/images/logo.png" alt="Ventra Logo" width="24" height="24" style={{ objectFit: 'contain' }} />
                    <span className={styles.logoText}>Ventra</span>
                </div>

                <h1 className={styles.title}>{isSignUp ? "Create an account" : "Welcome back"}</h1>
                <p className={styles.subtitle}>
                    {isSignUp ? "Start scouting for high-intent leads today." : "Log in to your dashboard to manage your pipeline."}
                </p>

                <form onSubmit={handleAuth} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button type="submit" className={styles.authButton} disabled={loading}>
                        {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className={styles.toggleButton}
                    >
                        {isSignUp ? "Sign In" : "Create Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}
