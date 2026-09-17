-- AA Classes Supabase setup
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists study_materials (
  id text primary key,
  title text not null,
  category text not null check (category in ('notes','papers')),
  subject text not null,
  klass text not null,
  description text default '',
  file_type text not null,
  file_size text default '',
  file_path text,
  downloads integer not null default 0,
  difficulty text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  name text not null,
  klass text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id text primary key,
  student text not null,
  parent text default '',
  phone text not null,
  email text not null,
  klass text not null,
  course text not null,
  message text default '',
  created_at timestamptz not null default now()
);

create table if not exists contact_settings (
  id integer primary key,
  address text default '',
  phone text default '',
  email text default '',
  timings text default '',
  updated_at timestamptz not null default now()
);
insert into contact_settings(id) values (1) on conflict (id) do nothing;

alter table study_materials enable row level security;
alter table reviews enable row level security;
alter table enquiries enable row level security;
alter table contact_settings enable row level security;

-- Public website policies.
drop policy if exists "public read materials" on study_materials;
create policy "public read materials" on study_materials for select to anon, authenticated using (true);

drop policy if exists "public read approved reviews" on reviews;
create policy "public read approved reviews" on reviews for select to anon, authenticated using (status='approved');

drop policy if exists "public submit pending reviews" on reviews;
create policy "public submit pending reviews" on reviews for insert to anon, authenticated with check (status='pending');

drop policy if exists "public submit enquiries" on enquiries;
create policy "public submit enquiries" on enquiries for insert to anon, authenticated with check (true);

drop policy if exists "public read contact settings" on contact_settings;
create policy "public read contact settings" on contact_settings for select to anon, authenticated using (id=1);

-- Authenticated admin policies.
-- IMPORTANT: for a production site, replace the simple authenticated check below
-- with an admin-role/profile policy if multiple authenticated users will exist.
drop policy if exists "authenticated manage materials" on study_materials;
create policy "authenticated manage materials" on study_materials for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage reviews" on reviews;
create policy "authenticated manage reviews" on reviews for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read enquiries" on enquiries;
create policy "authenticated read enquiries" on enquiries for select to authenticated using (true);

drop policy if exists "authenticated manage contact" on contact_settings;
create policy "authenticated manage contact" on contact_settings for all to authenticated using (true) with check (true);

-- Storage bucket:
insert into storage.buckets (id, name, public) values ('study-materials','study-materials',false)
on conflict (id) do nothing;

drop policy if exists "authenticated upload study materials" on storage.objects;
create policy "authenticated upload study materials" on storage.objects
for insert to authenticated
with check (bucket_id='study-materials');

drop policy if exists "authenticated read study materials" on storage.objects;
create policy "authenticated read study materials" on storage.objects
for select to authenticated
using (bucket_id='study-materials');

drop policy if exists "authenticated delete study materials" on storage.objects;
create policy "authenticated delete study materials" on storage.objects
for delete to authenticated
using (bucket_id='study-materials');

-- Public downloads use authenticated? The public page uses storage.download with the browser anon key.
-- Therefore make the bucket public OR replace the download implementation with signed URLs.
-- This project keeps the bucket private for safer defaults; to make public downloads work
-- immediately, run the following instead:
-- update storage.buckets set public=true where id='study-materials';
