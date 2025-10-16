import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKupX7bWfCwPMKoPhJPfr-YuSGxRpkS73P9f_50Vq4FmlNBVJIJbgAvnP1kkCNzIJq024gpHbXLJa0/pub?gid=1477069288&single=true&output=csv";
const PRACTICE_WORDS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKupX7bWfCwPMKoPhJPfr-YuSGxRpkS73P9f_50Vq4FmlNBVJIJbgAvnP1kkCNzIJq024gpHbXLJa0/pub?gid=954382013&single=true&output=csv";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedData: { phonicsSets: PhonicsSet[], practiceWords: PracticeWords[] } | null = null;
let cacheTimestamp = 0;

interface PhonicsSet {
  set_id: string;
  set_number: number;
  gpc_list: string[];
  hfw_list: string[];
  phoneme_audio_urls: string[];
}

interface PracticeWords {
  set_id: string;
  set_number: number;
  words: string[];
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
    const phonemeAudioUrlsRaw = columns[3] || '';
    
    // Extract set number from "Set 1", "Set 2", etc.
    const setNumberMatch = setId.match(/Set (\d+)/);
    if (!setNumberMatch) continue;
    
    const setNumber = parseInt(setNumberMatch[1], 10);
    
    // Parse semicolon-separated lists
    const gpcList = gpcListRaw.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const hfwList = hfwListRaw.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const phonemeAudioUrls = phonemeAudioUrlsRaw.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    sets.push({
      set_id: setId,
      set_number: setNumber,
      gpc_list: gpcList,
      hfw_list: hfwList,
      phoneme_audio_urls: phonemeAudioUrls,
    });
  }
  
  return sets.sort((a, b) => a.set_number - b.set_number);
}

function parsePracticeWordsCSV(csvText: string): PracticeWords[] {
  const lines = csvText.trim().split('\n');
  const wordSets: PracticeWords[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Split by comma, but handle commas within quoted text
    const match = line.match(/^([^,]+),(.+)$/);
    if (!match) continue;
    
    const setId = match[1].trim();
    const wordsText = match[2].trim();
    
    // Extract set number from "Set 1", "Set 2", etc.
    const setNumberMatch = setId.match(/Set (\d+)/);
    if (!setNumberMatch) continue;
    
    const setNumber = parseInt(setNumberMatch[1], 10);
    
    // Split words by comma and clean them up
    const words = wordsText
      .split(',')
      .map(word => word.trim().replace(/^"|"$/g, ''))
      .filter(word => word.length > 0);
    
    wordSets.push({
      set_id: setId,
      set_number: setNumber,
      words: words,
    });
  }
  
  return wordSets.sort((a, b) => a.set_number - b.set_number);
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
    
    // Fetch both CSV files in parallel
    const [phonicsResponse, wordsResponse] = await Promise.all([
      fetch(GOOGLE_SHEET_CSV_URL),
      fetch(PRACTICE_WORDS_CSV_URL)
    ]);
    
    if (!phonicsResponse.ok) {
      throw new Error(`Failed to fetch phonics sheet: ${phonicsResponse.statusText}`);
    }
    if (!wordsResponse.ok) {
      throw new Error(`Failed to fetch practice words sheet: ${wordsResponse.statusText}`);
    }
    
    const [phonicsCSV, wordsCSV] = await Promise.all([
      phonicsResponse.text(),
      wordsResponse.text()
    ]);
    console.log('Both CSVs fetched successfully, parsing...');
    
    // Parse both CSVs into structured data
    const phonicsSets = parseCSV(phonicsCSV);
    const practiceWords = parsePracticeWordsCSV(wordsCSV);
    console.log(`Parsed ${phonicsSets.length} phonics sets and ${practiceWords.length} practice word sets`);
    
    // Update cache
    cachedData = { phonicsSets, practiceWords };
    cacheTimestamp = now;
    console.log('Cache updated');
    
    return new Response(
      JSON.stringify({ data: cachedData }),
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
