/*
  # Fix security vulnerability: Restrict profiles table access

  1. Security Changes
    - Remove overly permissive public SELECT policy
    - Create secure policy for users to view only their own profile
    - Use IF EXISTS/IF NOT EXISTS to prevent conflicts

  2. Changes Made
    - Drop existing public policy if it exists
    - Drop existing user policy if it exists (to avoid conflicts)
    - Create new secure policy for user profile access
*/

-- Remove the overly permissive public SELECT policy if it exists
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Remove any existing user profile policy to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Optional: Allow authenticated users to view basic public profile info (display_name, avatar_url only)
-- Uncomment the following if you need public profile viewing for features like user mentions, reviews, etc.
-- CREATE POLICY "Public profile info is viewable by authenticated users"
-- ON public.profiles
-- FOR SELECT
-- TO authenticated
-- USING (true);