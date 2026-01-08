"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase";

export default function DeskLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    // Determine active tab from pathname
    const segments = pathname.split('/');
    const activeTab = segments[2] || 'forms';

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }

            // Check for active subscription in Supabase
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', session.user.id)
                .in('status', ['active', 'one-time'])
                .maybeSingle();

            if (!subscription) {
                if (process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === 'live_mode') {
                    router.push("/pricing");
                    return;
                }
            }

            setUserId(session.user.id);
        };
        checkUser();
    }, [router]);

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar activeTab={activeTab} />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {children}
                </div>
            </main>
        </div>
    );
}
