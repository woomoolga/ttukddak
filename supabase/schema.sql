-- ============================================================
-- ttukddak Supabase Schema
-- ISS-046: 테이블 설계
-- ============================================================

-- 1. businesses (사업자 정보 캐시)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  business_number text not null unique,        -- 사업자등록번호 (10자리, 하이픈 제외)
  business_type text,                          -- 개인 / 법인 / 간이
  industry_code text,                          -- 업종코드
  industry_name text,                          -- 업종명
  region text,                                 -- 지역 (시/도 단위)
  status text default '영업중',                 -- 영업중 / 휴업 / 폐업
  raw_response jsonb,                          -- API 원본 JSON
  cached_at timestamptz default now(),         -- 캐시 시점
  created_at timestamptz default now()
);

-- 2. benefits (혜택 데이터)
create table if not exists public.benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  organization text,                           -- 주관기관
  amount text,                                 -- 지원금액 (텍스트: "최대 3,000만원" 등)
  target_types text[] default '{}',            -- 대상 사업자 유형 배열
  target_industries text[] default '{}',       -- 대상 업종 배열
  target_regions text[] default '{}',          -- 대상 지역 배열
  requirements text,                           -- 자격 요건
  deadline timestamptz,                        -- 신청 마감일
  apply_url text,                              -- 신청 URL
  apply_method text,                           -- 신청 방법
  source text not null,                        -- 데이터 출처: bizinfo / data.go.kr / 지자체
  source_id text,                              -- 출처별 고유 ID
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. profiles (회원 프로필, Supabase Auth 확장)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  business_number text,
  notification_enabled boolean default true,
  created_at timestamptz default now()
);

-- 4. saved_benefits (회원 저장 혜택)
create table if not exists public.saved_benefits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  benefit_id uuid not null references public.benefits(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, benefit_id)                  -- 중복 저장 방지
);

-- 5. email_submissions (이메일 전송 기록)
create table if not exists public.email_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  business_number text not null,
  benefits_count integer default 0,
  marketing_consent boolean default false,     -- 마케팅 수신 동의
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- 인덱스
-- ============================================================

create index if not exists idx_businesses_number on public.businesses(business_number);
create index if not exists idx_benefits_source on public.benefits(source, source_id);
create index if not exists idx_benefits_active on public.benefits(is_active) where is_active = true;
create index if not exists idx_benefits_deadline on public.benefits(deadline) where deadline is not null;
create index if not exists idx_saved_benefits_user on public.saved_benefits(user_id);
create index if not exists idx_email_submissions_email on public.email_submissions(email);

-- GIN 인덱스 (배열 검색용)
create index if not exists idx_benefits_target_types on public.benefits using gin(target_types);
create index if not exists idx_benefits_target_industries on public.benefits using gin(target_industries);
create index if not exists idx_benefits_target_regions on public.benefits using gin(target_regions);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.businesses enable row level security;
alter table public.benefits enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_benefits enable row level security;
alter table public.email_submissions enable row level security;

-- businesses: 누구나 조회 가능, 삽입/수정은 서비스 역할만
create policy "businesses_select_all" on public.businesses
  for select using (true);

create policy "businesses_insert_service" on public.businesses
  for insert with check (auth.role() = 'service_role');

create policy "businesses_update_service" on public.businesses
  for update using (auth.role() = 'service_role');

-- benefits: 누구나 조회 가능 (활성 혜택만), 관리는 서비스 역할만
create policy "benefits_select_active" on public.benefits
  for select using (is_active = true);

create policy "benefits_insert_service" on public.benefits
  for insert with check (auth.role() = 'service_role');

create policy "benefits_update_service" on public.benefits
  for update using (auth.role() = 'service_role');

create policy "benefits_delete_service" on public.benefits
  for delete using (auth.role() = 'service_role');

-- profiles: 본인 데이터만 조회/수정
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- saved_benefits: 본인 저장 혜택만
create policy "saved_benefits_select_own" on public.saved_benefits
  for select using (auth.uid() = user_id);

create policy "saved_benefits_insert_own" on public.saved_benefits
  for insert with check (auth.uid() = user_id);

create policy "saved_benefits_delete_own" on public.saved_benefits
  for delete using (auth.uid() = user_id);

-- email_submissions: 서비스 역할만 삽입/조회
create policy "email_submissions_insert_service" on public.email_submissions
  for insert with check (true);  -- 비회원도 이메일 제출 가능

create policy "email_submissions_select_service" on public.email_submissions
  for select using (auth.role() = 'service_role');

-- ============================================================
-- 트리거: updated_at 자동 갱신
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger benefits_updated_at
  before update on public.benefits
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 트리거: 신규 가입 시 profiles 자동 생성
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
