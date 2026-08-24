-- Migration: Direct Messaging & Query Performance Optimization Indexes

-- 1. Conversation & Message Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_member1 ON public.conversations(member_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_member2 ON public.conversations(member_two_id);

-- 2. Connections Lookups & Verification Indexes
CREATE INDEX IF NOT EXISTS idx_connections_req_rec_status ON public.connections(requester_id, receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_status ON public.connections(receiver_id, status);

-- 3. Feed & Stories Active Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_posts_active_created ON public.posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stories_unexpired ON public.stories(expires_at, created_at DESC);
