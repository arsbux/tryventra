-- AEO Platform Database Schema
-- Purpose: Support Answer Engine Optimization features

-- Projects (user's websites being optimized)
CREATE TABLE IF NOT EXISTS aeo_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  name text,
  readiness_score integer DEFAULT 0,
  last_crawled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crawled Pages
CREATE TABLE IF NOT EXISTS crawled_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES aeo_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  meta_description text,
  content_text text,
  headings jsonb DEFAULT '[]'::jsonb, -- [{level: 'h1', text: '...'}]
  has_schema boolean DEFAULT false,
  schema_types text[] DEFAULT ARRAY[]::text[],
  answer_position integer, -- paragraph number where answer appears
  word_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, url)
);

-- Page Issues (audit findings)
CREATE TABLE IF NOT EXISTS page_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid REFERENCES crawled_pages(id) ON DELETE CASCADE,
  issue_type text NOT NULL, -- 'buried_answer', 'no_schema', 'poor_structure', 'vague_heading'
  priority text DEFAULT 'medium', -- 'high', 'medium', 'low'
  description text,
  recommendation text,
  is_fixed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Question Templates (pre-populated questions by industry)
CREATE TABLE IF NOT EXISTS question_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  industry text NOT NULL, -- 'ecommerce', 'saas', 'local-services', etc.
  question_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(industry, question_text)
);

-- Ensure the unique constraint exists even if the table was created previously without it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'question_templates_industry_question_text_key'
    ) THEN
        ALTER TABLE question_templates ADD CONSTRAINT question_templates_industry_question_text_key UNIQUE (industry, question_text);
    END IF;
END $$;

-- Citation Tracking (historical monitoring)
CREATE TABLE IF NOT EXISTS citation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES aeo_projects(id) ON DELETE CASCADE,
  platform text NOT NULL,
  question text NOT NULL,
  was_cited boolean DEFAULT false,
  citation_position integer,
  checked_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aeo_projects_founder ON aeo_projects(founder_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_project ON crawled_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_page_issues_page ON page_issues(page_id);
CREATE INDEX IF NOT EXISTS idx_citation_logs_project ON citation_logs(project_id);

-- RLS Policies (disable for now - we'll add later)
ALTER TABLE aeo_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE citation_logs DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON aeo_projects TO anon, authenticated;
GRANT ALL ON crawled_pages TO anon, authenticated;
GRANT ALL ON page_issues TO anon, authenticated;
GRANT ALL ON question_templates TO anon, authenticated;
GRANT ALL ON citation_logs TO anon, authenticated;

-- Seed some question templates
INSERT INTO question_templates (industry, question_text) VALUES
  ('local-services', 'What should I look for in a contractor?'),
  ('general', 'How does SEO work?'),
  ('general', 'What is content marketing?')
ON CONFLICT (industry, question_text) DO NOTHING;

-- Subscriptions Table (for access control)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier text, -- 'starter', 'growth', 'agency' (or similar ids)
  status text, -- 'active', 'canceled', 'past_due', 'trialing'
  payment_provider text, -- 'dodo', 'stripe'
  provider_subscription_id text,
  provider_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookup in middleware
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Enable RLS
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON subscriptions TO anon, authenticated;

