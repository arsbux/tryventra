"use client";

import React, { useRef, useState, useEffect } from 'react';
import styles from './player.module.css';

interface MouseEvent {
    t: number;
    x: number;
    y: number;
    type: 'move' | 'click';
}

export function CinematicPlayer({ videoUrl, metadata }: { videoUrl: string, metadata: any }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [ripple, setRipple] = useState<{ x: number, y: number, id: number } | null>(null);

    // Support both old flat array and new structured metadata
    const events = Array.isArray(metadata) ? metadata : (metadata?.events || []);
    const trim = metadata?.trim || { start: 0, end: null };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Apply trim start on initial load
        const handleInitialStart = () => {
            if (video.currentTime < trim.start) {
                video.currentTime = trim.start;
            }
        };

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;

            // Loop logic (Virtual Trim)
            if (trim.end && currentTime >= trim.end) {
                video.currentTime = trim.start;
                return;
            }

            // Adjustment for events: they are already adjusted to relative 0 in metadata save
            // But we need to sync with video's absolute currentTime
            const relativeTimeMs = (currentTime - trim.start) * 1000;

            // Find active click
            const activeClick = events.find((m: MouseEvent) =>
                m.type === 'click' &&
                relativeTimeMs >= m.t - 500 &&
                relativeTimeMs <= m.t + 1500
            );

            if (activeClick) {
                setTransform({
                    scale: 1.5,
                    x: (50 - activeClick.x) * 0.5,
                    y: (50 - activeClick.y) * 0.5
                });

                if (Math.abs(activeClick.t - relativeTimeMs) < 100) {
                    setRipple({ x: activeClick.x, y: activeClick.y, id: activeClick.t });
                }
            } else {
                setTransform({ scale: 1, x: 0, y: 0 });
            }
        };

        video.addEventListener('loadedmetadata', handleInitialStart);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('loadedmetadata', handleInitialStart);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [metadata, videoUrl]);

    return (
        <div className={styles.playerContainerFlat}>
            <div
                className={styles.zoomWrapper}
                style={{
                    transform: `scale(${transform.scale}) translate(${transform.x}%, ${transform.y}%)`,
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    autoPlay
                    className={styles.videoPlayer}
                />

                {ripple && (
                    <div
                        key={ripple.id}
                        className={styles.ripple}
                        style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
                    />
                )}
            </div>
        </div>
    );
}
