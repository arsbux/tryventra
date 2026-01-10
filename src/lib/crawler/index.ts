import * as cheerio from 'cheerio';

export interface CrawlResult {
    url: string;
    title: string;
    metaDescription: string;
    content: string;
    headings: { level: string; text: string }[];
    hasSchema: boolean;
    schemaTypes: string[];
    wordCount: number;
    answerPosition: number | null;
}

/**
 * Crawl a domain and extract key pages
 */
export async function crawlDomain(domain: string, maxPages = 20): Promise<CrawlResult[]> {
    try {
        // Normalize domain - remove existing protocols and trailing slashes
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

        // Try to find a working base URL (prefer HTTPS www, then HTTPS non-www, then HTTP)
        const protocols = ['https://www.', 'https://', 'http://www.', 'http://'];
        let baseUrl = '';
        let initialResponse = null;

        for (const protocol of protocols) {
            try {
                const testUrl = `${protocol}${cleanDomain}`;
                const res = await fetch(testUrl, {
                    method: 'GET',
                    headers: { 'User-Agent': 'VentraAEO/1.0 (Answer Engine Optimizer)' },
                    redirect: 'follow',
                    next: { revalidate: 0 }
                });
                if (res.ok) {
                    baseUrl = testUrl;
                    initialResponse = res;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!baseUrl) {
            // Fallback to just the provided domain with https if all tests failed
            baseUrl = cleanDomain.includes('://') ? cleanDomain : `https://${cleanDomain}`;
        }

        // 1. Try to get URLs from sitemap first
        let urls = await getSitemapUrls(baseUrl, maxPages);

        // 2. If no sitemap, crawl from homepage
        if (urls.length === 0) {
            urls = [baseUrl];
        }

        // 3. Crawl each URL
        const results: CrawlResult[] = [];
        const seenUrls = new Set<string>();

        for (const url of urls) {
            if (results.length >= maxPages) break;
            if (seenUrls.has(url)) continue;
            seenUrls.add(url);

            try {
                const result = await crawlPage(url);
                if (result) results.push(result);
            } catch (err) {
                console.error(`Failed to crawl ${url}:`, err);
            }
        }

        return results;
    } catch (error) {
        console.error('Crawl error:', error);
        throw error;
    }
}

/**
 * Crawl a single page
 */
export async function crawlPage(url: string): Promise<CrawlResult | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'VentraAEO/1.0 (Answer Engine Optimizer)'
            }
        });

        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script and style tags
        $('script, style, nav, footer, header').remove();

        // Extract metadata
        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

        // Extract headings
        const headings: { level: string; text: string }[] = [];
        $('h1, h2, h3, h4').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                headings.push({
                    level: el.tagName.toLowerCase(),
                    text
                });
            }
        });

        // Extract main content
        const contentText = $('body').text().replace(/\s+/g, ' ').trim();
        const wordCount = contentText.split(/\s+/).length;

        // Check for schema
        const hasSchema = $('script[type="application/ld+json"]').length > 0;
        const schemaTypes = extractSchemaTypes($);

        // Detect answer position (which paragraph contains direct answer)
        const answerPosition = detectAnswerPosition($);

        return {
            url,
            title,
            metaDescription,
            content: contentText.substring(0, 5000), // Limit to 5000 chars
            headings,
            hasSchema,
            schemaTypes,
            wordCount,
            answerPosition
        };
    } catch (err) {
        console.error(`Error crawling page ${url}:`, err);
        return null;
    }
}

/**
 * Get URLs from sitemap.xml
 */
async function getSitemapUrls(baseUrl: string, maxUrls: number): Promise<string[]> {
    try {
        const sitemapUrl = `${baseUrl}/sitemap.xml`;
        const response = await fetch(sitemapUrl);

        if (!response.ok) return [];

        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        const urls: string[] = [];
        $('url > loc').each((i, el) => {
            if (urls.length < maxUrls) {
                const url = $(el).text().trim();
                if (url) urls.push(url);
            }
        });

        return urls;
    } catch (err) {
        return [];
    }
}

/**
 * Extract schema.org types from JSON-LD
 */
function extractSchemaTypes($: cheerio.CheerioAPI): string[] {
    const types: string[] = [];

    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const jsonText = $(el).html();
            if (!jsonText) return;

            const json = JSON.parse(jsonText);
            if (json['@type']) {
                const type = Array.isArray(json['@type']) ? json['@type'][0] : json['@type'];
                types.push(type);
            }
        } catch (e) {
            // Invalid JSON, skip
        }
    });

    return [...new Set(types)]; // Remove duplicates
}

/**
 * Detect which paragraph contains the answer (heuristic)
 */
function detectAnswerPosition($: cheerio.CheerioAPI): number | null {
    const paragraphs = $('p').toArray();

    for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
        const text = $(paragraphs[i]).text().trim();
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        // Heuristic: Answer likely in paragraphs with 2-4 sentences and >30 words
        if (sentences.length >= 2 && sentences.length <= 4 && text.split(/\s+/).length > 30) {
            return i + 1; // 1-indexed
        }
    }

    return paragraphs.length > 0 ? 1 : null;
}
