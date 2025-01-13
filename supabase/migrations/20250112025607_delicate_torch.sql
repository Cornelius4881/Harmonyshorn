/*
  # Fix database schema and add missing tables

  1. Changes
    - Add missing tables if they don't exist
    - Add missing columns to existing tables
    - Update RLS policies
*/

-- Create shared_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS shared_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('affirmation', 'card', 'gif')),
  content jsonb NOT NULL,
  likes integer DEFAULT 0,
  is_public boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on shared_content if not already enabled
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view public content" ON shared_content;
DROP POLICY IF EXISTS "Users can manage their own content" ON shared_content;

-- Create updated policies
CREATE POLICY "Users can view public content"
  ON shared_content
  FOR SELECT
  TO authenticated
  USING (is_public = true OR is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own content"
  ON shared_content
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);