-- =========================================================
-- SHONGJOG
-- 1. Ensure Admin User
-- 2. Clean Test Feed Data
-- 3. Seed Starter Posts for Users
-- =========================================================

-- 1. Create or ensure the admin user in public.users with role 'admin'
UPDATE public.users
SET role = 'admin'
WHERE username = 'admin' OR email = 'admin@shongjog.com';

-- If no admin record exists in public.users, mark the first registered account as admin:
UPDATE public.users
SET role = 'admin'
WHERE id IN (
  SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1
);

-- 2. Clean out old test posts, comments, reactions, and stories
TRUNCATE TABLE public.comments, public.post_reactions CASCADE;
DELETE FROM public.posts;

-- 3. Create exactly 1 starter post for each registered student and alumni user
INSERT INTO public.posts (user_id, content, created_at, updated_at)
SELECT 
    u.id,
    CASE 
        WHEN u.role = 'alumni' THEN 
            'Excited to connect with ambitious students here on Shongjog! Feel free to reach out for career guidance, software engineering insights, and upcoming internship openings.'
        ELSE 
            'Hello Shongjog community! Excited to connect with fellow students and alumni. Currently exploring new projects and looking forward to building my professional network.'
    END AS content,
    now() - (random() * interval '3 days'),
    now()
FROM public.users u
WHERE u.role IN ('student', 'alumni');
