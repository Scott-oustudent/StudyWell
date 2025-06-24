/*
  # Create todos table
  1. New Tables: todos (id uuid, task text, is_complete boolean, created_at timestamp)
  2. Security: Enable RLS, add policies for authenticated users (insert, select, update, delete)
*/

-- Create the todos table if it doesn't exist
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task text NOT NULL,
  is_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security for the todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view their own todos
CREATE POLICY "Authenticated users can view their own todos" ON todos FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to insert todos
CREATE POLICY "Authenticated users can insert todos" ON todos FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to update their own todos
CREATE POLICY "Authenticated users can update their own todos" ON todos FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Policy to allow authenticated users to delete their own todos
CREATE POLICY "Authenticated users can delete their own todos" ON todos FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
