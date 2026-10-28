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
