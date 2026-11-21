-- Run once in a separate Supabase project used only for progress snapshots.
-- Keep this bucket private. Never add public read or update/delete policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sonya-backups', 'sonya-backups', false, 52428800, array['application/json'])
on conflict (id) do nothing;

create policy "Read own Sonya backups"
on storage.objects for select to authenticated
using (bucket_id = 'sonya-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Create own Sonya backups"
on storage.objects for insert to authenticated
with check (bucket_id = 'sonya-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);
