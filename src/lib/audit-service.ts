import { createClient } from '@/lib/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'login' | 'logout' | 'create' | 'update' | 'delete'
  | 'publish' | 'unpublish' | 'upload' | 'set_active' | 'rollback';

export type AuditEntity =
  | 'hero_image' | 'brand' | 'magazine' | 'team_member' | 'auth';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  action: AuditAction;
  entity_type: AuditEntity;
  entity_id: string | null;
  entity_name: string;
  summary: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ContentSnapshot {
  id: string;
  entity_type: AuditEntity;
  entity_id: string;
  entity_name: string;
  snapshot_data: Record<string, any>;
  created_by: string | null;
  created_by_email: string;
  audit_log_id: string | null;
  created_at: string;
}

// ─── Audit Service ────────────────────────────────────────────────────────────

export const auditService = {
  /**
   * Log an admin action. Silently fails to avoid blocking main operations.
   */
  async log(params: {
    action: AuditAction;
    entity_type: AuditEntity;
    entity_id?: string;
    entity_name?: string;
    summary: string;
    metadata?: Record<string, any>;
  }): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          action: params.action,
          entity_type: params.entity_type,
          entity_id: params.entity_id || null,
          entity_name: params.entity_name || '',
          summary: params.summary,
          metadata: params.metadata || {},
        })
        .select('id')
        .single();

      if (error) return null;
      return data?.id || null;
    } catch {
      return null;
    }
  },

  /**
   * Save a content snapshot before a destructive or publish action.
   * Returns the snapshot id.
   */
  async saveSnapshot(params: {
    entity_type: AuditEntity;
    entity_id: string;
    entity_name: string;
    snapshot_data: Record<string, any>;
    audit_log_id?: string;
  }): Promise<string | null> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('content_snapshots')
        .insert({
          entity_type: params.entity_type,
          entity_id: params.entity_id,
          entity_name: params.entity_name,
          snapshot_data: params.snapshot_data,
          created_by: user.id,
          created_by_email: user.email || '',
          audit_log_id: params.audit_log_id || null,
        })
        .select('id')
        .single();

      if (error) return null;
      return data?.id || null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch all audit logs, newest first.
   */
  async getAll(filters?: {
    entity_type?: AuditEntity;
    action?: AuditAction;
    limit?: number;
  }): Promise<AuditLog[]> {
    const supabase = createClient();
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.entity_type) query = query.eq('entity_type', filters.entity_type);
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  },

  /**
   * Fetch snapshots for a specific entity, newest first.
   */
  async getSnapshots(entity_type: AuditEntity, entity_id: string): Promise<ContentSnapshot[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('content_snapshots')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  /**
   * Get all snapshots for rollback UI, newest first.
   */
  async getAllSnapshots(entity_type?: AuditEntity): Promise<ContentSnapshot[]> {
    const supabase = createClient();
    let query = supabase
      .from('content_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (entity_type) query = query.eq('entity_type', entity_type);

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  },
};

// ─── Rollback Service ─────────────────────────────────────────────────────────

export const rollbackService = {
  /**
   * Rollback a magazine to a previous snapshot.
   */
  async rollbackMagazine(snapshot: ContentSnapshot): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { id, created_at, ...restoreData } = snapshot.snapshot_data as any;

    const { error } = await supabase
      .from('magazines')
      .update(restoreData)
      .eq('id', snapshot.entity_id);

    if (error) throw error;

    await auditService.log({
      action: 'rollback',
      entity_type: 'magazine',
      entity_id: snapshot.entity_id,
      entity_name: snapshot.entity_name,
      summary: `Rolled back "${snapshot.entity_name}" to snapshot from ${new Date(snapshot.created_at).toLocaleString()}`,
      metadata: { snapshot_id: snapshot.id, restored_from: snapshot.created_at },
    });
  },

  /**
   * Rollback a team member to a previous snapshot.
   */
  async rollbackTeamMember(snapshot: ContentSnapshot): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { id, created_at, ...restoreData } = snapshot.snapshot_data as any;

    const { error } = await supabase
      .from('team_members')
      .update(restoreData)
      .eq('id', snapshot.entity_id);

    if (error) throw error;

    await auditService.log({
      action: 'rollback',
      entity_type: 'team_member',
      entity_id: snapshot.entity_id,
      entity_name: snapshot.entity_name,
      summary: `Rolled back "${snapshot.entity_name}" to snapshot from ${new Date(snapshot.created_at).toLocaleString()}`,
      metadata: { snapshot_id: snapshot.id, restored_from: snapshot.created_at },
    });
  },

  /**
   * Rollback a brand to a previous snapshot.
   */
  async rollbackBrand(snapshot: ContentSnapshot): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { id, created_at, ...restoreData } = snapshot.snapshot_data as any;

    const { error } = await supabase
      .from('brands')
      .update(restoreData)
      .eq('id', snapshot.entity_id);

    if (error) throw error;

    await auditService.log({
      action: 'rollback',
      entity_type: 'brand',
      entity_id: snapshot.entity_id,
      entity_name: snapshot.entity_name,
      summary: `Rolled back "${snapshot.entity_name}" to snapshot from ${new Date(snapshot.created_at).toLocaleString()}`,
      metadata: { snapshot_id: snapshot.id, restored_from: snapshot.created_at },
    });
  },

  /**
   * Rollback a hero image to a previous snapshot.
   */
  async rollbackHeroImage(snapshot: ContentSnapshot): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { id, created_at, ...restoreData } = snapshot.snapshot_data as any;

    const { error } = await supabase
      .from('hero_images')
      .update(restoreData)
      .eq('id', snapshot.entity_id);

    if (error) throw error;

    await auditService.log({
      action: 'rollback',
      entity_type: 'hero_image',
      entity_id: snapshot.entity_id,
      entity_name: snapshot.entity_name,
      summary: `Rolled back hero image to snapshot from ${new Date(snapshot.created_at).toLocaleString()}`,
      metadata: { snapshot_id: snapshot.id, restored_from: snapshot.created_at },
    });
  },

  /**
   * Dispatch rollback to the correct handler based on entity type.
   */
  async rollback(snapshot: ContentSnapshot): Promise<void> {
    switch (snapshot.entity_type) {
      case 'magazine':
        return this.rollbackMagazine(snapshot);
      case 'team_member':
        return this.rollbackTeamMember(snapshot);
      case 'brand':
        return this.rollbackBrand(snapshot);
      case 'hero_image':
        return this.rollbackHeroImage(snapshot);
      default:
        throw new Error(`Rollback not supported for entity type: ${snapshot.entity_type}`);
    }
  },
};
