import { NextResponse } from 'next/server';
import dodoClient from '@/lib/dodo';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();

        if (!paymentId) {
            return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
        }

        // 1. Verify Payment with Dodo
        const payment = await dodoClient.payments.retrieve(paymentId);

        if (payment.status !== 'succeeded') {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        // 2. Update Subscription in Supabase
        const userId = payment.metadata?.user_id || payment.customer?.metadata?.user_id;

        if (!userId) {
            // Fallback: If metadata is missing, we can't link it. But Dodo usually passes metadata back.
            // If the user was logged in during checkout, we sent metadata.user_id.
            return NextResponse.json({ error: 'User ID not found in payment metadata' }, { status: 404 });
        }

        // Upsert subscription
        const { error } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            plan_tier: payment.product_cart?.[0]?.product_id === process.env.NEXT_PUBLIC_DODO_STARTER_ID ? 'Core Platform' : 'Core Platform',
            status: 'active', // Mark active on successful verification
            payment_provider: 'dodo',
            provider_subscription_id: payment.payment_id, // For one-time payments, use payment_id
            provider_customer_id: payment.customer?.customer_id,
            // current_period_end: ... set based on logic if it's recurring? Dodo structure for sub?
            // For now, let's assume monthly if it's "Core Platform"
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }); // Link by user_id

        if (error) {
            console.error('Database Update Error:', error);
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
