/*
  # Video Editing Application Schema

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `source_type` (text) - 'upload' or 'youtube'
      - `source_url` (text) - YouTube URL or storage path
      - `duration` (integer) - duration in seconds
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `folders`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)
    
    - `clips`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `folder_id` (uuid, foreign key to folders, nullable)
      - `title` (text)
      - `start_time` (integer) - start time in seconds
      - `end_time` (integer) - end time in seconds
      - `aspect_ratio` (text) - selected aspect ratio
      - `subtitle_enabled` (boolean)
      - `subtitle_settings` (jsonb) - font, design, highlights
      - `text_overlays` (jsonb) - array of text overlay objects
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - No authentication required - public access for all operations
    
  3. Important Notes
    - All users can create, read, update, and delete all records
    - No user ownership tracking since no login is required
    - JSONB fields store flexible configuration data
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('upload', 'youtube')),
  source_url text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  start_time integer NOT NULL DEFAULT 0,
  end_time integer NOT NULL DEFAULT 0,
  aspect_ratio text NOT NULL DEFAULT '16:9',
  subtitle_enabled boolean DEFAULT true,
  subtitle_settings jsonb DEFAULT '{"font": "Arial", "design": "default", "highlights": []}'::jsonb,
  text_overlays jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all videos"
  ON videos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert videos"
  ON videos FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update videos"
  ON videos FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete videos"
  ON videos FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view all folders"
  ON folders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert folders"
  ON folders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update folders"
  ON folders FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete folders"
  ON folders FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view all clips"
  ON clips FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert clips"
  ON clips FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update clips"
  ON clips FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete clips"
  ON clips FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_clips_video_id ON clips(video_id);
CREATE INDEX IF NOT EXISTS idx_clips_folder_id ON clips(folder_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at DESC);