-- Admin updates: Blog/Tutorial CRUD, Analytics support, product-images bucket
-- Run this SQL in Supabase SQL editor. It is idempotent where possible.

-- Extensions
create extension if not exists pgcrypto;

-- Helper: update updated_at on change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

-- Blog tables
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  tags text[] default '{}'::text[],
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist if the table already existed
alter table public.blog_posts
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists cover_image text,
  add column if not exists tags text[] default '{}'::text[],
  add column if not exists is_published boolean not null default true,
  add column if not exists is_featured boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.tutorial_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  tags text[] default '{}'::text[],
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist if the table already existed
alter table public.tutorial_posts
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists cover_image text,
  add column if not exists tags text[] default '{}'::text[],
  add column if not exists is_published boolean not null default true,
  add column if not exists is_featured boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Triggers for updated_at
create trigger set_updated_at_blog_posts
before update on public.blog_posts
for each row execute function public.set_updated_at();

create trigger set_updated_at_tutorial_posts
before update on public.tutorial_posts
for each row execute function public.set_updated_at();

-- Unique indexes (redundant if unique in DDL, kept for safety)
create unique index if not exists blog_posts_slug_idx on public.blog_posts (slug);
create unique index if not exists tutorial_posts_slug_idx on public.tutorial_posts (slug);

-- Drop existing function to avoid parameter name conflicts
drop function if exists public.generate_unique_slug(text);

-- Function to generate a unique slug across both tables
create function public.generate_unique_slug(base_title text)
returns text
language plpgsql as $$
declare
  base text;
  candidate text;
  i int := 0;
  exists_any boolean;
begin
  base := regexp_replace(lower(coalesce(base_title,'post')), '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  if base = '' then base := 'post'; end if;
  loop
    if i = 0 then
      candidate := base;
    else
      candidate := base || '-' || i::text;
    end if;
    select exists (
      select 1 from public.blog_posts where slug = candidate
      union all
      select 1 from public.tutorial_posts where slug = candidate
      limit 1
    ) into exists_any;
    exit when not exists_any;
    i := i + 1;
  end loop;
  return candidate;
end; $$;

-- Product images relation (if not already present)
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_id_idx on public.product_images(product_id);

-- Storage bucket for product images (public read)
insert into storage.buckets (id, name, public)
select 'product-images', 'product-images', true
where not exists (select 1 from storage.buckets where id = 'product-images');

-- Storage RLS policies for product-images
-- Allow anyone to read images in this bucket
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read product-images'
  ) then
    create policy "Public read product-images" on storage.objects
      for select
      using (bucket_id = 'product-images');
  end if;
end $$;

-- Allow authenticated users to insert/update/delete in this bucket
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth write product-images'
  ) then
    create policy "Auth write product-images" on storage.objects
      for all
      to authenticated
      using (bucket_id = 'product-images')
      with check (bucket_id = 'product-images');
  end if;
end $$;

-- Bucket for blog/tutorial cover images (post-covers)
insert into storage.buckets (id, name, public)
select 'post-covers', 'post-covers', true
where not exists (select 1 from storage.buckets where id = 'post-covers');

-- Storage policies for post-covers
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read post-covers'
  ) then
    create policy "Public read post-covers" on storage.objects
      for select
      using (bucket_id = 'post-covers');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth write post-covers'
  ) then
    create policy "Auth write post-covers" on storage.objects
      for all
      to authenticated
      using (bucket_id = 'post-covers')
      with check (bucket_id = 'post-covers');
  end if;
end $$;

-- Enable RLS on blog tables and add simple policies
alter table public.blog_posts enable row level security;
alter table public.tutorial_posts enable row level security;

-- Public can read only published posts
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_posts' and policyname='Public read published blog') then
    create policy "Public read published blog" on public.blog_posts
      for select
      using (is_published = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tutorial_posts' and policyname='Public read published tutorial') then
    create policy "Public read published tutorial" on public.tutorial_posts
      for select
      using (is_published = true);
  end if;
end $$;

-- Authenticated users (admins) can full CRUD (adjust to your RBAC later)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='blog_posts' and policyname='Auth CRUD blog') then
    create policy "Auth CRUD blog" on public.blog_posts
      for all to authenticated
      using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tutorial_posts' and policyname='Auth CRUD tutorial') then
    create policy "Auth CRUD tutorial" on public.tutorial_posts
      for all to authenticated
      using (true) with check (true);
  end if;
end $$;

-- Optional: Ensure RLS and admin access for products/categories/vendors
-- Enable RLS (safe if already enabled)
do $$ begin
  begin
    execute 'alter table public.products enable row level security';
  exception when others then null; end;
  begin
    execute 'alter table public.categories enable row level security';
  exception when others then null; end;
  begin
    execute 'alter table public.vendors enable row level security';
  exception when others then null; end;
end $$;

-- Views support: add views_count column to products (if missing)
alter table public.products
  add column if not exists views_count integer not null default 0;

-- Optional detailed views log table
create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  client_fingerprint text,
  ip_addr inet
);
create index if not exists product_views_product_id_idx on public.product_views(product_id);

-- Enable RLS for product_views and allow public insert (to log views), authenticated read
alter table public.product_views enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_views' and policyname='Public insert product_views') then
    create policy "Public insert product_views" on public.product_views
      for insert to anon
      with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_views' and policyname='Auth read product_views') then
    create policy "Auth read product_views" on public.product_views
      for select to authenticated
      using (true);
  end if;
end $$;

-- Authenticated can read and write (broad policy; refine later with roles)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='Auth CRUD products') then
    create policy "Auth CRUD products" on public.products for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Auth CRUD categories') then
    create policy "Auth CRUD categories" on public.categories for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vendors' and policyname='Auth CRUD vendors') then
    create policy "Auth CRUD vendors" on public.vendors for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Store settings table to centralize store information
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text,
  phone text,
  whatsapp text,
  email text,
  address text,
  locality text,
  schedule text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  twitter_url text,
  whatsapp_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure columns exist (if table pre-existed)
alter table public.store_settings
  add column if not exists store_name text,
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists locality text,
  add column if not exists schedule text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists youtube_url text,
  add column if not exists twitter_url text,
  add column if not exists whatsapp_url text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Trigger to maintain updated_at
do $$ begin
  if not exists (
    select 1 from pg_trigger where tgrelid = 'public.store_settings'::regclass and tgname = 'set_updated_at_store_settings'
  ) then
    create trigger set_updated_at_store_settings
    before update on public.store_settings
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Enable RLS and policies for store_settings
alter table public.store_settings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_settings' and policyname='Public read store_settings') then
    create policy "Public read store_settings" on public.store_settings
      for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='store_settings' and policyname='Auth CRUD store_settings') then
    create policy "Auth CRUD store_settings" on public.store_settings
      for all to authenticated using (true) with check (true);
  end if;
end $$;
