-- Make direct conversation creation fully idempotent for already-deployed schemas.

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

  select id
  into conversation_id
  from public.conversations
  where direct_key = direct_conversation_key;

  if conversation_id is null then
    insert into public.conversations (direct_key)
    values (direct_conversation_key)
    returning id into conversation_id;
  end if;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (conversation_id, current_user_id),
    (conversation_id, other_user_id)
  on conflict (conversation_id, user_id) do nothing;

  return conversation_id;
end;
$$;

grant execute on function public.start_direct_conversation(uuid) to authenticated;
