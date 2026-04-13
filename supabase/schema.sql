-- PlanLab initial schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'teacher',
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  level text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  title text not null,
  objective text,
  status text not null default 'draft',
  content jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  lesson_plan_id uuid references public.lesson_plans(id) on delete set null,
  title text not null,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_records (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  unique(activity_id, student_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  title text not null,
  period_start date,
  period_end date,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_groups_owner_id on public.groups(owner_id);
create index if not exists idx_students_group_id on public.students(group_id);
create index if not exists idx_lesson_plans_owner_id on public.lesson_plans(owner_id);
create index if not exists idx_activities_owner_id on public.activities(owner_id);
create index if not exists idx_activity_records_owner_id on public.activity_records(owner_id);
create index if not exists idx_reports_owner_id on public.reports(owner_id);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.activities enable row level security;
alter table public.activity_records enable row level security;
alter table public.reports enable row level security;

create policy "profiles owner" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "groups owner" on public.groups
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "students owner" on public.students
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "lesson_plans owner" on public.lesson_plans
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "activities owner" on public.activities
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "activity_records owner" on public.activity_records
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reports owner" on public.reports
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
