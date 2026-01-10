"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        if (!paymentId) {
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId }),
                });

                if (res.ok) {
                    setStatus('success');
                    // Redirect to desk after short delay
                    setTimeout(() => {
                        router.push('/desk');
                    }, 2000);
                } else {
                    setStatus('error');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [paymentId, router]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            {status === 'verifying' && (
                <>
                    <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Verifying your payment...</div>
                    <div className="spinner" style={{
                        width: '30px',
                        height: '30px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid #00eba8',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style jsx global>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </>
            )}
            {status === 'success' && (
                <>
                    <h1 style={{ fontSize: '2rem', color: '#00eba8', marginBottom: '16px' }}>Success!</h1>
                    <p>Your subscription is active. Redirecting to dashboard...</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <h1 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '16px' }}>Something went wrong.</h1>
                    <p>We couldn't verify your payment instantly.</p>
                    <button
                        onClick={() => router.push('/desk')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#333',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Go to Dashboard (Check Status)
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </>
            )}
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}
