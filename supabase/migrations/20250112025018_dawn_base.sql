/*
  # Add community and collaboration features

  1. New Tables
    - `shared_content`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - affirmation, card, gif
      - `content` (jsonb)
      - `likes` (integer)
      - `created_at` (timestamptz)
      - `is_public` (boolean)

    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content_id` (uuid, references shared_content)
      - `text` (text)
      - `created_at` (timestamptz)

    - `collaborative_cards`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)

    - `card_collaborators`
      - `card_id` (uuid, references collaborative_cards)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamptz)

    - `donations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (integer)
      - `cause` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for content sharing and collaboration
*/

-- Shared content table
CREATE TABLE IF NOT EXISTS shared_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('affirmation', 'card', 'gif')),
  content jsonb NOT NULL,
  likes integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_id uuid REFERENCES shared_content ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Collaborative cards table
CREATE TABLE IF NOT EXISTS collaborative_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Card collaborators table
CREATE TABLE IF NOT EXISTS card_collaborators (
  card_id uuid REFERENCES collaborative_cards ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  role text NOT NULL CHECK (role IN ('editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (card_id, user_id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  cause text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policies for shared content
CREATE POLICY "Users can view public content"
  ON shared_content
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own content"
  ON shared_content
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Users can view comments on accessible content"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_content
      WHERE id = content_id
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for collaborative cards
CREATE POLICY "Users can view cards they have access to"
  ON collaborative_cards
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM card_collaborators
      WHERE card_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own cards"
  ON collaborative_cards
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Policies for card collaborators
CREATE POLICY "Card creators can manage collaborators"
  ON card_collaborators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborative_cards
      WHERE id = card_id AND creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborative_cards
      WHERE id = card_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view their assignments"
  ON card_collaborators
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for donations
CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());