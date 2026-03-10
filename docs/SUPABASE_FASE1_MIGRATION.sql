-- Fase 1: tenants, profiles, schools, classes - Rua do Saber
-- Executar no Supabase SQL Editor

create type app_role as enum (
'super_admin','editor','support','manager','teacher','student'
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_branding (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  theme_json jsonb default '{}',
  logo_url text,
  mascot_url text,
  unique(tenant_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role app_role not null default 'student',
  tenant_id uuid references public.tenants(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  grade_level int,
  year int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_schools_tenant_id on public.schools(tenant_id);
create index if not exists idx_classes_school_id on public.classes(school_id);

alter table public.tenants enable row level security;
alter table public.tenant_branding enable row level security;
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.classes enable row level security;

create policy "tenants_select" on public.tenants for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.tenant_id = tenants.id)
  );

create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'super_admin' or (p.tenant_id = profiles.tenant_id and p.role in ('manager', 'editor', 'support')))));
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

create policy "schools_select" on public.schools for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'super_admin' or p.tenant_id = schools.tenant_id)));

create policy "classes_select" on public.classes for select
  using (exists (select 1 from public.profiles p join public.schools s on s.tenant_id = p.tenant_id where p.id = auth.uid() and s.id = classes.school_id) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 'student');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
