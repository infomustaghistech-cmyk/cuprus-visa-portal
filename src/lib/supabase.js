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

export const SQL_SETUP_SCRIPT = `-- Cyprus Visa Portal Database Setup
-- Run this in your Supabase SQL Editor if the table is not yet created

create table if not exists public.visa_applications (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  nationality text,
  passport text not null,
  dob text,
  visa_type text not null default 'tourist',
  arrival text,
  nights text default '7',
  purpose text,
  status text not null default 'Pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.visa_applications enable row level security;

-- Drop previous policies if re-running
drop policy if exists "Anyone can read application with reference" on public.visa_applications;
drop policy if exists "Allow public insert application" on public.visa_applications;
drop policy if exists "Allow all operations for anon" on public.visa_applications;

-- Policy: Allow all operations for public portal demo
create policy "Allow all operations for anon"
  on public.visa_applications
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Index for speedy reference lookups
create index if not exists idx_visa_applications_ref on public.visa_applications(reference_number);
create index if not exists idx_visa_applications_email on public.visa_applications(email);
create index if not exists idx_visa_applications_passport on public.visa_applications(passport);
`
