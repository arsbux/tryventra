"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './player.module.css';
import { CinematicPlayer } from './CinematicPlayer';

export default function VideoDemoPlaybackPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [demo, setDemo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchDemo();
    }, [slug]);

    const fetchDemo = async () => {
        try {
            const { data, error } = await supabase
                .from('video_demos')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setDemo(data);
        } catch (err) {
            console.error("Error fetching demo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!demo?.video_url) return;

        try {
            const response = await fetch(demo.video_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const isMp4 = demo.video_url.toLowerCase().endsWith('.mp4');
            const extension = isMp4 ? 'mp4' : 'webm';
            a.download = `${demo.title.replace(/\s+/g, '_')}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    if (loading) return <div className={styles.centered}><div className={styles.spinner}></div></div>;
    if (!demo) return (
        <div className={styles.centered}>
            <h1>404</h1>
            <p>Video demo not found.</p>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <img src="/images/logo.png" alt="Ventra" className={styles.logoImage} />
                    <span>Ventra </span>
                </div>
                <h1 className={styles.title}>{demo.title}</h1>
                <button className={styles.downloadBtn} onClick={handleDownload}>
                    Download MP4
                </button>
            </div>

            <div className={styles.playerWrapper}>
                <CinematicPlayer
                    videoUrl={demo.video_url}
                    metadata={demo.metadata || []}
                />
            </div>

            <div className={styles.footer}>
                <p>
                    <img src="/images/logo.png" alt="Ventra" className={styles.footerLogo} />
                    Made with Ventra Video
                </p>
            </div>
        </div >
    );
}
