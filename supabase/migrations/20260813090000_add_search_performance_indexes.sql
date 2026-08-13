create extension if not exists pg_trgm;

create index if not exists users_full_name_trgm_idx
  on public.users using gin (full_name gin_trgm_ops);

create index if not exists users_username_trgm_idx
  on public.users using gin (username gin_trgm_ops);

create index if not exists users_bio_trgm_idx
  on public.users using gin (bio gin_trgm_ops);

create index if not exists skills_name_trgm_idx
  on public.skills using gin (name gin_trgm_ops);

create index if not exists projects_title_trgm_idx
  on public.projects using gin (title gin_trgm_ops);

create index if not exists projects_description_trgm_idx
  on public.projects using gin (description gin_trgm_ops);

create index if not exists experiences_company_trgm_idx
  on public.experiences using gin (company gin_trgm_ops);

create index if not exists experiences_position_trgm_idx
  on public.experiences using gin (position gin_trgm_ops);

create index if not exists alumni_profiles_company_trgm_idx
  on public.alumni_profiles using gin (company_name gin_trgm_ops);

create index if not exists alumni_profiles_job_title_trgm_idx
  on public.alumni_profiles using gin (job_title gin_trgm_ops);

create index if not exists alumni_profiles_professional_field_trgm_idx
  on public.alumni_profiles using gin (professional_field gin_trgm_ops);

create index if not exists opportunities_title_trgm_idx
  on public.opportunities using gin (title gin_trgm_ops);

create index if not exists opportunities_company_trgm_idx
  on public.opportunities using gin (company_name gin_trgm_ops);

