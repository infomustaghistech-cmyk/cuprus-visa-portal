import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ncaubcsniznalytaxehv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYXViY3NuaXpuYWx5dGF4ZWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzM2NjksImV4cCI6MjEwNTMwOTY2OX0.2VRem2AYuL253yke8PIy-6WJOHvOovESqVpdjTmmX_A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const SQL_SETUP_SCRIPT = `-- Cyprus Visa Portal Complete Database & Storage Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create main table if it doesn't exist
create table if not exists public.visa_applications (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  visa_number text,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  nationality text,
  place_of_birth text,
  passport text not null,
  passport_expiry text,
  dob text,
  gender text default 'male',
  marital_status text,
  address text,
  city text,
  postal_code text,
  country_of_residence text,
  emergency_name text,
  emergency_phone text,
  visa_type text not null default 'Tourist Visa',
  entries text default 'Single',
  duration text default '90 days',
  port_of_entry text default 'Larnaca International Airport',
  arrival text,
  return_date text,
  destination_address text,
  host_name text,
  host_phone text,
  nights text default '7',
  purpose text,
  documents jsonb default '{}'::jsonb,
  submitted_date text,
  decision_date text,
  issue_date text,
  expiry_date text,
  status text not null default 'Pending',
  admin_notes text,
  decision_pdf jsonb default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Add missing columns safely if table already existed previously
alter table public.visa_applications add column if not exists visa_number text;
alter table public.visa_applications add column if not exists place_of_birth text;
alter table public.visa_applications add column if not exists passport_expiry text;
alter table public.visa_applications add column if not exists gender text default 'male';
alter table public.visa_applications add column if not exists marital_status text;
alter table public.visa_applications add column if not exists address text;
alter table public.visa_applications add column if not exists city text;
alter table public.visa_applications add column if not exists postal_code text;
alter table public.visa_applications add column if not exists country_of_residence text;
alter table public.visa_applications add column if not exists emergency_name text;
alter table public.visa_applications add column if not exists emergency_phone text;
alter table public.visa_applications add column if not exists entries text default 'Single';
alter table public.visa_applications add column if not exists duration text default '90 days';
alter table public.visa_applications add column if not exists port_of_entry text default 'Larnaca International Airport';
alter table public.visa_applications add column if not exists return_date text;
alter table public.visa_applications add column if not exists destination_address text;
alter table public.visa_applications add column if not exists host_name text;
alter table public.visa_applications add column if not exists host_phone text;
alter table public.visa_applications add column if not exists documents jsonb default '{}'::jsonb;
alter table public.visa_applications add column if not exists submitted_date text;
alter table public.visa_applications add column if not exists decision_date text;
alter table public.visa_applications add column if not exists issue_date text;
alter table public.visa_applications add column if not exists expiry_date text;
alter table public.visa_applications add column if not exists decision_pdf jsonb default null;

-- 3. Enable Row Level Security (RLS) on visa_applications
alter table public.visa_applications enable row level security;

-- Drop previous policies to avoid conflicts
drop policy if exists "Anyone can read application with reference" on public.visa_applications;
drop policy if exists "Allow public insert application" on public.visa_applications;
drop policy if exists "Allow all operations for anon" on public.visa_applications;
drop policy if exists "Allow all operations" on public.visa_applications;

-- Policy: Allow all operations (Insert, Select, Update, Delete) for portal operations
create policy "Allow all operations"
  on public.visa_applications
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4. Create Indexes for fast lookup
create index if not exists idx_visa_applications_ref on public.visa_applications(reference_number);
create index if not exists idx_visa_applications_email on public.visa_applications(email);
create index if not exists idx_visa_applications_passport on public.visa_applications(passport);
create index if not exists idx_visa_applications_visa_num on public.visa_applications(visa_number);

-- 5. Create Storage Bucket for official PDF decisions and applicant uploaded documents
insert into storage.buckets (id, name, public)
values ('visa-documents', 'visa-documents', true)
on conflict (id) do update set public = true;

-- Storage bucket RLS policies for file upload and download
drop policy if exists "Public Access for visa documents" on storage.objects;
drop policy if exists "Allow public upload visa documents" on storage.objects;
drop policy if exists "Allow public update visa documents" on storage.objects;

create policy "Public Access for visa documents"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'visa-documents');

create policy "Allow public upload visa documents"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'visa-documents');

create policy "Allow public update visa documents"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'visa-documents')
  with check (bucket_id = 'visa-documents');
`
