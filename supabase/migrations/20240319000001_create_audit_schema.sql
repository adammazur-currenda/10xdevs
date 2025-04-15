-- Migration file: 20240319000001_create_audit_schema.sql
--
-- Description: Creates the initial schema for the IT Auditor application
-- Tables: audits, generations, generation_error_logs
-- Enums: audit_status
-- Author: AI Assistant
-- Date: 2024-03-19

-- Create audit status enum type
do $$
begin
    if not exists (select 1 from pg_type where typname = 'audit_status') then
        create type audit_status as enum ('new', 'accepted');
    end if;
end$$;

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create audits table
create table if not exists audits (
    id varchar(20) primary key,
    description text not null,
    protocol_text text not null check (char_length(protocol_text) between 1000 and 10000),
    protocol_summary text,
    status audit_status not null default 'new',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade on update cascade
);

-- Enable RLS on audits
alter table audits enable row level security;

-- Create RLS policies for audits
-- Policy for authenticated users to select their own audits
create policy "Users can view their own audits"
    on audits for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own audits
create policy "Users can insert their own audits"
    on audits for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own audits
create policy "Users can update their own audits"
    on audits for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own audits
create policy "Users can delete their own audits"
    on audits for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create trigger for updating updated_at
create trigger trg_update_updated_at
    before update on audits
    for each row
    execute function update_updated_at_column();

-- Create indexes for audits
create index idx_audits_user_id on audits(user_id);
create index idx_audits_created_at on audits(created_at);
create index idx_audits_status on audits(status);

-- Create generations table
create table if not exists generations (
    id serial primary key,
    user_id uuid not null references auth.users(id) on delete cascade on update cascade,
    model varchar(100) not null,
    generated_count integer not null,
    protocol_text text not null,
    generated_result text not null,
    created_at timestamptz not null default now(),
    generation_time timestamptz not null default now()
);

-- Enable RLS on generations
alter table generations enable row level security;

-- Create RLS policies for generations
create policy "Users can view their own generations"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create index for generations
create index idx_generations_user_id on generations(user_id);

-- Create generation error logs table
create table if not exists generation_error_logs (
    id serial primary key,
    user_id uuid not null references auth.users(id) on delete cascade on update cascade,
    model varchar(100) not null,
    protocol_text text not null,
    error_code varchar(50) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Enable RLS on generation error logs
alter table generation_error_logs enable row level security;

-- Create RLS policies for generation error logs
create policy "Users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create index for generation error logs
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Add comments to tables and columns for better documentation
comment on table audits is 'Stores IT audit records with their protocols and summaries';
comment on table generations is 'Stores successful AI generation attempts for audit summaries';
comment on table generation_error_logs is 'Stores failed AI generation attempts with error details'; 