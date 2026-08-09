-- =========================================================
-- SHONGJOG
-- Initial Database Schema
-- =========================================================

-- =========================================================
-- ENUMS
-- =========================================================

create type public.user_role as enum (
  'student',
  'alumni',
  'admin'
);

create type public.connection_status as enum (
  'pending',
  'accepted',
  'rejected',
  'cancelled'
);

create type public.post_type as enum (
  'general',
  'achievement',
  'project',
  'career'
);

create type public.opportunity_type as enum (
  'internship',
  'job'
);

create type public.opportunity_status as enum (
  'open',
  'closed'
);

create type public.reaction_type as enum (
  'like'
);

create type public.report_status as enum (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);

create type public.restriction_type as enum (
  'warning',
  'restricted',
  'suspended',
  'banned'
);

-- =========================================================
-- USERS
-- Connected to Supabase Auth
-- =========================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,

  role public.user_role not null default 'student',

  full_name varchar(150) not null,
  username varchar(50) unique,
  email varchar(255) not null unique,

  avatar_url text,
  bio text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- UNIVERSITIES
-- =========================================================

create table public.universities (
  id uuid primary key default gen_random_uuid(),

  name varchar(200) not null unique,
  short_name varchar(50),
  location varchar(150),
  website text,

  created_at timestamptz not null default now()
);

-- =========================================================
-- DEPARTMENTS
-- =========================================================

create table public.departments (
  id uuid primary key default gen_random_uuid(),

  university_id uuid not null
    references public.universities(id)
    on delete cascade,

  name varchar(150) not null,
  short_name varchar(50),

  created_at timestamptz not null default now(),

  unique (university_id, name)
);

-- =========================================================
-- STUDENT PROFILES
-- =========================================================

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references public.users(id)
    on delete cascade,

  university_id uuid
    references public.universities(id)
    on delete set null,

  department_id uuid
    references public.departments(id)
    on delete set null,

  student_id varchar(50),

  graduation_year integer,

  internship_available boolean not null default false,
  availability_text text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (university_id, student_id)
);

-- =========================================================
-- ALUMNI PROFILES
-- =========================================================

create table public.alumni_profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references public.users(id)
    on delete cascade,

  university_id uuid
    references public.universities(id)
    on delete set null,

  department_id uuid
    references public.departments(id)
    on delete set null,

  graduation_year integer,

  company_name varchar(200),
  job_title varchar(150),
  professional_field varchar(150),

  experience_years integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- SKILLS
-- =========================================================

create table public.skills (
  id uuid primary key default gen_random_uuid(),

  name varchar(100) not null unique,
  slug varchar(100) not null unique,

  created_at timestamptz not null default now()
);

-- =========================================================
-- USER SKILLS
-- =========================================================

