// Клиент Supabase подключается ТОЛЬКО когда заданы переменные окружения.
// Без ключей приложение работает в полноценном Local Demo Mode (IndexedDB).
// Схема базы: supabase/schema.sql

import type { SupabaseClient } from '@supabase/supabase-js';

export interface CloudConfig {
  url: string;
  anonKey: string;
}

export function getCloudConfig(): CloudConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && anonKey && url.startsWith('https://')) return { url, anonKey };
  return null;
}

export function isCloudMode(): boolean {
  return getCloudConfig() !== null;
}

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Ленивая загрузка клиента — чтобы демо-режим не тянул supabase-js в рантайм-путь ошибок */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isCloudMode()) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      const cfg = getCloudConfig()!;
      return createClient(cfg.url, cfg.anonKey);
    });
  }
  return clientPromise;
}
