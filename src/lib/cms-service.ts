import { createClient } from '@/lib/supabase/client';

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const errorClass = error.code.substring(0, 2);
    if (errorClass === '42') return true;
    if (errorClass === '23') return false;
    if (errorClass === '08') return true;
  }
  if (error.message) {
    const patterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /type.*does not exist/i,
    ];
    return patterns.some((p) => p.test(error.message));
  }
  return false;
}

// ─── Hero Images ────────────────────────────────────────────────────────────

export const heroService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async getActive() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (error) { if (isSchemaError(error)) throw error; return null; }
    return data;
  },

  async create(payload: { image_url: string; alt_text: string; is_active?: boolean }) {
    const supabase = createClient();
    if (payload.is_active) {
      await supabase.from('hero_images').update({ is_active: false }).eq('is_active', true);
    }
    const { data, error } = await supabase.from('hero_images').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async setActive(id: string) {
    const supabase = createClient();
    await supabase.from('hero_images').update({ is_active: false }).eq('is_active', true);
    const { data, error } = await supabase
      .from('hero_images')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('hero_images').delete().eq('id', id);
    if (error) throw error;
  },
};





// ─── About Images ────────────────────────────────────────────────────────────

export const aboutService = {
  async getAll() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('about_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaError(error)) throw error;
      return [];
    }

    return data || [];
  },

  async getActive() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('about_images')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isSchemaError(error)) throw error;
      return null;
    }

    return data;
  },

  async create(payload: {
    image_url: string;
    alt_text?: string;
    is_active?: boolean;
  }) {
    const supabase = createClient();

    // If this image should be active,
    // deactivate the currently active image first.
    if (payload.is_active) {
      await supabase
        .from('about_images')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    const { data, error } = await supabase
      .from('about_images')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async setActive(id: string) {
    const supabase = createClient();

    // Deactivate current image
    await supabase
      .from('about_images')
      .update({ is_active: false })
      .eq('is_active', true);

    // Activate selected image
    const { data, error } = await supabase
      .from('about_images')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async delete(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from('about_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};












// ─── Brands ─────────────────────────────────────────────────────────────────

export const brandsService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async getActive() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async create(payload: { name: string; logo_url?: string; website_url?: string; display_order?: number; is_active?: boolean }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: payload.name,
        logo_url: payload.logo_url || '',
        website_url: payload.website_url || '',
        display_order: payload.display_order ?? 0,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: Partial<{ name: string; logo_url: string; website_url: string; display_order: number; is_active: boolean }>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Magazines ──────────────────────────────────────────────────────────────

export const magazinesService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('magazines')
      .select('*, brands(id, name)')
      .order('created_at', { ascending: false });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async getPublished() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('magazines')
      .select('*, brands(id, name)')
      .eq('mag_status', 'published')
      .order('publication_date', { ascending: false });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async create(payload: {
    title: string;
    brand_id: string;
    edition: string;
    publication_date?: string;
    thumbnail_url?: string;
    pdf_url?: string;
    description?: string;
    mag_status?: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase.from('magazines').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('magazines')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('magazines').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Team Members ────────────────────────────────────────────────────────────

export const teamService = {
  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async getActive() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('member_status', 'active')
      .order('display_order', { ascending: true });
    if (error) { if (isSchemaError(error)) throw error; return []; }
    return data || [];
  },

  async create(payload: {
    name: string;
    designation: string;
    company?: string;
    profile_image_url?: string;
    bio?: string;
    linkedin_url?: string;
    display_order?: number;
    member_status?: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase.from('team_members').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Storage ─────────────────────────────────────────────────────────────────
// ─── Storage ─────────────────────────────────────────────────────────────────

export const storageService = {
  async upload(bucket: string, path: string, file: File): Promise<string> {
    const supabase = createClient();

    // Check whether the user has an active Supabase session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        `Authentication error: ${sessionError.message}`
      );
    }

    if (!session) {
      throw new Error(
        'No active Supabase session. Please logout and login again.'
      );
    }

    const ext =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const fileName = `${path}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Storage upload failed: ${error.message}`
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteByUrl(bucket: string, url: string) {
    const supabase = createClient();

    const path = url.split(
      `/storage/v1/object/public/${bucket}/`
    )[1];

    if (!path) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(
        `Storage delete failed: ${error.message}`
      );
    }
  },
};