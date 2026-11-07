-- ═══════════════════════════════════════════════════════════════════════════
-- Мир Сонечки — схема Supabase
-- Выполнить в SQL Editor проекта Supabase.
-- В облачном режиме все правила безопасности (RLS) обязательны:
-- ребёнок не может начислять монеты и подтверждать собственные задания.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── Родители ────────────────────────────────────────────────────────────────
create table if not exists parents (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  display_name text not null default 'Мама',
  created_at timestamptz not null default now()
);

-- ─── Детские профили ─────────────────────────────────────────────────────────
create table if not exists child_profiles (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references parents(id) on delete cascade,
  child_name text not null,
  avatar_seed int not null default 42,
  level int not null default 1,
  xp int not null default 0,
  coins int not null default 100 check (coins >= 0),
  streak_days int not null default 1,
  last_login_day date,
  created_at timestamptz not null default now()
);

-- ─── Питомцы (каталог + собственные) ─────────────────────────────────────────
create table if not exists pets (
  id text primary key,               -- uuid либо id из импортированного каталога
  child_id uuid references child_profiles(id) on delete cascade, -- null = глобальный каталог
  name text not null,
  rarity text not null check (rarity in ('Common','Uncommon','Rare','Epic','Legendary','Mythic','Secret')),
  category text not null default 'Без категории',
  description text not null default '',
  image_url text,
  art_seed int not null default 0,
  source text not null default 'catalog' check (source in ('catalog','custom')),
  is_demo boolean not null default false,
  catalog_origin text,
  source_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Записи коллекции ────────────────────────────────────────────────────────
create table if not exists collection_entries (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references child_profiles(id) on delete cascade,
  pet_id text not null references pets(id) on delete cascade,
  status text not null default 'not_found' check (status in ('not_found','wanted','owned')),
  favorite boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (child_id, pet_id)
);

-- ─── Квесты ──────────────────────────────────────────────────────────────────
create table if not exists quests (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null check (category in ('daily','weekly','special','creative','family')),
  difficulty text not null default 'easy' check (difficulty in ('easy','medium','hard','special')),
  reward_coins int not null default 5 check (reward_coins > 0),
  reward_xp int not null default 0,
  enabled boolean not null default true,
  is_demo boolean not null default false,
  last_completed_on date,
  created_at timestamptz not null default now()
);

-- ─── Отправки квестов на проверку ────────────────────────────────────────────
create table if not exists quest_submissions (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid not null references quests(id) on delete cascade,
  child_id uuid not null references child_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  comment text not null default '',
  photo_url text,
  parent_comment text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ─── Транзакции (журнал, идемпотентность через reference_id) ────────────────
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references child_profiles(id) on delete cascade,
  amount int not null,
  type text not null check (type in ('quest_reward','reward_purchase','manual_adjust','achievement_bonus')),
  description text not null,
  reference_id text,               -- уникален при наличии → защита от повторного начисления
  actor text not null default 'parent' check (actor in ('child','parent','system')),
  created_at timestamptz not null default now(),
  unique (child_id, reference_id)
);
create unique index if not exists transactions_ref_idx on transactions (child_id, reference_id) where reference_id is not null;
create index if not exists transactions_child_idx on transactions (child_id, created_at desc);

-- ─── Награды ─────────────────────────────────────────────────────────────────
create table if not exists rewards (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references child_profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null check (category in ('robux','gift','surprise','virtual')),
  cost int not null check (cost > 0),
  image_url text,
  image_seed int not null default 0,
  enabled boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Заявки на награды ───────────────────────────────────────────────────────
create table if not exists reward_requests (
  id uuid primary key default uuid_generate_v4(),
  reward_id uuid not null references rewards(id) on delete cascade,
  child_id uuid not null references child_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','issued')),
  parent_comment text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  issued_at timestamptz
);

-- ─── Достижения ──────────────────────────────────────────────────────────────
create table if not exists achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null
);

create table if not exists child_achievements (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid not null references child_profiles(id) on delete cascade,
  achievement_id text not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (child_id, achievement_id)
);

-- ═══ Row Level Security ═════════════════════════════════════════════════════

alter table parents enable row level security;
alter table child_profiles enable row level security;
alter table pets enable row level security;
alter table collection_entries enable row level security;
alter table quests enable row level security;
alter table quest_submissions enable row level security;
alter table transactions enable row level security;
alter table rewards enable row level security;
alter table reward_requests enable row level security;
alter table achievements enable row level security;
alter table child_achievements enable row level security;

-- В MVP устройство семьи одно: родительский аккаунт через auth.users.
-- Ребёнок в облачном режиме работает с тем же профилем родителя (без отдельного логина),
-- поэтому ребёнок НЕ имеет прямого доступа к таблицам transactions/quests review.

create or replace function is_parent_of(child uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from child_profiles cp
    join parents p on p.id = cp.parent_id
    where cp.id = child and p.email = auth.jwt() ->> 'email'
  );
$$;

-- Ребёнок: чтение собственного профиля и коллекции, запись коллекции и заявок.
-- В реальном развёртывании с отдельными аккаунтами детей здесь должны быть
-- политики под роль child (см. README, раздел «Безопасность»).
create policy "parent reads profile" on child_profiles
  for select using (is_parent_of(id));
create policy "parent updates profile" on child_profiles
  for update using (is_parent_of(id)) with check (is_parent_of(id) and coins >= 0);

create policy "read pets" on pets for select using (true);
create policy "parent manages custom pets" on pets
  for all using (child_id is null or is_parent_of(child_id));

create policy "read collection" on collection_entries for select using (is_parent_of(child_id));
create policy "manage collection" on collection_entries
  for all using (is_parent_of(child_id)) with check (is_parent_of(child_id));

create policy "read quests" on quests for select using (is_parent_of(child_id));
create policy "parent manages quests" on quests
  for all using (is_parent_of(child_id)) with check (is_parent_of(child_id));

create policy "read submissions" on quest_submissions for select using (is_parent_of(child_id));
create policy "create submission" on quest_submissions
  for insert with check (is_parent_of(child_id) and status = 'pending');
create policy "parent reviews submission" on quest_submissions
  for update using (is_parent_of(child_id)) with check (is_parent_of(child_id));

-- Финансы: читать и изменять может только родитель. Добавление строк —
-- только серверная логика (RPC ниже), ребёнок не имеет INSERT.
create policy "parent reads transactions" on transactions for select using (is_parent_of(child_id));
create policy "parent inserts transactions" on transactions
  for insert with check (is_parent_of(child_id) and actor != 'child');

create policy "read rewards" on rewards for select using (is_parent_of(child_id));
create policy "parent manages rewards" on rewards
  for all using (is_parent_of(child_id)) with check (is_parent_of(child_id));

create policy "read reward requests" on reward_requests for select using (is_parent_of(child_id));
create policy "create reward request" on reward_requests
  for insert with check (is_parent_of(child_id) and status = 'pending');
create policy "parent reviews reward request" on reward_requests
  for update using (is_parent_of(child_id)) with check (is_parent_of(child_id));

create policy "read achievements" on achievements for select using (true);
create policy "read child achievements" on child_achievements for select using (is_parent_of(child_id));
create policy "insert child achievements" on child_achievements
  for insert with check (is_parent_of(child_id));

-- ═══ Серверная логика: атомарные операции (RPC) ═════════════════════════════

-- Подтверждение квеста + начисление монет одной транзакцией.
create or replace function approve_quest_submission(submission uuid, p_child uuid, p_coins int, p_xp int)
returns void language plpgsql security definer as $$
begin
  update quest_submissions
     set status = 'approved', reviewed_at = now()
   where id = submission and child_id = p_child and status = 'pending';
  if not found then raise exception 'submission not pending'; end if;

  insert into transactions (child_id, amount, type, description, reference_id, actor)
  values (p_child, p_coins, 'quest_reward', 'Квест подтверждён', 'quest-submission:' || submission, 'parent');

  update child_profiles
     set coins = coins + p_coins, xp = xp + p_xp, level = floor((xp + p_xp) / 100) + 1,
         last_completed_on = current_date
   where id = p_child and coins + p_coins >= 0;
end $$;

-- Одобрение награды + списание монет одной транзакцией (защита от минуса).
create or replace function approve_reward_request(p_request uuid, p_child uuid, p_cost int)
returns void language plpgsql security definer as $$
begin
  update reward_requests
     set status = 'approved', reviewed_at = now()
   where id = p_request and child_id = p_child and status = 'pending';
  if not found then raise exception 'request not pending'; end if;

  update child_profiles set coins = coins - p_cost
   where id = p_child and coins >= p_cost;
  if not found then raise exception 'insufficient coins'; end if;

  insert into transactions (child_id, amount, type, description, reference_id, actor)
  values (p_child, -p_cost, 'reward_purchase', 'Награда одобрена', 'reward-request:' || p_request, 'parent');
end $$;
