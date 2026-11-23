-- Private inbox. Only the Edge Function uses the service role; browsers have no table or bucket access.
create table if not exists public.owl_letters (
  id bigint primary key,
  kind text not null check (kind in ('text', 'voice')),
  body text,
  audio_path text,
  sent_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint owl_letter_payload check (
    (kind = 'text' and body is not null and audio_path is null) or
    (kind = 'voice' and audio_path is not null and body is null)
  )
);

alter table public.owl_letters enable row level security;
revoke all on public.owl_letters from anon, authenticated;
grant select, insert, update on public.owl_letters to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('owl-voice', 'owl-voice', false, 5000000, array['audio/ogg'])
on conflict (id) do nothing;
