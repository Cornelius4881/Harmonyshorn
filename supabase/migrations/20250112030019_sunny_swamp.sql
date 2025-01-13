/*
  # Fix Default Affirmations

  1. Changes
    - Create system user if not exists
    - Insert default affirmations with proper user reference
    - Update RLS policies to allow viewing default content

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for default content
*/

-- First ensure the system user exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000'
  ) THEN
    -- Create the system user if it doesn't exist
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      instance_id
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'system@harmonyshorn.app',
      '',
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      '00000000-0000-0000-0000-000000000000'
    );
  END IF;
END $$;

-- Insert default affirmations if they don't exist
INSERT INTO shared_content (
  id,
  user_id,
  type,
  content,
  is_default,
  is_public,
  created_at
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'affirmation',
  content,
  true,
  true,
  NOW()
FROM (
  VALUES 
    ('{"text": "I am blessed and highly favored, for God''s love surrounds me always.", "category": "daily"}'::jsonb),
    ('{"text": "With God, all things are possible. I trust in His perfect timing.", "category": "faith"}'::jsonb),
    ('{"text": "I am fearfully and wonderfully made, created for a divine purpose.", "category": "identity"}'::jsonb),
    ('{"text": "God''s grace is sufficient for me, His power is made perfect in weakness.", "category": "strength"}'::jsonb),
    ('{"text": "I can do all things through Christ who strengthens me.", "category": "motivation"}'::jsonb)
) AS default_content(content)
WHERE NOT EXISTS (
  SELECT 1 FROM shared_content WHERE is_default = true AND type = 'affirmation'
);

-- Ensure RLS policies are correctly set
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can view public and default content" ON shared_content;
  
  -- Create new policy
  CREATE POLICY "Users can view public and default content"
    ON shared_content
    FOR SELECT
    TO authenticated
    USING (is_public = true OR is_default = true OR auth.uid() = user_id);
END $$;