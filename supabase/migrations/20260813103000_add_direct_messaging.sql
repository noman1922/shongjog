-- =========================================================
-- DIRECT MESSAGING
-- =========================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  direct_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null
    references public.conversations(id)
    on delete cascade,

  user_id uuid not null
    references public.users(id)
    on delete cascade,

  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.conversations(id)
    on delete cascade,

  sender_id uuid not null
    references public.users(id)
    on delete cascade,

  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index conversations_updated_at_idx
  on public.conversations(updated_at desc);

create index conversation_members_user_idx
  on public.conversation_members(user_id, conversation_id);

create index conversation_members_conversation_idx
  on public.conversation_members(conversation_id);

create index messages_conversation_created_idx
  on public.messages(conversation_id, created_at desc);

create index messages_sender_idx
  on public.messages(sender_id);

create index messages_unread_idx
  on public.messages(conversation_id, sender_id, created_at desc)
  where deleted_at is null;

create trigger conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create trigger messages_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = target_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

create policy conversations_member_select
on public.conversations
for select
using (public.is_conversation_member(id));

create policy conversation_members_member_select
on public.conversation_members
for select
using (public.is_conversation_member(conversation_id));

create policy conversation_members_own_update
on public.conversation_members
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy messages_member_select
on public.messages
for select
using (public.is_conversation_member(conversation_id));

create policy messages_member_insert
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id)
);

create policy messages_own_update
on public.messages
for update
using (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id)
)
with check (sender_id = auth.uid());

create or replace function public.are_users_connected(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.connections c
    where c.status = 'accepted'
      and (
        (c.requester_id = user_a and c.receiver_id = user_b)
        or (c.requester_id = user_b and c.receiver_id = user_a)
      )
  );
$$;

create or replace function public.start_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  conversation_id uuid;
  direct_conversation_key text;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Choose another Shongjog member.';
  end if;

  if (
    select count(*)
    from public.users u
    where u.id in (current_user_id, other_user_id)
      and u.role in ('student', 'alumni')
  ) <> 2 then
    raise exception 'Messaging is available for completed student and alumni profiles.';
  end if;

  if not public.are_users_connected(current_user_id, other_user_id) then
    raise exception 'You can only message accepted connections.';
  end if;

  direct_conversation_key :=
    least(current_user_id::text, other_user_id::text)
    || ':'
    || greatest(current_user_id::text, other_user_id::text);

  insert into public.conversations (direct_key)
  values (direct_conversation_key)
  on conflict (direct_key) do update
    set updated_at = public.conversations.updated_at
  returning id into conversation_id;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (conversation_id, current_user_id),
    (conversation_id, other_user_id)
  on conflict (conversation_id, user_id) do nothing;

  return conversation_id;
end;
$$;

create or replace function public.touch_conversation_from_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation_from_message();

grant execute on function public.are_users_connected(uuid, uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.start_direct_conversation(uuid) to authenticated;

alter publication supabase_realtime add table public.messages;
