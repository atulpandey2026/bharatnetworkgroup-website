'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { auditService, rollbackService, type AuditLog, type ContentSnapshot, type AuditEntity, type AuditAction } from '@/lib/audit-service';

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-gray-100 text-gray-600',
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  publish: 'bg-green-100 text-green-700',
  unpublish: 'bg-orange-100 text-orange-700',
  upload: 'bg-purple-100 text-purple-700',
  set_active: 'bg-cyan-100 text-cyan-700',
  rollback: 'bg-indigo-100 text-indigo-700',
};

const ENTITY_LABELS: Record<string, string> = {
  hero_image: 'Hero Image',
  brand: 'Brand',
  magazine: 'Magazine',
  team_member: 'Team Member',
  auth: 'Auth',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [snapshots, setSnapshots] = useState<ContentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'rollback'>('logs');
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [search, setSearch] = useState('');
  const [rollbackConfirm, setRollbackConfirm] = useState<ContentSnapshot | null>(null);
  const [rolling, setRolling] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
    else { setError(msg); setTimeout(() => setError(''), 4000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [logsData, snapshotsData] = await Promise.all([
        auditService.getAll({ limit: 200 }),
        auditService.getAllSnapshots(),
      ]);
      setLogs(logsData);
      setSnapshots(snapshotsData);
    } catch (e: any) {
      notify(e?.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRollback = async () => {
    if (!rollbackConfirm) return;
    setRolling(true);
    try {
      await rollbackService.rollback(rollbackConfirm);
      setRollbackConfirm(null);
      notify(`Successfully rolled back "${rollbackConfirm.entity_name}" to snapshot from ${formatDate(rollbackConfirm.created_at)}`);
      await load();
    } catch (e: any) {
      notify(e?.message || 'Rollback failed', 'error');
    } finally {
      setRolling(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchEntity = !filterEntity || log.entity_type === filterEntity;
    const matchAction = !filterAction || log.action === filterAction;
    const matchSearch = !search ||
      log.summary.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email.toLowerCase().includes(search.toLowerCase()) ||
      (log.entity_name || '').toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchAction && matchSearch;
  });

  const filteredSnapshots = snapshots.filter((s) => {
    const matchEntity = !filterEntity || s.entity_type === filterEntity;
    const matchSearch = !search ||
      s.entity_name.toLowerCase().includes(search.toLowerCase()) ||
      s.created_by_email.toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchSearch;
  });

  const rollbackableEntities = ['magazine', 'team_member', 'brand', 'hero_image'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Audit Log</h2>
          <p className="text-gray-500 text-sm">Track all admin actions and rollback published content</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">{success}</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Actions', value: logs.length, color: 'text-gray-900' },
          { label: 'Snapshots', value: snapshots.length, color: 'text-indigo-600' },
          { label: 'Today', value: logs.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: 'text-emerald-600' },
          { label: 'Rollbacks', value: logs.filter((l) => l.action === 'rollback').length, color: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {(['logs', 'rollback'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'logs' ? 'Activity Log' : 'Rollback / Undo'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by summary, user, or entity…"
          className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A1E] focus:border-transparent"
        />
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A1E] bg-white"
        >
          <option value="">All Entities</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {activeTab === 'logs' && (
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05A1E] bg-white"
          >
            <option value="">All Actions</option>
            {['login', 'logout', 'create', 'update', 'delete', 'publish', 'unpublish', 'upload', 'set_active', 'rollback'].map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      {/* ─── Activity Log Tab ─────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {logs.length === 0 ? 'No activity recorded yet. Actions will appear here as you use the admin panel.' : 'No results match your filters.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Action badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action.toUpperCase()}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium leading-snug">{log.summary}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{log.user_email}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{ENTITY_LABELS[log.entity_type] || log.entity_type}</span>
                        {log.entity_name && (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{log.entity_name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Time + expand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{timeAgo(log.created_at)}</p>
                        <p className="text-xs text-gray-400">{formatDate(log.created_at)}</p>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <button
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View metadata"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {expandedLog === log.id
                              ? <><polyline points="18 15 12 9 6 15" /></>
                              : <><polyline points="6 9 12 15 18 9" /></>}
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded metadata */}
                  {expandedLog === log.id && log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 ml-[72px] bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Metadata</p>
                      <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Rollback Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'rollback' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredSnapshots.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {snapshots.length === 0
                ? 'No snapshots yet. Snapshots are saved automatically when you edit or publish content.' :'No snapshots match your filters.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredSnapshots.map((snap) => {
                const canRollback = rollbackableEntities.includes(snap.entity_type);
                return (
                  <div key={snap.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Entity badge */}
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                        {ENTITY_LABELS[snap.entity_type] || snap.entity_type}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{snap.entity_name || snap.entity_id}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">Saved by {snap.created_by_email}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{formatDate(snap.created_at)}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{timeAgo(snap.created_at)}</span>
                        </div>
                      </div>

                      {/* Rollback button */}
                      <div className="flex-shrink-0">
                        {canRollback ? (
                          <button
                            onClick={() => setRollbackConfirm(snap)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                            </svg>
                            Restore
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Read-only</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Rollback Confirm Modal ───────────────────────────────────────── */}
      {rollbackConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                </svg>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold">Confirm Rollback</h4>
                <p className="text-gray-500 text-xs">This will restore the content to a previous state</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entity</span>
                <span className="text-gray-900 font-medium">{rollbackConfirm.entity_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900">{ENTITY_LABELS[rollbackConfirm.entity_type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Snapshot date</span>
                <span className="text-gray-900">{formatDate(rollbackConfirm.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saved by</span>
                <span className="text-gray-900">{rollbackConfirm.created_by_email}</span>
              </div>
            </div>

            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              ⚠️ This will overwrite the current content. The current state will not be automatically saved. Proceed with caution.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRollbackConfirm(null)}
                disabled={rolling}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                disabled={rolling}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {rolling ? 'Restoring…' : 'Restore Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
