-- Clients & Partners table
CREATE TABLE IF NOT EXISTS public.clients_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_partners_status ON public.clients_partners(status);
CREATE INDEX IF NOT EXISTS idx_clients_partners_display_order ON public.clients_partners(display_order);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_clients_partners_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_clients_partners_updated_at ON public.clients_partners;
CREATE TRIGGER set_clients_partners_updated_at
  BEFORE UPDATE ON public.clients_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_clients_partners_updated_at();

-- Enable RLS
ALTER TABLE public.clients_partners ENABLE ROW LEVEL SECURITY;

-- Public can read active partners
DROP POLICY IF EXISTS "public_read_active_clients_partners" ON public.clients_partners;
CREATE POLICY "public_read_active_clients_partners"
  ON public.clients_partners
  FOR SELECT
  TO public
  USING (status = 'active');

-- Authenticated (admin) can do everything
DROP POLICY IF EXISTS "admin_manage_clients_partners" ON public.clients_partners;
CREATE POLICY "admin_manage_clients_partners"
  ON public.clients_partners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for client/partner logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clients-partners',
  'clients-partners',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for clients-partners bucket
DROP POLICY IF EXISTS "public_read_clients_partners_logos" ON storage.objects;
CREATE POLICY "public_read_clients_partners_logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'clients-partners');

DROP POLICY IF EXISTS "admin_upload_clients_partners_logos" ON storage.objects;
CREATE POLICY "admin_upload_clients_partners_logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'clients-partners');

DROP POLICY IF EXISTS "admin_update_clients_partners_logos" ON storage.objects;
CREATE POLICY "admin_update_clients_partners_logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'clients-partners');

DROP POLICY IF EXISTS "admin_delete_clients_partners_logos" ON storage.objects;
CREATE POLICY "admin_delete_clients_partners_logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'clients-partners');
