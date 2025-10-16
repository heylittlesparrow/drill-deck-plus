-- Create a public storage bucket for phoneme audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('phoneme-audio', 'phoneme-audio', true);

-- Create policy to allow anyone to read audio files
CREATE POLICY "Public access to phoneme audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'phoneme-audio');

-- Create policy to allow anyone to upload audio files (you can restrict this later if needed)
CREATE POLICY "Allow public uploads to phoneme audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'phoneme-audio');