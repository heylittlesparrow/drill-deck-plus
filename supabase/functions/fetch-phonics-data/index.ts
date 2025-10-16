import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKupX7bWfCwPMKoPhJPfr-YuSGxRpkS73P9f_50Vq4FmlNBVJIJbgAvnP1kkCNzIJq024gpHbXLJa0/pub?gid=1477069288&single=true&output=csv";
const FLUENCY_PRACTICE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKupX7bWfCwPMKoPhJPfr-YuSGxRpkS73P9f_50Vq4FmlNBVJIJbgAvnP1kkCNzIJq024gpHbXLJa0/pub?gid=954382013&single=true&output=csv";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedData: { phonicsSets: PhonicsSet[], fluencyPassages: FluencyPassage[] } | null = null;
let cacheTimestamp = 0;

interface PhonicsSet {
  set_id: string;
  set_number: number;
  gpc_list: string[];
  hfw_list: string[];
  phoneme_audio_url: string;
}

interface FluencyPassage {
  set_id: string;
  set_number: number;
  passage: string;
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

function parseFluencyCSV(csvText: string): FluencyPassage[] {
  const lines = csvText.trim().split('\n');
  const passages: FluencyPassage[] = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Split by comma, but handle commas within quoted text
    const match = line.match(/^([^,]+),(.+)$/);
    if (!match) continue;
    
    const setId = match[1].trim();
    const passageText = match[2].trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if present
    
    // Extract set number from "Set 1", "Set 2", etc.
    const setNumberMatch = setId.match(/Set (\d+)/);
    if (!setNumberMatch) continue;
    
    const setNumber = parseInt(setNumberMatch[1], 10);
    
    // Split passages by comma, but preserve commas within quotes
    const individualPassages: string[] = [];
    let currentPassage = '';
    let insideQuotes = false;
    
    for (let j = 0; j < passageText.length; j++) {
      const char = passageText[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentPassage += char;
      } else if (char === ',' && !insideQuotes) {
        // This comma is a separator between passages
        if (currentPassage.trim()) {
          individualPassages.push(currentPassage.trim());
        }
        currentPassage = '';
      } else {
        currentPassage += char;
      }
    }
    
    // Add the last passage
    if (currentPassage.trim()) {
      individualPassages.push(currentPassage.trim());
    }
    
    // Create a FluencyPassage for each individual passage
    individualPassages.forEach(passage => {
      passages.push({
        set_id: setId,
        set_number: setNumber,
        passage: passage,
      });
    });
  }
  
  return passages.sort((a, b) => a.set_number - b.set_number);
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
    const [phonicsResponse, fluencyResponse] = await Promise.all([
      fetch(GOOGLE_SHEET_CSV_URL),
      fetch(FLUENCY_PRACTICE_CSV_URL)
    ]);
    
    if (!phonicsResponse.ok) {
      throw new Error(`Failed to fetch phonics sheet: ${phonicsResponse.statusText}`);
    }
    if (!fluencyResponse.ok) {
      throw new Error(`Failed to fetch fluency practice sheet: ${fluencyResponse.statusText}`);
    }
    
    const [phonicsCSV, fluencyCSV] = await Promise.all([
      phonicsResponse.text(),
      fluencyResponse.text()
    ]);
    console.log('Both CSVs fetched successfully, parsing...');
    
    // Parse both CSVs into structured data
    const phonicsSets = parseCSV(phonicsCSV);
    const fluencyPassages = parseFluencyCSV(fluencyCSV);
    console.log(`Parsed ${phonicsSets.length} phonics sets and ${fluencyPassages.length} fluency passages`);
    
    // Update cache
    cachedData = { phonicsSets, fluencyPassages };
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
