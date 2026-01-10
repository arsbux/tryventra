import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crawlDomain } from '@/lib/crawler';
import { calculateReadinessScore } from '@/lib/scoring/readiness';

export async function POST(request: Request) {
    try {
        const { domain, userId, projectName } = await request.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // 1. Create or update project
        const { data: existingProject } = await supabase
            .from('aeo_projects')
            .select('*')
            .eq('domain', domain)
            .eq('founder_id', userId)
            .single();

        let projectId = existingProject?.id;

        if (!existingProject) {
            const { data: newProject, error: projectError } = await supabase
                .from('aeo_projects')
                .insert([{
                    founder_id: userId,
                    domain,
                    name: projectName || domain,
                    readiness_score: 0
                }])
                .select()
                .single();

            if (projectError) throw projectError;
            projectId = newProject.id;
        }

        // 2. Crawl the domain
        const crawlResults = await crawlDomain(domain, 20);

        if (crawlResults.length === 0) {
            return NextResponse.json({
                error: `No pages could be discovered for ${domain}. Please check if the site is reachable and supports search crawlers.`
            }, { status: 400 });
        }

        // 3. Calculate readiness score
        const scoreBreakdown = calculateReadinessScore(crawlResults);

        // 4. Save pages to database
        const pagesData = crawlResults.map(page => ({
            project_id: projectId,
            url: page.url,
            title: page.title,
            meta_description: page.metaDescription,
            content_text: page.content,
            headings: page.headings,
            has_schema: page.hasSchema,
            schema_types: page.schemaTypes,
            answer_position: page.answerPosition,
            word_count: page.wordCount
        }));

        // Delete old pages and insert new ones
        await supabase
            .from('crawled_pages')
            .delete()
            .eq('project_id', projectId);

        const { error: pagesError } = await supabase
            .from('crawled_pages')
            .insert(pagesData);

        if (pagesError) throw pagesError;

        // 5. Update project with readiness score
        await supabase
            .from('aeo_projects')
            .update({
                readiness_score: scoreBreakdown.score,
                last_crawled_at: new Date().toISOString()
            })
            .eq('id', projectId);

        // 6. Generate and save page issues
        const { data: savedPages } = await supabase
            .from('crawled_pages')
            .select('*')
            .eq('project_id', projectId);

        if (savedPages) {
            const issues: any[] = [];

            savedPages.forEach((page: any) => {
                // Issue: Buried answer
                if (page.answer_position && page.answer_position > 2) {
                    issues.push({
                        page_id: page.id,
                        issue_type: 'buried_answer',
                        priority: 'high',
                        description: `Answer appears in paragraph ${page.answer_position}`,
                        recommendation: 'Move your direct answer to the first paragraph'
                    });
                }

                // Issue: No schema
                if (!page.has_schema) {
                    issues.push({
                        page_id: page.id,
                        issue_type: 'no_schema',
                        priority: 'high',
                        description: 'No structured data found',
                        recommendation: 'Add FAQPage or HowTo schema markup'
                    });
                }

                // Issue: No Q&A headings
                const qaHeadings = page.headings.filter((h: any) =>
                    h.text.includes('?') ||
                    h.text.toLowerCase().startsWith('how') ||
                    h.text.toLowerCase().startsWith('what')
                );

                if (qaHeadings.length === 0) {
                    issues.push({
                        page_id: page.id,
                        issue_type: 'poor_structure',
                        priority: 'medium',
                        description: 'No question-format headings found',
                        recommendation: 'Convert section headings to questions (e.g., "How does X work?")'
                    });
                }
            });

            if (issues.length > 0) {
                await supabase.from('page_issues').insert(issues);
            }
        }

        return NextResponse.json({
            projectId,
            pagesFound: crawlResults.length,
            readinessScore: scoreBreakdown.score,
            scoreBreakdown: {
                answerPosition: scoreBreakdown.answerPositionScore,
                schema: scoreBreakdown.schemaScore,
                qaStructure: scoreBreakdown.qaStructureScore,
                contentQuality: scoreBreakdown.contentQualityScore
            },
            quickWins: scoreBreakdown.quickWins
        });

    } catch (error: any) {
        console.error('Crawl error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to crawl domain'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: projects, error } = await supabase
            .from('aeo_projects')
            .select('*')
            .eq('founder_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message || 'Failed to fetch projects'
        }, { status: 500 });
    }
}
