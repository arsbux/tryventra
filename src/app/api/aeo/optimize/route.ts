import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOptimizations } from '@/lib/ai/optimizer';

export async function POST(request: Request) {
    try {
        const { projectId } = await request.json();
        if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

        const { data: project } = await supabase
            .from('aeo_projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (!project) throw new Error('Project not found');

        const { data: pages } = await supabase
            .from('crawled_pages')
            .select('content_text, title')
            .eq('project_id', projectId)
            .limit(3);

        const context = [
            `META: ${project.meta_description || ''}`,
            `MAIN: ${project.content_text || ''}`,
            ...(pages || []).map((p: any) => `PAGE ${p.title}: ${p.content_text}`)
        ];

        const optimizations = await generateOptimizations(project.domain, context);

        return NextResponse.json(optimizations);
    } catch (error: any) {
        console.error('Optimization API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
