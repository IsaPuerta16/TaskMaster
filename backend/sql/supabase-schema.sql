create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority_enum') then
    create type task_priority_enum as enum ('baja', 'media', 'alta', 'urgente');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status_enum') then
    create type task_status_enum as enum ('pendiente', 'en_proceso', 'finalizada');
  end if;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  full_name text not null,
  first_name text null,
  last_name text null,
  role text not null default 'estudiante',
  created_at timestamptz not null default now()
);

alter table users add column if not exists first_name text null;
alter table users add column if not exists last_name text null;
alter table users add column if not exists role text not null default 'estudiante';

update users
set first_name = split_part(full_name, ' ', 1)
where first_name is null and full_name is not null;

update users
set last_name = nullif(trim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1)), '')
where last_name is null and full_name is not null;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  due_date timestamptz not null,
  priority task_priority_enum not null default 'media',
  status task_status_enum not null default 'pendiente',
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_status on tasks(status);

create table if not exists user_settings (
  user_id uuid primary key references users(id) on delete cascade,
  app_settings jsonb not null default '{}'::jsonb,
  productivity_settings jsonb not null default '{}'::jsonb,
  notification_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_settings add column if not exists app_settings jsonb not null default '{}'::jsonb;
alter table user_settings add column if not exists productivity_settings jsonb not null default '{}'::jsonb;
alter table user_settings add column if not exists notification_settings jsonb not null default '{}'::jsonb;
alter table user_settings add column if not exists created_at timestamptz not null default now();
alter table user_settings add column if not exists updated_at timestamptz not null default now();

create table if not exists calendar_day_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date_key date not null,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date_key)
);

alter table calendar_day_notes add column if not exists user_id uuid;
alter table calendar_day_notes add column if not exists date_key date;
alter table calendar_day_notes add column if not exists notes jsonb not null default '[]'::jsonb;
alter table calendar_day_notes add column if not exists created_at timestamptz not null default now();
alter table calendar_day_notes add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_calendar_day_notes_user_id on calendar_day_notes(user_id);
create index if not exists idx_calendar_day_notes_date_key on calendar_day_notes(date_key);

create table if not exists assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assistant_conversations_user_id on assistant_conversations(user_id);
create index if not exists idx_assistant_conversations_updated_at on assistant_conversations(updated_at);

create table if not exists assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references assistant_conversations(id) on delete cascade,
  role text not null,
  text text not null,
  bullets jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_assistant_messages_conversation_id on assistant_messages(conversation_id);
create index if not exists idx_assistant_messages_created_at on assistant_messages(created_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on tasks;

create trigger tasks_set_updated_at
before update on tasks
for each row
execute function set_updated_at();

drop trigger if exists user_settings_set_updated_at on user_settings;

create trigger user_settings_set_updated_at
before update on user_settings
for each row
execute function set_updated_at();

drop trigger if exists calendar_day_notes_set_updated_at on calendar_day_notes;

create trigger calendar_day_notes_set_updated_at
before update on calendar_day_notes
for each row
execute function set_updated_at();

drop trigger if exists assistant_conversations_set_updated_at on assistant_conversations;

create trigger assistant_conversations_set_updated_at
before update on assistant_conversations
for each row
execute function set_updated_at();
