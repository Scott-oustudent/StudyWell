import supabase, { } from './supabaseService';
import * as supabaseService from './supabaseService';

type AuditEntry = {
  id?: string;
  action: string;
  actor?: string | null;
  details?: any;
  timestamp?: string;
};

const LOCAL_KEY = 'auditLog';

export const logAuditLocal = (entry: AuditEntry) => {
  try {
    const cur = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const full: AuditEntry = { ...entry, timestamp: entry.timestamp || new Date().toISOString(), id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}` };
    cur.push(full);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cur));
  } catch (err) {
    console.error('Failed to write local audit log', err);
  }
};

export const logAudit = async (action: string, actor: string | null, details: any) => {
  const entry = { action, actor, details, timestamp: new Date().toISOString() };
  // always write local
  logAuditLocal(entry as any);
  // attempt remote
  try {
    await supabaseService.saveAuditRemote({ action, actor, details, timestamp: entry.timestamp });
  } catch (err) {
    // don't throw — just log
    console.error('Failed to save audit remotely', err);
  }
};

export default { logAudit, logAuditLocal };
