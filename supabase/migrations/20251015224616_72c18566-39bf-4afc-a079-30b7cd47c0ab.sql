-- Create phonics_sets table to store GPC sets
CREATE TABLE public.phonics_sets (
  id BIGSERIAL PRIMARY KEY,
  set_number INTEGER NOT NULL UNIQUE,
  set_name TEXT NOT NULL,
  gpc_list TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.phonics_sets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read the sets (public data)
CREATE POLICY "Anyone can view phonics sets" 
ON public.phonics_sets 
FOR SELECT 
USING (true);

-- Insert the GPC sets data
INSERT INTO public.phonics_sets (set_number, set_name, gpc_list) VALUES
  (1, 'Set 1', ARRAY['s', 't', 'a', 'p', 'n', 'i']),
  (2, 'Set 2', ARRAY['m', 'd', 'g', 'o', 'c', 'f']),
  (3, 'Set 3', ARRAY['k', 'e', 'r', 'u']),
  (4, 'Set 4', ARRAY['b', 'h', 'l']),
  (5, 'Set 5', ARRAY['j', 'w', 'v']),
  (6, 'Set 6', ARRAY['y', 'z']),
  (7, 'Set 7', ARRAY['x', 'qu']),
  (8, 'Set 8', ARRAY['ck', 'th', 'wh']),
  (9, 'Set 9', ARRAY['ll', 'ss', 'ff', 'zz']),
  (10, 'Set 10', ARRAY['ch', 'sh', 'ng']),
  (11, 'Set 11', ARRAY[]::TEXT[]),
  (12, 'Set 12', ARRAY[]::TEXT[]);