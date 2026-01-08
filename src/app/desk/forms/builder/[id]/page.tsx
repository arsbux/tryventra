"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FormFlowEditor } from '@/components/FormFlowEditor';

export default function FormBuilderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const { data, error } = await supabase
                .from('survey_campaigns')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCampaign(data);
        } catch (err) {
            console.error("Error fetching campaign:", err);
            router.push('/desk/forms');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Editor...</div>;
    if (!campaign) return null;

    return (
        <div style={{ height: 'calc(100vh - 96px)', margin: '-48px -24px' }}>
            <FormFlowEditor
                campaign={campaign}
                onClose={() => router.push('/desk/forms')}
            />
        </div>
    );
}
