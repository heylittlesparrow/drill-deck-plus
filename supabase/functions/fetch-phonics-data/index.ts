import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKupX7bWfCwPMKoPhJPfr-YuSGxRpkS73P9f_50Vq4FmlNBVJIJbgAvnP1kkCNzIJq024gpHbXLJa0/pub?gid=1477069288&single=true&output=csv";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedData: PhonicsSet[] | null = null;
let cacheTimestamp = 0;

interface PhonicsSet {
  set_id: string;
  set_number: number;
  gpc_list: string[];
  hfw_list: string[];
  phoneme_audio_url: string;
}

function parseCSV(csvText: string): PhonicsSet[] {
  const lines = csvText.trim().split('\n');
  const sets: PhonicsSet[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (handling quoted fields)
    const columns = line.split(',').map(col => col.trim());
    
    const setId = columns[0] || '';
    const gpcListRaw = columns[1] || '';
    const hfwListRaw = columns[2] || '';
    const phonemeAudioUrl = columns[3] || '';
    
    // Extract set number from "Set 1", "Set 2", etc.
    const setNumberMatch = setId.match(/Set (\d+)/);
    if (!setNumberMatch) continue;
    
    const setNumber = parseInt(setNumberMatch[1], 10);
    
    // Parse semicolon-separated lists
    const gpcList = gpcListRaw.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const hfwList = hfwListRaw.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    sets.push({
      set_id: setId,
      set_number: setNumber,
      gpc_list: gpcList,
      hfw_list: hfwList,
      phoneme_audio_url: phonemeAudioUrl,
    });
  }
  
  return sets.sort((a, b) => a.set_number - b.set_number);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
      console.log('Returning cached data');
      return new Response(
        JSON.stringify({ data: cachedData, cached: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    console.log('Cache miss or expired, fetching phonics data from Google Sheets...');
    
    // Fetch CSV from Google Sheets
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV fetched successfully, parsing...');
    
    // Parse CSV into structured data
    const phonicsSets = parseCSV(csvText);
    console.log(`Parsed ${phonicsSets.length} phonics sets`);
    
    // Update cache
    cachedData = phonicsSets;
    cacheTimestamp = now;
    console.log('Cache updated');
    
    return new Response(
      JSON.stringify({ data: phonicsSets }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching phonics data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
