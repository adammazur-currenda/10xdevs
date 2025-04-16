-- Drop all existing RLS policies for audits table

-- Drop authenticated user policies
drop policy if exists "authenticated users can view their own audits" on audits;
drop policy if exists "authenticated users can insert their own audits" on audits;
drop policy if exists "authenticated users can update their own audits" on audits;
drop policy if exists "authenticated users can delete their own audits" on audits;

-- Drop anonymous user policies
drop policy if exists "anon users cannot view audits" on audits;
drop policy if exists "anon users cannot insert audits" on audits;
drop policy if exists "anon users cannot update audits" on audits;
drop policy if exists "anon users cannot delete audits" on audits;

-- Disable RLS on audits table
alter table audits disable row level security; 