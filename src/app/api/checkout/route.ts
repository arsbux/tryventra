import { NextResponse } from 'next/server';
import dodoClient from '@/lib/dodo';

export async function POST(request: Request) {
    try {
        const { productId, userId, customerEmail, customerName } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const session = await dodoClient.checkoutSessions.create({
            product_cart: [{
                product_id: productId,
                quantity: 1,
            }],
            customer: {
                email: customerEmail || 'customer@example.com',
                name: customerName || 'Valued Customer',
            },
            metadata: {
                user_id: userId,
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/desk`,
        });

        return NextResponse.json({ url: session.checkout_url });
    } catch (error: any) {
        console.error('Dodo Payments Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
