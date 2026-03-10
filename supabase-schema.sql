-- ─────────────────────────────────────
-- The Network · Supabase Schema
-- Run this once in the SQL Editor
-- ─────────────────────────────────────

-- Companies table
create table companies (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  bio              text not null default '',
  website          text,
  industry         text,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at       timestamptz not null default now(),
  last_updated_at  timestamptz not null default now()
);

-- Members table
create table members (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  role             text not null,
  company_id       uuid references companies(id) on delete set null,
  city             text not null,
  bio_work         text not null,
  bio_personal     text not null,
  tags             text[] not null default '{}',
  open_to          text[] not null default '{}',
  linkedin         text,
  twitter          text,
  instagram        text,
  github           text,
  website          text,
  contact          text,
  photo_url        text,
  one_percent      text,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at       timestamptz not null default now(),
  last_updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────
-- Auto-update last_updated_at triggers
-- ─────────────────────────────────────

create or replace function update_last_updated_at()
returns trigger as $$
begin
  new.last_updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger members_updated
  before update on members
  for each row execute function update_last_updated_at();

create trigger companies_updated
  before update on companies
  for each row execute function update_last_updated_at();

-- ─────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────

alter table members   enable row level security;
alter table companies enable row level security;

-- Public can read approved members (email is excluded at the query level in the app)
create policy "Public read approved members"
  on members for select
  using (status = 'approved');

create policy "Public read approved companies"
  on companies for select
  using (status = 'approved');

-- Anyone can submit (insert) — status defaults to pending
create policy "Anyone can submit member"
  on members for insert
  with check (status = 'pending');

create policy "Anyone can submit company"
  on companies for insert
  with check (status = 'pending');

-- ─────────────────────────────────────
-- Storage bucket for avatars
-- ─────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Anyone can upload avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars');