create table public.user_skills (
  user_id uuid not null
    references public.users(id)
    on delete cascade,

  skill_id uuid not null
    references public.skills(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  primary key (user_id, skill_id)
);

-- =========================================================
-- PROJECTS
-- =========================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  title varchar(200) not null,
  description text,

  project_url text,
  image_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- EXPERIENCES
-- =========================================================

create table public.experiences (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  company varchar(200) not null,
  position varchar(150) not null,

  description text,

  start_date date,
  end_date date,

  is_current boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- CONNECTIONS
-- =========================================================

create table public.connections (
  id uuid primary key default gen_random_uuid(),

  requester_id uuid not null
    references public.users(id)
    on delete cascade,

  receiver_id uuid not null
    references public.users(id)
    on delete cascade,

  status public.connection_status not null default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint different_users
    check (requester_id <> receiver_id),

  unique (requester_id, receiver_id)
);

-- =========================================================
-- POSTS
-- =========================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  content text not null,

  post_type public.post_type not null default 'general',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- =========================================================
-- POST MEDIA
-- =========================================================

create table public.post_media (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  media_url text not null,
  media_type varchar(50) not null default 'image',

  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);

-- =========================================================
-- COMMENTS
-- =========================================================

create table public.comments (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- =========================================================
-- POST REACTIONS
-- =========================================================

create table public.post_reactions (
  id uuid primary key default gen_random_uuid(),

  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  reaction_type public.reaction_type not null default 'like',

  created_at timestamptz not null default now(),

  unique (post_id, user_id)
);

-- =========================================================
-- OPPORTUNITIES
-- =========================================================

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),

  posted_by uuid not null
    references public.users(id)
    on delete cascade,

  type public.opportunity_type not null,

  title varchar(200) not null,
  company_name varchar(200) not null,

  description text,

  location varchar(150),
  employment_type varchar(100),

  deadline timestamptz,

  application_url text,

  status public.opportunity_status not null default 'open',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- OPPORTUNITY SKILLS
-- =========================================================

create table public.opportunity_skills (
  opportunity_id uuid not null
    references public.opportunities(id)
    on delete cascade,

  skill_id uuid not null
    references public.skills(id)
    on delete cascade,

  primary key (opportunity_id, skill_id)
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  actor_id uuid
    references public.users(id)
    on delete set null,

  type varchar(50) not null,

  reference_id uuid,

  message text not null,

  is_read boolean not null default false,

  created_at timestamptz not null default now()
);

-- =========================================================
-- REPORTS
-- =========================================================

create table public.reports (
  id uuid primary key default gen_random_uuid(),

  reporter_id uuid not null
    references public.users(id)
    on delete cascade,

  reported_user_id uuid
    references public.users(id)
    on delete cascade,

  post_id uuid
    references public.posts(id)
    on delete cascade,

  comment_id uuid
    references public.comments(id)
    on delete cascade,

  opportunity_id uuid
    references public.opportunities(id)
    on delete cascade,

  reason varchar(150) not null,
  description text,

  status public.report_status not null default 'pending',

  reviewed_by uuid
    references public.users(id)
    on delete set null,

  reviewed_at timestamptz,

  created_at timestamptz not null default now(),

  constraint report_target_exists check (
    reported_user_id is not null
    or post_id is not null
    or comment_id is not null
    or opportunity_id is not null
  )
);

-- =========================================================
-- USER RESTRICTIONS
-- =========================================================

create table public.user_restrictions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  restricted_by uuid not null
    references public.users(id)
    on delete restrict,

  reason text not null,

  restriction_type public.restriction_type not null,

  starts_at timestamptz not null default now(),
  ends_at timestamptz,

  created_at timestamptz not null default now()
);

-- =========================================================
-- ADMIN ACTIVITY LOGS
-- =========================================================

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),

  admin_id uuid not null
    references public.users(id)
    on delete cascade,

  action varchar(100) not null,

  target_type varchar(50),
  target_id uuid,

  description text,

  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================

create index users_role_idx
  on public.users(role);

create index users_username_idx
  on public.users(username);

create index student_profiles_university_idx
  on public.student_profiles(university_id);

create index student_profiles_department_idx
  on public.student_profiles(department_id);

create index alumni_profiles_university_idx
  on public.alumni_profiles(university_id);

create index alumni_profiles_company_idx
  on public.alumni_profiles(company_name);

create index alumni_profiles_field_idx
  on public.alumni_profiles(professional_field);

create index user_skills_skill_idx
  on public.user_skills(skill_id);

create index projects_user_idx
  on public.projects(user_id);

create index experiences_user_idx
  on public.experiences(user_id);

create index connections_requester_idx
  on public.connections(requester_id);

create index connections_receiver_idx
  on public.connections(receiver_id);

create index connections_status_idx
  on public.connections(status);

create index posts_user_idx
  on public.posts(user_id);

create index posts_created_at_idx
  on public.posts(created_at desc);

create index comments_post_idx
  on public.comments(post_id);

create index comments_user_idx
  on public.comments(user_id);

create index post_reactions_post_idx
  on public.post_reactions(post_id);

create index post_reactions_user_idx
  on public.post_reactions(user_id);

create index opportunities_type_idx
  on public.opportunities(type);

create index opportunities_status_idx
  on public.opportunities(status);

create index opportunities_deadline_idx
  on public.opportunities(deadline);

create index opportunities_posted_by_idx
  on public.opportunities(posted_by);

create index notifications_user_idx
  on public.notifications(user_id);

create index notifications_unread_idx
  on public.notifications(user_id, is_read);

create index reports_status_idx
  on public.reports(status);

create index reports_reporter_idx
  on public.reports(reporter_id);

create index restrictions_user_idx
  on public.user_restrictions(user_id);

create index admin_logs_admin_idx
  on public.admin_activity_logs(admin_id);

create index admin_logs_created_at_idx
  on public.admin_activity_logs(created_at desc);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger student_profiles_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

create trigger alumni_profiles_updated_at
before update on public.alumni_profiles
for each row execute function public.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger experiences_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

create trigger connections_updated_at
before update on public.connections
for each row execute function public.set_updated_at();

create trigger posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create trigger opportunities_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();