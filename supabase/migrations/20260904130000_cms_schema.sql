-- ============================================================
-- BNG CMS Schema Migration
-- ============================================================

-- 1. TYPES
DROP TYPE IF EXISTS public.magazine_status CASCADE;
CREATE TYPE public.magazine_status AS ENUM ('published', 'draft');

DROP TYPE IF EXISTS public.member_status CASCADE;
CREATE TYPE public.member_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'editor');

-- 2. CORE TABLES

-- User profiles (linked to Supabase auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    role public.user_role DEFAULT 'editor'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Hero images
CREATE TABLE IF NOT EXISTS public.hero_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL DEFAULT '',
    website_url TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Magazines
CREATE TABLE IF NOT EXISTS public.magazines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    edition TEXT NOT NULL DEFAULT '',
    publication_date DATE,
    thumbnail_url TEXT DEFAULT '',
    pdf_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    mag_status public.magazine_status DEFAULT 'draft'::public.magazine_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    designation TEXT NOT NULL DEFAULT '',
    company TEXT DEFAULT '',
    profile_image_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    member_status public.member_status DEFAULT 'active'::public.member_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_hero_images_is_active ON public.hero_images(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_display_order ON public.brands(display_order);
CREATE INDEX IF NOT EXISTS idx_magazines_brand_id ON public.magazines(brand_id);
CREATE INDEX IF NOT EXISTS idx_magazines_status ON public.magazines(mag_status);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON public.team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(member_status);

-- 4. FUNCTIONS

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Handle new auth user → create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'editor')::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
)
$$;

-- 5. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- hero_images: public read, admin write
DROP POLICY IF EXISTS "public_read_hero_images" ON public.hero_images;
CREATE POLICY "public_read_hero_images" ON public.hero_images
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_manage_hero_images" ON public.hero_images;
CREATE POLICY "admin_manage_hero_images" ON public.hero_images
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- brands: public read, admin write
DROP POLICY IF EXISTS "public_read_brands" ON public.brands;
CREATE POLICY "public_read_brands" ON public.brands
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_manage_brands" ON public.brands;
CREATE POLICY "admin_manage_brands" ON public.brands
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- magazines: public read published, admin manage all
DROP POLICY IF EXISTS "public_read_published_magazines" ON public.magazines;
CREATE POLICY "public_read_published_magazines" ON public.magazines
FOR SELECT TO public USING (mag_status = 'published'::public.magazine_status);

DROP POLICY IF EXISTS "admin_manage_magazines" ON public.magazines;
CREATE POLICY "admin_manage_magazines" ON public.magazines
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- team_members: public read active, admin manage all
DROP POLICY IF EXISTS "public_read_active_team" ON public.team_members;
CREATE POLICY "public_read_active_team" ON public.team_members
FOR SELECT TO public USING (member_status = 'active'::public.member_status);

DROP POLICY IF EXISTS "admin_manage_team" ON public.team_members;
CREATE POLICY "admin_manage_team" ON public.team_members
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_hero_images_updated_at ON public.hero_images;
CREATE TRIGGER update_hero_images_updated_at
    BEFORE UPDATE ON public.hero_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_magazines_updated_at ON public.magazines;
CREATE TRIGGER update_magazines_updated_at
    BEFORE UPDATE ON public.magazines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. SEED DATA

-- Admin user
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    brand_tfm_id UUID := gen_random_uuid();
    brand_banker_id UUID := gen_random_uuid();
    brand_tdm_id UUID := gen_random_uuid();
    brand_educator_id UUID := gen_random_uuid();
    brand_o2_id UUID := gen_random_uuid();
    brand_boothify_id UUID := gen_random_uuid();
    brand_netconx_id UUID := gen_random_uuid();
