-- Add phoneme_audio_urls column to phonics_sets table
-- This will store an array of audio file URLs, one for each GPC in the gpc_list
ALTER TABLE phonics_sets 
ADD COLUMN phoneme_audio_urls text[] DEFAULT ARRAY[]::text[];