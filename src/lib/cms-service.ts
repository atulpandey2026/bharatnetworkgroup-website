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

// Helper to safely handle inserts without PGRST116 errors
async function safeInsertSingle<T = any>(
  supabase: any,
  table: string,
  payload: any
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*');

  if (error) {
    console.error(`Insert failed on table "${table}":`, error);
    throw new Error(`Failed to create record: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      `Record was created on "${table}", but RLS permissions prevented returning the created row.`
    );
  }

  return data[0] as T;
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
    return await safeInsertSingle(supabase, 'hero_images', payload);
  },

  async setActive(id: string) {
    const supabase = createClient();
    await supabase.from('hero_images').update({ is_active: false }).eq('is_active', true);
    const { data, error } = await supabase
      .from('hero_images')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Hero image record not found or could not be activated.');
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

  async create(payload: { image_url: string; alt_text?: string; is_active?: boolean }) {
    const supabase = createClient();
    if (payload.is_active) {
      await supabase
        .from('about_images')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    return await safeInsertSingle(supabase, 'about_images', payload);
  },

  async setActive(id: string) {
    const supabase = createClient();
    await supabase
      .from('about_images')
      .update({ is_active: false })
      .eq('is_active', true);

    const { data, error } = await supabase
      .from('about_images')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('About image record not found or could not be activated.');
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
    const cleanPayload = {
      name: payload.name,
      logo_url: payload.logo_url || '',
      website_url: payload.website_url || '',
      display_order: payload.display_order ?? 0,
      is_active: payload.is_active ?? true,
    };

    return await safeInsertSingle(supabase, 'brands', cleanPayload);
  },

  async update(id: string, payload: Partial<{ name: string; logo_url: string; website_url: string; display_order: number; is_active: boolean }>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('brands')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Brand was not updated. Verify the record exists and you have update permissions.');
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
    return await safeInsertSingle(supabase, 'magazines', payload);
  },

  async update(id: string, payload: any) {
    const supabase = createClient();

    const { error: updateError, count } = await supabase
      .from('magazines')
      .update(payload, { count: 'exact' })
      .eq('id', id);

    if (updateError) {
      console.error('Magazine update failed:', updateError);
      throw new Error(`Unable to update magazine: ${updateError.message}`);
    }

    const { data, error: fetchError } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (fetchError) {
      console.error('Magazine verification failed:', fetchError);
      throw new Error(`Magazine was updated, but could not be reloaded: ${fetchError.message}`);
    }

    if (!data || data.length === 0 || count === 0) {
      throw new Error(
        'Magazine was not updated. Check that the record exists and your Supabase account has permission to update it.'
      );
    }

    return data[0];
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
    return await safeInsertSingle(supabase, 'team_members', payload);
  },

  async update(id: string, payload: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Team member update failed:', error);
      throw new Error(`Unable to update team member: ${error.message}`);
    }

    if (!data) {
      throw new Error(
        'Team member was not updated. Check that the record exists and your Supabase account has permission to update it.'
      );
    }

    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Storage ─────────────────────────────────────────────────────────────────

export const storageService = {
  async upload(bucket: string, folderPath: string, file: File): Promise<string> {
    const supabase = createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Authentication error: ${sessionError.message}`);
    }

    if (!session) {
      throw new Error('No active session found. Please log in again.');
    }

    const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const safeBaseName = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const fileName = cleanFolder
      ? `${cleanFolder}/${Date.now()}_${safeBaseName}.${ext}`
      : `${Date.now()}_${safeBaseName}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
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

    const path = url.split(`/storage/v1/object/public/${bucket}/`)[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([decodeURIComponent(path)]);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  },
};