BEGIN
    -- Create admin auth user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@bharatnetworkgroup.com', crypt('Admin@BNG2024', gen_salt('bf', 10)), now(), now(), now(),
        jsonb_build_object('full_name', 'BNG Admin', 'role', 'admin'),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    ) ON CONFLICT (id) DO NOTHING;

    -- Seed hero image
    INSERT INTO public.hero_images (id, image_url, alt_text, is_active)
    VALUES (
        gen_random_uuid(),
        'https://www.bharatnetworkgroup.com/assets/img/about/about.jpeg',
        'Bharat Network Group team collaborating in a bright modern workspace',
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- Seed brands
    INSERT INTO public.brands (id, name, logo_url, website_url, display_order, is_active) VALUES
        (brand_tfm_id, 'The Founder Media', 'https://www.bharatnetworkgroup.com/assets/img/icons/tfm.png', 'https://thefoundermedia.com/', 1, true),
        (brand_tdm_id, 'Tech Disruptor Media', 'https://www.bharatnetworkgroup.com/assets/img/icons/tech.png', 'https://techdisruptormedia.com/', 2, true),
        (brand_banker_id, 'The Banker Media', 'https://www.bharatnetworkgroup.com/assets/img/icons/Banker.png', 'https://b2bmarketmedia.com/', 3, true),
        (brand_educator_id, 'The Educator Media', 'https://www.bharatnetworkgroup.com/assets/img/icons/Educator.png', '', 4, true),
        (brand_o2_id, 'O2-Gears', 'https://www.bharatnetworkgroup.com/assets/img/icons/o2.png', '', 5, true),
        (brand_boothify_id, 'Boothify', 'https://www.bharatnetworkgroup.com/assets/img/icons/boothify.png', 'https://boothify.in/', 6, true),
        (brand_netconx_id, 'NetconX', 'https://www.bharatnetworkgroup.com/assets/img/icons/Netconx.png', '', 7, true)
    ON CONFLICT (id) DO NOTHING;

    -- Seed magazines
    INSERT INTO public.magazines (id, title, brand_id, edition, publication_date, thumbnail_url, pdf_url, description, mag_status) VALUES
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 1 · Issue 1', '2022-01-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V1-I1.pdf', 'Inaugural issue of The Founder Media', 'published'),
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 1 · Issue 2', '2022-04-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V1-I2.pdf', 'Second issue of The Founder Media', 'published'),
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 1 · Issue 3', '2022-07-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V1-I3.pdf', 'Third issue of The Founder Media', 'published'),
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 2 · Issue 1', '2023-01-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V2-I1.pdf', 'Vol 2 launch issue', 'published'),
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 2 · Issue 2', '2023-04-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V2-I2.pdf', 'Vol 2 second issue', 'published'),
        (gen_random_uuid(), 'The Founder Media', brand_tfm_id, 'Vol 3 · Issue 1', '2024-01-01', 'https://images.unsplash.com/photo-1583823782502-1955f2f6a5bf', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TFM-V3-I1.pdf', 'Vol 3 launch issue', 'published'),
        (gen_random_uuid(), 'The Banker Media', brand_banker_id, 'Vol 1 · Issue 1', '2022-02-01', 'https://images.unsplash.com/photo-1601307686455-90423f2c7568', 'https://www.bharatnetworkgroup.com/assets/img/magazines/Banker-V1-I1.pdf', 'Inaugural issue of The Banker Media', 'published'),
        (gen_random_uuid(), 'The Banker Media', brand_banker_id, 'Vol 1 · Issue 3', '2022-08-01', 'https://images.unsplash.com/photo-1601307686455-90423f2c7568', 'https://www.bharatnetworkgroup.com/assets/img/magazines/Banker-V1-I3.pdf', 'Third issue of The Banker Media', 'published'),
        (gen_random_uuid(), 'The Banker Media', brand_banker_id, 'Vol 2 · Issue 1', '2023-02-01', 'https://images.unsplash.com/photo-1601307686455-90423f2c7568', 'https://www.bharatnetworkgroup.com/assets/img/magazines/Banker-V2-I1.pdf', 'Vol 2 launch issue', 'published'),
        (gen_random_uuid(), 'The Banker Media', brand_banker_id, 'Vol 2 · Issue 3', '2023-08-01', 'https://images.unsplash.com/photo-1601307686455-90423f2c7568', 'https://www.bharatnetworkgroup.com/assets/img/magazines/Banker-V2-I3.pdf', 'Vol 2 third issue', 'published'),
        (gen_random_uuid(), 'The Banker Media', brand_banker_id, 'Vol 3 · Issue 1', '2024-02-01', 'https://images.unsplash.com/photo-1601307686455-90423f2c7568', 'https://www.bharatnetworkgroup.com/assets/img/magazines/Banker-V3-I1.pdf', 'Vol 3 launch issue', 'published'),
        (gen_random_uuid(), 'Tech Disruptor Media', brand_tdm_id, 'Vol 1 · Issue 1', '2022-03-01', 'https://images.unsplash.com/photo-1520931061294-db3e762a9273', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TDM-V1-I1.pdf', 'Inaugural issue of Tech Disruptor Media', 'published'),
        (gen_random_uuid(), 'Tech Disruptor Media', brand_tdm_id, 'Vol 2 · Issue 1', '2023-03-01', 'https://images.unsplash.com/photo-1520931061294-db3e762a9273', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TDM-V2-I1.pdf', 'Vol 2 launch issue', 'published'),
        (gen_random_uuid(), 'Tech Disruptor Media', brand_tdm_id, 'Vol 2 · Issue 2', '2023-06-01', 'https://images.unsplash.com/photo-1520931061294-db3e762a9273', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TDM-V2-I2.pdf', 'Vol 2 second issue', 'published'),
        (gen_random_uuid(), 'Tech Disruptor Media', brand_tdm_id, 'Vol 2 · Issue 3', '2023-09-01', 'https://images.unsplash.com/photo-1520931061294-db3e762a9273', 'https://www.bharatnetworkgroup.com/assets/img/magazines/TDM-V2-I3.pdf', 'Vol 2 third issue', 'published')
    ON CONFLICT (id) DO NOTHING;

    -- Seed team members
    INSERT INTO public.team_members (id, name, designation, company, profile_image_url, bio, linkedin_url, display_order, member_status) VALUES
        (gen_random_uuid(), 'Ashish Srivastava', 'Founder & Director', 'Bharat Network Group', 'https://www.bharatnetworkgroup.com/assets/img/person/Ashish.jpg', 'Co-founder and Director of Bharat Network Group, driving the vision of a unified media and business ecosystem.', 'https://www.linkedin.com/in/ashishsriv19/', 1, 'active'),
        (gen_random_uuid(), 'Anupam Gupta', 'Founder & Director', 'Bharat Network Group', 'https://www.bharatnetworkgroup.com/assets/img/person/Anupam.jpg', 'Co-founder and Director of Bharat Network Group, leading strategic growth and partnerships.', '', 2, 'active'),
        (gen_random_uuid(), 'Atul Pandey', 'Director, IT & Digital Strategy', 'Bharat Network Group', 'https://www.bharatnetworkgroup.com/assets/img/person/Atul.jpg', 'Leads IT and digital strategy across all BNG brands.', '', 3, 'active'),
        (gen_random_uuid(), 'Vipin Rai', 'AGM, Art & Designing', 'Bharat Network Group', 'https://www.bharatnetworkgroup.com/assets/img/person/Vipin_Rai.jpg', 'Heads the creative and design function at BNG.', '', 4, 'active'),
        (gen_random_uuid(), 'Aishwarya Saxena', 'Senior Associate Editor', 'Bharat Network Group', 'https://www.bharatnetworkgroup.com/assets/img/person/Aishwarya.jpg', 'Senior Associate Editor managing editorial content across BNG publications.', '', 5, 'active'),
        (gen_random_uuid(), 'Isha Srivastava', 'DGM, Events', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_141e51895-1763296519617.png', 'Deputy General Manager for Events at Bharat Network Group.', '', 6, 'active'),
        (gen_random_uuid(), 'Abhinav Chaudhary', 'Asst. Manager, Sales & Marketing', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_179ebd6f2-1763294255544.png', 'Assistant Manager for Sales and Marketing at BNG.', '', 7, 'active'),
        (gen_random_uuid(), 'Taposhi Bose', 'Asst. Manager, Sales & Marketing', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_1a79b8e72-1763295320816.png', 'Assistant Manager for Sales and Marketing at BNG.', '', 8, 'active'),
        (gen_random_uuid(), 'Nishit Saxena', 'Asst. Manager, Sales & Marketing', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_179ebd6f2-1763294255544.png', 'Assistant Manager for Sales and Marketing at BNG.', '', 9, 'active'),
        (gen_random_uuid(), 'Ankur Srivastava', 'Asst. Manager, Events & Boothify', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_11aeaaee6-1763301508803.png', 'Assistant Manager for Events and Boothify at BNG.', '', 10, 'active'),
        (gen_random_uuid(), 'Devika Gulati', 'Asst. Manager, Sales & Marketing', 'Bharat Network Group', 'https://img.rocket.new/generatedImages/rocket_gen_img_12672b149-1763294392419.png', 'Assistant Manager for Sales and Marketing at BNG.', '', 11, 'active')
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
