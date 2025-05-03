-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  generation_count INTEGER DEFAULT 0,
  is_subscribed BOOLEAN DEFAULT FALSE
);

-- Create function to increment generation count
CREATE OR REPLACE FUNCTION increment_generation_count()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  UPDATE users
  SET generation_count = generation_count + 1
  WHERE id = auth.uid()
  RETURNING generation_count;
$$; 