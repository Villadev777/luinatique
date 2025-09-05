-- Fix security vulnerability: Restrict profiles table access
-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optional: Allow authenticated users to view basic public profile info (display_name, avatar_url only)
-- Uncomment the following if you need public profile viewing for features like user mentions, reviews, etc.
-- CREATE POLICY "Public profile info is viewable by authenticated users"
-- ON public.profiles
-- FOR SELECT
-- TO authenticated
-- USING (true);