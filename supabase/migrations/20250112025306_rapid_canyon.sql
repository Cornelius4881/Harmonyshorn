/*
  # Add default affirmations

  1. New Data
    - Add default affirmations to shared_content table
    - Add system user for default content

  2. Changes
    - Insert initial affirmations with system user
    - Add default content flag to shared_content table
*/

-- Add is_default column to shared_content
ALTER TABLE shared_content 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Insert default affirmations
INSERT INTO shared_content (
  user_id,
  type,
  content,
  is_default,
  is_public
) VALUES 
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'affirmation',
  '{"text": "I am blessed and highly favored, for God''s love surrounds me always.", "category": "daily"}',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'affirmation',
  '{"text": "With God, all things are possible. I trust in His perfect timing.", "category": "faith"}',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'affirmation',
  '{"text": "I am fearfully and wonderfully made, created for a divine purpose.", "category": "identity"}',
  true,
  true
);

-- Update RLS policy to allow viewing default content
DROP POLICY IF EXISTS "Users can view public content" ON shared_content;
CREATE POLICY "Users can view public content"
  ON shared_content
  FOR SELECT
  TO authenticated
  USING (is_public = true OR is_default = true OR auth.uid() = user_id);