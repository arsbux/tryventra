import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Check if a share link already exists for this user
        const { data: existingShare, error: fetchError } = await supabase
            .from('shared_views')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existingShare) {
            return NextResponse.json({ id: existingShare.id });
        }

        // Create new share link
        const { data: newShare, error: createError } = await supabase
            .from('shared_views')
            .insert({ user_id: userId })
            .select('id')
            .single();

        if (createError) throw createError;

        return NextResponse.json({ id: newShare.id });
    } catch (error) {
        console.error("Failed to create share link:", error);
        return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const shareId = searchParams.get('id');

        if (!shareId) {
            return NextResponse.json({ error: "Share ID required" }, { status: 400 });
        }

        // 1. Get user_id from share link
        const { data: shareData, error: shareError } = await supabase
            .from('shared_views')
            .select('user_id')
            .eq('id', shareId)
            .single();

        if (shareError || !shareData) {
            return NextResponse.json({ error: "Invalid share link" }, { status: 404 });
        }

        // 2. Fetch leads for that user
        const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', shareData.user_id)
            .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;

        // Transform leads (same logic as in leads/route.ts)
        const opportunities = (leads || []).map((lead: any) => {
            let contactName = "Decision Maker";
            let email = "";
            let phone = "";
            let socials = "";

            if (lead.signal) {
                const signalParts = lead.signal.split('|');
                signalParts.forEach((part: string) => {
                    const trimmed = part.trim();
                    if (trimmed.toLowerCase().startsWith('email:')) {
                        email = trimmed.split(':')[1]?.replace(/\(assumed\)/gi, '').replace(/\(inferred\)/gi, '').trim() || "";
                    } else if (trimmed.toLowerCase().startsWith('phone:')) {
                        phone = trimmed.split(':')[1]?.trim() || "";
                    } else if (trimmed.toLowerCase().startsWith('linkedin:')) {
                        socials = trimmed.split(/linkedin:/i)[1]?.trim() || "";
                    } else if (!contactName || contactName === "Decision Maker") {
                        if (!trimmed.includes(':') && trimmed.length > 2) {
                            contactName = trimmed.split('(')[0].trim();
                        }
                    }
                });
                if (contactName === "Decision Maker" && signalParts.length > 0) {
                    contactName = signalParts[0].split('(')[0].trim();
                }
            }

            return {
                id: lead.id,
                title: lead.company_name,
                link: lead.website || "",
                description: lead.description || "",
                signal: lead.signal || "",
                insight: lead.insight || "",
                intentScore: lead.intent_score || 0,
                desperationScore: lead.intent_score || 0,
                opportunityType: lead.opportunity_type || "Expansion",
                tags: lead.tags ? lead.tags.split(',') : [],
                platform: "Database",
                actionLabel: "Analyze",
                status: lead.status || "Prospect",
                contact: contactName,
                email: email,
                phone: phone,
                socials: socials,
                createdAt: lead.created_at,
                isStarred: lead.tags ? lead.tags.split(',').includes('starred') : false
            };
        });

        return NextResponse.json(opportunities);
    } catch (error) {
        console.error("Failed to fetch shared leads:", error);
        return NextResponse.json({ error: "Failed to fetch shared leads" }, { status: 500 });
    }
}
