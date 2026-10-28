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
