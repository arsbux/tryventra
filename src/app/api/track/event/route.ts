import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            founder_id,
            session_id,
            visitor_id,
            event_name,
            url,
            path,
            referrer,
            ua,
            screen_size,
            metadata
        } = body;

        if (!founder_id) return NextResponse.json({ error: 'Missing founder_id' }, { status: 400 });

        // Geo Lookup (using a free API for demonstration, in production use a local MaxMind DB)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        let geo = { country: 'Unknown', city: 'Unknown', flag: '❓' };

        try {
            if (ip !== '127.0.0.1') {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
                const geoData = await geoRes.json();
                if (geoData.country_name) {
                    geo = {
                        country: geoData.country_name,
                        city: geoData.city,
                        flag: geoData.country_code === 'US' ? '🇺🇸' :
                            geoData.country_code === 'GB' ? '🇬🇧' :
                                geoData.country_code === 'DE' ? '🇩🇪' :
                                    geoData.country_code === 'CA' ? '🇨🇦' :
                                        geoData.country_code === 'FR' ? '🇫🇷' : '🌐'
                    };
                }
            }
        } catch (e) { console.error('Geo lookup failed'); }

        // Basic User Agent Parsing
        let deviceType = 'desktop';
        if (/mobile/i.test(ua)) deviceType = 'mobile';
        else if (/tablet/i.test(ua)) deviceType = 'tablet';

        // Save to Supabase
        const { error } = await supabase
            .from('website_events')
            .insert([{
                founder_id,
                session_id,
                visitor_id,
                event_name,
                url,
                path,
                referrer: referrer || 'Direct',
                device_type: deviceType,
                user_agent: ua,
                screen_size,
                metadata: { ...metadata, geo },
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Supabase analytics error:', error);
            // We don't want to break the tracker even if DB fails
        }

        return NextResponse.json({ success: true }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        });
    } catch (err) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
