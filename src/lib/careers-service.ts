import { createClient } from '@/lib/supabase/client';

// ─── Job Openings ─────────────────────────────────────────────────────────────

export const jobsService = {
  async getPublished() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('job_status', 'published')
      .order('posted_date', { ascending: false });
    if (error) { console.error('jobsService.getPublished', error); return []; }
    return data || [];
  },

  async getAll() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('jobsService.getAll', error); return []; }
    return data || [];
  },

  async getById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload: {
    job_id: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
    experience_required?: string;
    description?: string;
    responsibilities?: string;
    required_skills?: string;
    posted_date?: string;
    application_deadline?: string;
    job_status?: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase.from('job_openings').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_openings')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('job_openings').delete().eq('id', id);
    if (error) throw error;
  },

  async duplicate(id: string) {
    const supabase = createClient();
    const original = await this.getById(id);
    const { id: _id, created_at, updated_at, ...rest } = original;
    const newJobId = `${rest.job_id}-COPY-${Date.now()}`;
    return this.create({ ...rest, job_id: newJobId, job_status: 'draft', title: `${rest.title} (Copy)` });
  },
};

// ─── Job Applications ─────────────────────────────────────────────────────────

function generateApplicationId(): string {
  const prefix = 'APP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const applicationsService = {
  async submit(payload: {
    job_opening_id?: string;
    full_name: string;
    email: string;
    mobile: string;
    current_location?: string;
    city?: string;
    state?: string;
    current_company?: string;
    current_designation?: string;
    total_experience?: string;
    relevant_experience?: string;
    current_ctc?: string;
    expected_ctc?: string;
    notice_period?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    cover_letter?: string;
    source?: string;
    consent: boolean;
    resume_url?: string;
  }) {
    const supabase = createClient();
    const application_id = generateApplicationId();
    const { data, error } = await supabase
      .from('job_applications')
      .insert({ ...payload, application_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll(filters?: { status?: string; job_id?: string; search?: string; page?: number; limit?: number }) {
    const supabase = createClient();
    let query = supabase
      .from('job_applications')
      .select('*, job_openings(id, title, department, job_id)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('app_status', filters.status);
    if (filters?.job_id) query = query.eq('job_opening_id', filters.job_id);
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,application_id.ilike.%${filters.search}%`);
    }

    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) { console.error('applicationsService.getAll', error); return { data: [], count: 0 }; }
    return { data: data || [], count: count || 0 };
  },

  async getById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, job_openings(id, title, department, job_id)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_applications')
      .update({ app_status: status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateNotes(id: string, notes: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_applications')
      .update({ admin_notes: notes })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Contact Enquiries ────────────────────────────────────────────────────────

function generateEnquiryId(): string {
  const prefix = 'ENQ';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const contactEnquiriesService = {
  async submit(payload: {
    full_name: string;
    email: string;
    mobile?: string;
    company_name?: string;
    designation?: string;
    subject: string;
    enquiry_type: string;
    message: string;
    company_website?: string;
    city?: string;
    country?: string;
    source?: string;
    consent: boolean;
  }) {
    const supabase = createClient();
    const enquiry_id = generateEnquiryId();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .insert({ ...payload, enquiry_id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll(filters?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) {
    const supabase = createClient();
    let query = supabase
      .from('contact_enquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('enq_status', filters.status);
    if (filters?.type) query = query.eq('enquiry_type', filters.type);
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,enquiry_id.ilike.%${filters.search}%`);
    }

    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) { console.error('contactEnquiriesService.getAll', error); return { data: [], count: 0 }; }
    return { data: data || [], count: count || 0 };
  },

  async getById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .update({ enq_status: status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateNotes(id: string, notes: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .update({ admin_notes: notes })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('contact_enquiries').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Resume Upload ────────────────────────────────────────────────────────────

export const resumeUploadService = {
  async upload(file: File): Promise<string> {
    const supabase = createClient();
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, DOC, and DOCX files are allowed.');
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB.');
    }
    const ext = file.name.split('.').pop();
    const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('resumes').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);
    return publicUrl;
  },
};
