import type { SupabaseClient } from '@supabase/supabase-js';
import { syncWeeklyBackup, type BackupRemote } from './weeklyBackup';

const BUCKET = 'sonya-backups';
const CHECK_INTERVAL = 60 * 60 * 1000;
const STATUS_EVENT = 'sonya-backup-status';

export interface BackupStatus {
  connected: boolean;
  busy: boolean;
  latest: Date | null;
  error: string | null;
}

let status: BackupStatus = { connected: false, busy: false, latest: null, error: null };
let clientPromise: Promise<SupabaseClient> | null = null;
let lastCheck = 0;

export function backupConfigured(): boolean {
  return Boolean(import.meta.env.VITE_BACKUP_SUPABASE_URL && import.meta.env.VITE_BACKUP_SUPABASE_ANON_KEY);
}

export function getBackupStatus(): BackupStatus { return { ...status }; }

function setStatus(patch: Partial<BackupStatus>) {
  status = { ...status, ...patch };
  window.dispatchEvent(new Event(STATUS_EVENT));
}

export function subscribeBackupStatus(listener: () => void): () => void {
  window.addEventListener(STATUS_EVENT, listener);
  return () => window.removeEventListener(STATUS_EVENT, listener);
}

async function client(): Promise<SupabaseClient> {
  if (!backupConfigured()) throw new Error('Сервер копий не настроен');
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(
      import.meta.env.VITE_BACKUP_SUPABASE_URL,
      import.meta.env.VITE_BACKUP_SUPABASE_ANON_KEY,
      { auth: { storageKey: 'sonya-world-backup-auth', autoRefreshToken: true, persistSession: true } },
    ));
  }
  return clientPromise;
}

async function authenticated() {
  const supabase = await client();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error?.name === 'AuthSessionMissingError') return null;
  if (error) throw error;
  if (!user) return null;
  return { supabase, user };
}

export async function requestBackupCode(email: string): Promise<void> {
  const supabase = await client();
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
  if (error) throw error;
}

export async function verifyBackupCode(email: string, token: string): Promise<void> {
  const supabase = await client();
  const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
  if (error) throw error;
  await checkBackup(true);
}

async function remoteFor(supabase: SupabaseClient, userId: string): Promise<BackupRemote & { latestName(): Promise<string | null> }> {
  const bucket = supabase.storage.from(BUCKET);
  let lastName: string | null = null;
  let lastDate: Date | null = null;
  const latestName = async () => {
    const { data, error } = await bucket.list(userId, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    const file = data?.[0];
    lastName = file?.name ?? null;
    lastDate = file?.created_at ? new Date(file.created_at) : null;
    return lastName;
  };
  return {
    async latest() { await latestName(); return lastDate; },
    async upload(name, json) {
      const { error } = await bucket.upload(`${userId}/${name}`, new Blob([json], { type: 'application/json' }), {
        contentType: 'application/json', upsert: false,
      });
      if (error) throw error;
    },
    latestName,
  };
}

export async function checkBackup(force = false): Promise<void> {
  if (!backupConfigured() || status.busy || (!force && Date.now() - lastCheck < CHECK_INTERVAL)) return;
  lastCheck = Date.now();
  setStatus({ busy: true, error: null });
  try {
    const auth = await authenticated();
    if (!auth) { setStatus({ connected: false, latest: null }); return; }
    setStatus({ connected: true });
    const remote = await remoteFor(auth.supabase, auth.user.id);
    const result = await syncWeeklyBackup(remote, undefined, new Date(), force);
    setStatus({ connected: true, latest: result.latest });
  } catch (error) {
    setStatus({ error: error instanceof Error ? error.message : 'Не удалось создать копию' });
  } finally {
    setStatus({ busy: false });
  }
}

export async function downloadCloudBackup(): Promise<Blob> {
  const auth = await authenticated();
  if (!auth) throw new Error('Войдите в облачное хранилище');
  const remote = await remoteFor(auth.supabase, auth.user.id);
  const name = await remote.latestName();
  if (!name) throw new Error('Облачных копий пока нет');
  const { data, error } = await auth.supabase.storage.from(BUCKET).download(`${auth.user.id}/${name}`);
  if (error || !data) throw error ?? new Error('Не удалось скачать копию');
  return data;
}

export function startBackupChecks(): void {
  if (!backupConfigured()) return;
  void checkBackup();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkBackup();
  });
}
