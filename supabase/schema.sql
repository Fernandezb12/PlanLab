-- PlanLab schema: Auth real + multitenancy por docente
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  main_education_level text,
  avatar_url text,
  theme_preference text default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  level text,
  area text,
  period text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  full_name text not null,
  code text,
  status text not null default 'activo',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  title text not null,
  objective text,
  status text not null default 'borrador',
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_plan_id uuid references public.lesson_plans(id) on delete set null,
  title text not null,
  status text not null default 'programada',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(activity_id, student_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  title text not null,
  type text,
  period_start date,
  period_end date,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_groups_profile_id on public.groups(profile_id);
create index if not exists idx_students_profile_id on public.students(profile_id);
create index if not exists idx_students_group_id on public.students(group_id);
create index if not exists idx_lesson_plans_profile_id on public.lesson_plans(profile_id);
create index if not exists idx_activities_profile_id on public.activities(profile_id);
create index if not exists idx_activity_records_profile_id on public.activity_records(profile_id);
create index if not exists idx_reports_profile_id on public.reports(profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists trg_groups_updated_at on public.groups;
create trigger trg_groups_updated_at before update on public.groups for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at before update on public.students for each row execute function public.set_updated_at();

drop trigger if exists trg_lesson_plans_updated_at on public.lesson_plans;
create trigger trg_lesson_plans_updated_at before update on public.lesson_plans for each row execute function public.set_updated_at();

drop trigger if exists trg_activities_updated_at on public.activities;
create trigger trg_activities_updated_at before update on public.activities for each row execute function public.set_updated_at();

drop trigger if exists trg_activity_records_updated_at on public.activity_records;
create trigger trg_activity_records_updated_at before update on public.activity_records for each row execute function public.set_updated_at();

drop trigger if exists trg_reports_updated_at on public.reports;
create trigger trg_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, main_education_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'main_education_level'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        main_education_level = excluded.main_education_level,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.activities enable row level security;
alter table public.activity_records enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles owner" on public.profiles;
create policy "profiles owner" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "groups owner" on public.groups;
create policy "groups owner" on public.groups
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "students owner" on public.students;
create policy "students owner" on public.students
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "lesson_plans owner" on public.lesson_plans;
create policy "lesson_plans owner" on public.lesson_plans
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "activities owner" on public.activities;
create policy "activities owner" on public.activities
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "activity_records owner" on public.activity_records;
create policy "activity_records owner" on public.activity_records
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "reports owner" on public.reports;
create policy "reports owner" on public.reports
for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
