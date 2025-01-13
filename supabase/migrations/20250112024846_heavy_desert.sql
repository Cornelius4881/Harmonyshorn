/*
  # Add subscription features and messaging system

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `scheduled_for` (timestamptz)
      - `type` (text)
      - `sound` (text, nullable)
      - `created_at` (timestamptz)
    
    - `notification_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `sound` (text)
      - `schedule` (jsonb)
      - `type` (text)
      - `created_at` (timestamptz)
    
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `streak` (integer)
      - `points` (integer)
      - `last_activity` (timestamptz)
      - `created_at` (timestamptz)

  2. Changes to existing tables
    - Add `notification_preferences` column to subscriptions table
    - Add `category` column to premium_content table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('affirmation', 'verse', 'devotional')),
  sound text,
  created_at timestamptz DEFAULT now()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  sound text NOT NULL DEFAULT 'default',
  schedule jsonb NOT NULL DEFAULT '{"times": [], "timezone": "UTC"}',
  type text NOT NULL CHECK (type IN ('push', 'sms', 'both')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  streak integer DEFAULT 0,
  points integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add column to premium_content if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'premium_content' AND column_name = 'category'
  ) THEN
    ALTER TABLE premium_content ADD COLUMN category text CHECK (category IN ('template', 'sound', 'theme'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can manage their own messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for notification preferences
CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user stats
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);