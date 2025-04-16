-- Migration: Create audits table with RLS policies
-- Description: Sets up the audits table with proper constraints, indexes, and row level security
-- Author: AI Assistant
-- Date: 2024-03-20

-- Create the audits table
create table if not exists audits (
    id uuid primary key default gen_random_uuid(),
    audit_order_number varchar(20) not null,
    description text,
    protocol text not null,
    summary text,
    status text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    
    -- Add constraints
    constraint chk_audit_order_number_length check (char_length(audit_order_number) between 2 and 20),
    constraint chk_protocol_length check (char_length(protocol) between 1000 and 10000),
    constraint unique_audit_order_number unique (audit_order_number)
);

-- Create index on user_id for faster lookups
create index if not exists idx_audits_user_id on audits(user_id);

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on audits
    for each row
    execute function handle_updated_at();

-- Enable Row Level Security
alter table audits enable row level security;

-- Create RLS Policies for authenticated users
create policy "authenticated users can view their own audits"
    on audits for select
    to authenticated
    using (auth.uid() = user_id);

create policy "authenticated users can insert their own audits"
    on audits for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "authenticated users can update their own audits"
    on audits for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "authenticated users can delete their own audits"
    on audits for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for anonymous users (no access)
create policy "anon users cannot view audits"
    on audits for select
    to anon
    using (false);

create policy "anon users cannot insert audits"
    on audits for insert
    to anon
    with check (false);

create policy "anon users cannot update audits"
    on audits for update
    to anon
    using (false);

create policy "anon users cannot delete audits"
    on audits for delete
    to anon
    using (false);

-- Add helpful comments
comment on table audits is 'Stores audit records created by users';
comment on column audits.audit_order_number is 'Unique identifier for the audit between 2-20 characters';
comment on column audits.protocol is 'Detailed audit protocol text between 1000-10000 characters';
comment on column audits.user_id is 'Reference to the auth.users table identifying the audit owner'; 