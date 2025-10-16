import { supabase } from "@/integrations/supabase/client";

export interface PhonicsSet {
  set_id: string;
  set_number: number;
  gpc_list: string[];
  hfw_list: string[];
  phoneme_audio_base_url: string;
}

/**
 * Fetches phonics data from Google Sheets via edge function
 */
export const fetchPhonicsData = async (): Promise<PhonicsSet[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-phonics-data');
  
  if (error) {
    console.error('Error fetching phonics data:', error);
    throw new Error('Failed to fetch phonics data');
  }
  
  return data.data || [];
};

/**
 * Gets a specific set by set number
 */
export const getSetByNumber = (sets: PhonicsSet[], setNumber: number): PhonicsSet | undefined => {
  return sets.find(set => set.set_number === setNumber);
};

/**
 * Gets all sets up to and including the specified set number (for cumulative mode)
 */
export const getCumulativeSets = (sets: PhonicsSet[], setNumber: number): PhonicsSet[] => {
  return sets
    .filter(set => set.set_number <= setNumber)
    .sort((a, b) => a.set_number - b.set_number);
};
