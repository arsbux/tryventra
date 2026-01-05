import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform DB structure back to Opportunity structure for the frontend
        const opportunities = (leads || []).map((lead: any) => {
            // Extract a contact info from signal for display
            let contactName = "Decision Maker";
            let email = "";
            let phone = "";
            let socials = "";

            if (lead.signal) {
                const signalParts = lead.signal.split('|');
                signalParts.forEach((part: string) => {
                    const trimmed = part.trim();
                    if (trimmed.toLowerCase().startsWith('email:')) {
                        email = trimmed.split(':')[1]?.replace(/\(assumed\)/gi, '').trim() || "";
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
                // Fallback
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
                // New Fields
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
        console.error("Failed to fetch leads:", error);
        return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, field, value } = await req.json();

        // Map frontend field names to DB column names
        const fieldMap: Record<string, string> = {
            status: 'status',
            estimatedValue: 'estimated_value',
            probability: 'probability',
            notes: 'notes',
            tags: 'tags'
        };

        const dbColumn = fieldMap[field];
        if (!dbColumn) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        const { error } = await supabase
            .from('leads')
            .update({ [dbColumn]: value })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update failed:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete failed:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
