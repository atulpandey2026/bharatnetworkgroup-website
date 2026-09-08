-- ============================================================
-- BNG Careers & Contact Enquiries Schema Migration
-- ============================================================

-- 1. TYPES

DROP TYPE IF EXISTS public.job_status CASCADE;
CREATE TYPE public.job_status AS ENUM ('published', 'draft', 'closed');

DROP TYPE IF EXISTS public.employment_type CASCADE;
CREATE TYPE public.employment_type AS ENUM ('Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance');

DROP TYPE IF EXISTS public.application_status CASCADE;
CREATE TYPE public.application_status AS ENUM ('new', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'on_hold');

DROP TYPE IF EXISTS public.enquiry_status CASCADE;
CREATE TYPE public.enquiry_status AS ENUM ('new', 'in_progress', 'responded', 'closed');

DROP TYPE IF EXISTS public.enquiry_type CASCADE;
CREATE TYPE public.enquiry_type AS ENUM ('General Enquiry', 'Business Enquiry', 'Partnership', 'Media/Press', 'Event/Sponsorship', 'Careers', 'Other');

-- 2. TABLES

-- Job Openings
CREATE TABLE IF NOT EXISTS public.job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    employment_type public.employment_type DEFAULT 'Full Time'::public.employment_type,
    experience_required TEXT DEFAULT '',
    description TEXT DEFAULT '',
    responsibilities TEXT DEFAULT '',
    required_skills TEXT DEFAULT '',
    posted_date DATE DEFAULT CURRENT_DATE,
    application_deadline DATE,
    job_status public.job_status DEFAULT 'draft'::public.job_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id TEXT NOT NULL UNIQUE,
    job_opening_id UUID REFERENCES public.job_openings(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    current_location TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    current_company TEXT DEFAULT '',
    current_designation TEXT DEFAULT '',
    total_experience TEXT DEFAULT '',
    relevant_experience TEXT DEFAULT '',
    current_ctc TEXT DEFAULT '',
    expected_ctc TEXT DEFAULT '',
    notice_period TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    cover_letter TEXT DEFAULT '',
    source TEXT DEFAULT '',
    consent BOOLEAN DEFAULT false,
    resume_url TEXT DEFAULT '',
    app_status public.application_status DEFAULT 'new'::public.application_status,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contact Enquiries
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    designation TEXT DEFAULT '',
    subject TEXT NOT NULL,
    enquiry_type public.enquiry_type DEFAULT 'General Enquiry'::public.enquiry_type,
    message TEXT NOT NULL,
    company_website TEXT DEFAULT '',
    city TEXT DEFAULT '',
    country TEXT DEFAULT '',
    source TEXT DEFAULT '',
    consent BOOLEAN DEFAULT false,
    enq_status public.enquiry_status DEFAULT 'new'::public.enquiry_status,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_job_openings_status ON public.job_openings(job_status);
CREATE INDEX IF NOT EXISTS idx_job_openings_department ON public.job_openings(department);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_opening_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(app_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON public.contact_enquiries(enq_status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_type ON public.contact_enquiries(enquiry_type);

-- 4. TRIGGERS
DROP TRIGGER IF EXISTS update_job_openings_updated_at ON public.job_openings;
CREATE TRIGGER update_job_openings_updated_at
    BEFORE UPDATE ON public.job_openings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_contact_enquiries_updated_at ON public.contact_enquiries;
CREATE TRIGGER update_contact_enquiries_updated_at
    BEFORE UPDATE ON public.contact_enquiries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. ENABLE RLS
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- job_openings: public read published, admin manage all
DROP POLICY IF EXISTS "public_read_published_jobs" ON public.job_openings;
CREATE POLICY "public_read_published_jobs" ON public.job_openings
FOR SELECT TO public USING (job_status = 'published'::public.job_status);

DROP POLICY IF EXISTS "admin_manage_job_openings" ON public.job_openings;
CREATE POLICY "admin_manage_job_openings" ON public.job_openings
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- job_applications: public insert, admin read/manage
DROP POLICY IF EXISTS "public_insert_job_applications" ON public.job_applications;
CREATE POLICY "public_insert_job_applications" ON public.job_applications
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_job_applications" ON public.job_applications;
CREATE POLICY "admin_manage_job_applications" ON public.job_applications
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_enquiries: public insert, admin manage
DROP POLICY IF EXISTS "public_insert_contact_enquiries" ON public.contact_enquiries;
CREATE POLICY "public_insert_contact_enquiries" ON public.contact_enquiries
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "admin_manage_contact_enquiries" ON public.contact_enquiries;
CREATE POLICY "admin_manage_contact_enquiries" ON public.contact_enquiries
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. SEED DATA - Sample Job Openings
DO $$
BEGIN
    INSERT INTO public.job_openings (
        id, job_id, title, department, location, employment_type,
        experience_required, description, responsibilities, required_skills,
        posted_date, job_status
    ) VALUES
    (
        gen_random_uuid(),
        'BNG-MKT-001',
        'Digital Marketing Manager',
        'Marketing',
        'Noida',
        'Full Time'::public.employment_type,
        '3-5 Years',
        'We are looking for an experienced Digital Marketing Manager to lead our online marketing efforts across all BNG brands. You will be responsible for developing and executing comprehensive digital marketing strategies.',
        'Develop and implement digital marketing strategies across all platforms
Manage SEO/SEM campaigns and optimize for performance
Oversee social media presence and content calendar
Analyze campaign performance and provide actionable insights
Collaborate with content and design teams
Manage marketing budgets and ROI tracking',
        'Google Analytics, SEO/SEM, Social Media Marketing, Content Strategy, Email Marketing, Meta Ads, LinkedIn Ads',
        CURRENT_DATE - INTERVAL '5 days',
        'published'::public.job_status
    ),
    (
        gen_random_uuid(),
        'BNG-TECH-001',
        'Full Stack Developer',
        'Technology',
        'Noida',
        'Full Time'::public.employment_type,
        '2-4 Years',
        'Join our technology team to build and maintain digital products for BNG and its portfolio brands. You will work on exciting projects spanning media, events, and enterprise solutions.',
        'Design and develop scalable web applications
Build RESTful APIs and integrate third-party services
Collaborate with design team to implement UI/UX
Write clean, maintainable, and well-documented code
Participate in code reviews and technical discussions
Optimize application performance',
        'React.js, Next.js, Node.js, TypeScript, PostgreSQL, REST APIs, Git',
        CURRENT_DATE - INTERVAL '3 days',
        'published'::public.job_status
    ),
    (
        gen_random_uuid(),
        'BNG-CONT-001',
        'Content Writer & Editor',
        'Editorial',
        'Noida / Remote',
        'Full Time'::public.employment_type,
        '1-3 Years',
        'We are seeking a talented Content Writer & Editor to create compelling content for our magazines, websites, and social media channels. You will work across multiple brands including The Founder Media, Tech Disruptor Media, and more.',
        'Write and edit articles, features, and interviews for print and digital publications
Research industry trends and develop story ideas
Collaborate with editorial team on content planning
Ensure content meets brand voice and quality standards
Manage content calendar and meet deadlines
Optimize content for SEO',
        'Excellent writing skills, Research, SEO writing, MS Office, CMS platforms, Journalism background preferred',
        CURRENT_DATE - INTERVAL '7 days',
        'published'::public.job_status
    )
    ON CONFLICT (job_id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
