"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toaster';
import styles from './record.module.css';

type ViewState = 'setup' | 'recording' | 'editing' | 'saving' | 'loading';

function RecordVideoPageContent() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    // States
    const [view, setView] = useState<ViewState>('setup');
    const [includeAudio, setIncludeAudio] = useState(true);
    const [recording, setRecording] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [editingSlug, setEditingSlug] = useState<string | null>(null);

    // Media Refs
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Metadata Refs
    const [mouseEvents, setMouseEvents] = useState<any[]>([]);
    const recordingStartTime = useRef<number>(0);

    // Editor States
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);

    useEffect(() => {
        const editSlug = searchParams?.get('edit');
        if (editSlug) {
            setEditingSlug(editSlug);
            loadDemoForEditing(editSlug);
            return;
        }

        const storedTitle = sessionStorage.getItem('pending_video_title');
        if (!storedTitle) {
            router.push('/desk/demos');
            return;
        }
        setTitle(storedTitle);

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (videoBlobUrl && !editSlug) URL.revokeObjectURL(videoBlobUrl);
        };
    }, [searchParams]);

    const loadDemoForEditing = async (slug: string) => {
        setView('loading');
        try {
            const { data, error } = await supabase
                .from('video_demos')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            setTitle(data.title);
            setVideoBlobUrl(data.video_url);

            const meta = data.metadata || {};
            const events = meta.events || [];
            const trim = meta.trim || { start: 0, end: null };

            setMouseEvents(events);
            setTrimStart(trim.start);
            setTrimEnd(trim.end || 0);
            setView('editing');
        } catch (err: any) {
            toast("Failed to load demo for editing: " + err.message, "error");
            router.push('/desk/demos');
        }
    };

    useEffect(() => {
        if (view !== 'recording') return;

        const handleMouseMove = (e: MouseEvent) => {
            const timestamp = Date.now() - recordingStartTime.current;
            setMouseEvents(prev => [...prev, {
                t: timestamp,
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
                type: 'move'
            }]);
        };

        const handleClick = (e: MouseEvent) => {
            const timestamp = Date.now() - recordingStartTime.current;
            setMouseEvents(prev => [...prev, {
                t: timestamp,
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
                type: 'click'
            }]);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
        };
    }, [view]);

    const startRecording = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 30 } },
                audio: includeAudio ? { echoCancellation: true, noiseSuppression: true } : false
            });

            if (includeAudio) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const tracks = [...screenStream.getVideoTracks(), ...micStream.getAudioTracks()];
                    const combinedStream = new MediaStream(tracks);
                    setStream(combinedStream);
                } catch (e) {
                    console.warn("Mic access denied, continuing with screen audio only if available");
                    setStream(screenStream);
                }
            } else {
                setStream(screenStream);
            }

            setView('recording');
            setRecording(true);
            setRecordedChunks([]);
            recordingStartTime.current = Date.now();
        } catch (err) {
            console.error("Error starting recording:", err);
            toast("Recording cancelled or failed.", "error");
        }
    };

    useEffect(() => {
        if (stream && videoRef.current && view === 'recording') {
            videoRef.current.srcObject = stream;

            const mimeTypes = [
                'video/mp4;codecs=h264,aac',
                'video/mp4;codecs=h264',
                'video/mp4',
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=h264',
                'video/webm'
            ];
            const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

            const recorder = new MediaRecorder(stream, { mimeType: supportedType });
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
            };
            recorder.onstop = () => setRecording(false);
            recorder.start();
            setMediaRecorder(recorder);
        }
    }, [stream, view]);

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            if (stream) stream.getTracks().forEach(track => track.stop());
            setView('editing');
        }
    };

    useEffect(() => {
        if (view === 'editing' && recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoBlobUrl(url);
        }
    }, [view, recordedChunks, mediaRecorder]);

    const onLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const dur = e.currentTarget.duration;
        setDuration(dur);
        setTrimEnd(dur);
    };

    const handleFinalSave = async () => {
        setView('saving');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || 'guests';

            let finalVideoUrl = videoBlobUrl;
            let finalVideoPath = "";

            if (recordedChunks.length > 0) {
                const isMp4 = mediaRecorder?.mimeType.includes('mp4');
                const extension = isMp4 ? 'mp4' : 'webm';
                const fullBlob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || 'video/webm' });
                const fileName = `${userId}/${Date.now()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from('demos')
                    .upload(fileName, fullBlob, {
                        contentType: mediaRecorder?.mimeType || 'video/webm'
                    });

                if (uploadError) throw uploadError;

                finalVideoUrl = supabase.storage.from('demos').getPublicUrl(fileName).data.publicUrl;
                finalVideoPath = fileName;
            }

            const filteredMetadata = mouseEvents.filter(m =>
                (m.t / 1000) >= trimStart && (m.t / 1000) <= (trimEnd || 9999)
            ).map(m => ({
                ...m,
                t: m.t - (trimStart * 1000)
            }));

            const metadataPayload = {
                events: filteredMetadata,
                trim: { start: trimStart, end: trimEnd }
            };

            if (editingSlug) {
                const payload: any = {
                    title,
                    metadata: metadataPayload
                };
                if (recordedChunks.length > 0) {
                    payload.video_url = finalVideoUrl;
                    payload.video_path = finalVideoPath;
                }

                const { error: updateError } = await supabase
                    .from('video_demos')
                    .update(payload)
                    .eq('slug', editingSlug);

                if (updateError) throw updateError;
            } else {
                const slug = `${title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${Math.random().toString(36).substring(2, 5)}`;
                const { error: insertError } = await supabase
                    .from('video_demos')
                    .insert([{
                        founder_id: user?.id || null,
                        title,
                        slug,
                        video_url: finalVideoUrl,
                        video_path: finalVideoPath,
                        metadata: metadataPayload
                    }]);

                if (insertError) throw insertError;
            }

            toast("Demo saved successfully!", "success");
            router.push(`/desk/demos?new_demo=${editingSlug || 'saved'}`);
        } catch (err: any) {
            toast("Failed to save: " + err.message, "error");
            setView('editing');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.recorderCard}>
                {view === 'loading' && (
                    <div className={styles.overlay} style={{ position: 'relative', minHeight: '300px' }}>
                        <div className={styles.loaderWrapper}>
                            <div className={styles.loaderRing}></div>
                            <div className={styles.loaderPulse}></div>
                        </div>
                        <h3>Loading Demo...</h3>
                    </div>
                )}

                {view === 'setup' && (
                    <>
                        <div className={styles.header}>
                            <h2>{title}</h2>
                            <p>Configure your recording settings</p>
                        </div>
                        <div className={styles.setupGrid}>
                            <div
                                className={`${styles.setupCard} ${includeAudio ? styles.setupCardActive : ''}`}
                                onClick={() => setIncludeAudio(true)}
                            >
                                <div className={styles.iconBox}>
                                    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                </div>
                                <div className={styles.setupInfo}>
                                    <h4>With Voice</h4>
                                    <p>Record your microphone audio</p>
                                </div>
                            </div>
                            <div
                                className={`${styles.setupCard} ${!includeAudio ? styles.setupCardActive : ''}`}
                                onClick={() => setIncludeAudio(false)}
                            >
                                <div className={styles.iconBox}>
                                    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18.85" x2="5.15" y1="5.15" y2="18.85" /><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                </div>
                                <div className={styles.setupInfo}>
                                    <h4>System Only</h4>
                                    <p>No microphone recording</p>
                                </div>
                            </div>
                        </div>
                        <button className={styles.mainActionBtn} onClick={startRecording}>
                            Start Screen Share
                        </button>
                    </>
                )}

                {view === 'recording' && (
                    <>
                        <div className={styles.header}>
                            <h2>Recording in progress...</h2>
                            <p>We are capturing your screen and cursor</p>
                        </div>
                        <div className={styles.previewContainer}>
                            <video ref={videoRef} autoPlay muted className={styles.preview} />
                        </div>
                        <button className={`${styles.mainActionBtn} ${styles.stopBtn}`} onClick={stopRecording}>
                            Stop Recording
                        </button>
                    </>
                )}

                {view === 'editing' && videoBlobUrl && (
                    <>
                        <div className={styles.header}>
                            <h2>Perfect your Demo</h2>
                            <p>Trim the start and end of your video</p>
                        </div>
                        <div className={styles.previewContainer}>
                            <video
                                src={videoBlobUrl}
                                controls
                                className={styles.preview}
                                onLoadedMetadata={onLoadedMetadata}
                            />
                        </div>
                        <div className={styles.editorControls}>
                            <div className={styles.trimmer}>
                                <div className={styles.rangeLabel}>
                                    <span>Start: {trimStart.toFixed(1)}s</span>
                                    <span>End: {trimEnd.toFixed(1)}s</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <input
                                        type="range"
                                        min={0}
                                        max={duration}
                                        step={0.1}
                                        value={trimStart}
                                        onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                                        className={styles.rangeInput}
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={duration}
                                        step={0.1}
                                        value={trimEnd}
                                        onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                                        className={styles.rangeInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.editorActions}>
                                <button className={styles.secondaryBtn} onClick={() => router.push('/desk/demos')}>Discard</button>
                                <button className={styles.mainActionBtn} style={{ margin: 0, width: 'auto' }} onClick={handleFinalSave}>
                                    Finish & Save
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {view === 'saving' && (
                    <div className={styles.overlay}>
                        <div className={styles.loaderWrapper}>
                            <div className={styles.loaderRing}></div>
                            <div className={styles.loaderPulse}></div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                        </div>
                        <h3>Finalizing Demo...</h3>
                        <p>Optimizing video and cursor effects</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RecordVideoPage() {
    return (
        <React.Suspense fallback={<div className={styles.container}><div className={styles.centered}><div className={styles.spinner}></div></div></div>}>
            <RecordVideoPageContent />
        </React.Suspense>
    );
}
