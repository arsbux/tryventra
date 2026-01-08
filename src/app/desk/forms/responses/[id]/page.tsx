"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FormResults } from '@/components/FormResults';

export default function FormResponsesPage() {
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

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Responses...</div>;
    if (!campaign) return null;

    return (
        <FormResults
            campaign={campaign}
            onClose={() => router.push('/desk/forms')}
        />
    );
}
