import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    if (!supabaseAdmin) {
        console.error('Webhook Error: supabaseAdmin is not initialized. Please check your Supabase environment variables.');
        return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    try {
        const body = await request.text();
        const signature = request.headers.get('x-dodo-signature');
        const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

        // Verify webhook signature
        if (webhookSecret && signature) {
            const hmac = crypto.createHmac('sha256', webhookSecret);
            const computedSignature = hmac.update(body).digest('hex');

            if (computedSignature !== signature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload = JSON.parse(body);
        const eventType = payload.type;
        const data = payload.data;

        console.log(`Received Dodo Webhook: ${eventType}`, data);

        // Handle specific event types
        switch (eventType) {
            case 'checkout_session.completed': {
                const userId = data.metadata?.user_id || data.customer?.metadata?.user_id;
                if (userId) {
                    // Assuming supabaseAdmin is initialized elsewhere, e.g., in a utility file
                    // import { createAdminClient } from '@/utils/supabase/admin';
                    // const supabaseAdmin = createAdminClient();
                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        plan_tier: data.product_cart?.[0]?.product_name || 'Starter',
                        status: 'one-time',
                        provider_subscription_id: data.checkout_id,
                        provider_customer_id: data.customer?.customer_id,
                    });
                }
                break;
            }
            case 'subscription.created': {
                const userId = data.metadata?.user_id || data.customer?.metadata?.user_id;
                if (userId) {
                    await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        plan_tier: data.plan_name || 'Growth',
                        status: 'active',
                        provider_subscription_id: data.subscription_id,
                        provider_customer_id: data.customer?.customer_id,
                        current_period_end: data.current_period_end,
                    });
                }
                break;
            }
            case 'subscription.cancelled': {
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'cancelled' })
                    .eq('provider_subscription_id', data.subscription_id);
                break;
            }
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
