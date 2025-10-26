import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPhonicsData, getCumulativeSets, getSetByNumber } from "@/services/phonicsDataService";

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const GPC = () => {
  const navigate = useNavigate();
  const { setNumber } = useParams();
  const [searchParams] = useSearchParams();
  const practiceMode = searchParams.get("mode") || "cumulative";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledGpcs, setShuffledGpcs] = useState<string[]>([]);
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [gpcToPhonemeUrl, setGpcToPhonemeUrl] = useState<Map<string, string>>(new Map());

  const { data: setsData, isLoading } = useQuery({
    queryKey: ["phonics-sets-for-practice", setNumber, practiceMode],
    queryFn: async () => {
      const selectedSet = parseInt(setNumber || "1");
      const data = await fetchPhonicsData();
      
      if (practiceMode === "single") {
        // Load only the selected set
        const set = getSetByNumber(data.phonicsSets, selectedSet);
        return set ? [set] : [];
      } else {
        // Load the selected set and all earlier sets
        return getCumulativeSets(data.phonicsSets, selectedSet);
      }
    },
    enabled: !!setNumber,
  });

  // Combine GPCs from all loaded sets and create mapping to phoneme URLs
  const gpcs = setsData?.flatMap(set => set.gpc_list) || [];
  const currentSetName = setsData?.find(s => s.set_number === parseInt(setNumber || "1"))?.set_id || "";

  // Create mapping between GPCs and their phoneme audio URLs from the Google Sheet
  useEffect(() => {
    if (!setsData || setsData.length === 0) return;
    
    const mapping = new Map<string, string>();
    setsData.forEach(set => {
      set.gpc_list.forEach((gpc, index) => {
        if (set.phoneme_audio_urls && set.phoneme_audio_urls[index]) {
          mapping.set(gpc, set.phoneme_audio_urls[index]);
        }
      });
    });
    
    setGpcToPhonemeUrl(mapping);
  }, [setsData]);

  useEffect(() => {
    if (gpcs.length > 0) {
      setShuffledGpcs(shuffleArray(gpcs));
      setCurrentIndex(0);
    }
  }, [setNumber, practiceMode, gpcs.length]);

  // Preload all audio files for the current set
  useEffect(() => {
    if (shuffledGpcs.length === 0 || gpcToPhonemeUrl.size === 0) return;

    const cache = new Map<string, HTMLAudioElement>();
    
    shuffledGpcs.forEach((gpc) => {
      let normalizedGpc = gpc.toLowerCase();
      if (normalizedGpc === 'th*') normalizedGpc = 'th-';
      
      // Preload phoneme audio from external CDN URL
      const phonemeUrl = gpcToPhonemeUrl.get(gpc);
      if (phonemeUrl) {
        const phonemeAudio = new Audio(phonemeUrl);
        phonemeAudio.preload = 'auto';
        cache.set(`phoneme-${normalizedGpc}`, phonemeAudio);
      }
      
      // Preload grapheme audio from local files
      const graphemeMp3 = new Audio(`/grapheme-audio/${normalizedGpc}.mp3`);
      const graphemeM4a = new Audio(`/grapheme-audio/${normalizedGpc}.m4a`);
      graphemeMp3.preload = 'auto';
      graphemeM4a.preload = 'auto';
      cache.set(`grapheme-${normalizedGpc}`, graphemeMp3);
      cache.set(`grapheme-${normalizedGpc}-m4a`, graphemeM4a);
    });
    
    setAudioCache(cache);
  }, [shuffledGpcs, gpcToPhonemeUrl]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : shuffledGpcs.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < shuffledGpcs.length - 1 ? prev + 1 : 0));
  };

  const handlePhoneme = () => {
    if (shuffledGpcs.length === 0) return;
    
    let currentGpc = shuffledGpcs[currentIndex].toLowerCase();
    if (currentGpc === 'th*') currentGpc = 'th-';
    
    // Use preloaded audio from cache (using external CDN URL)
    const audio = audioCache.get(`phoneme-${currentGpc}`);
    if (audio) {
      audio.currentTime = 0; // Reset to start
      audio.play().catch(err => console.error("Error playing phoneme audio:", err));
    }
  };

  const handleGrapheme = () => {
    if (shuffledGpcs.length === 0) return;
    
    let currentGpc = shuffledGpcs[currentIndex].toLowerCase();
    if (currentGpc === 'th*') currentGpc = 'th-';
    
    // Use preloaded audio from cache
    const audio = audioCache.get(`grapheme-${currentGpc}`);
    if (audio) {
      audio.currentTime = 0; // Reset to start
      audio.play().catch(() => {
        // If mp3 fails, try m4a format
        const audioM4a = audioCache.get(`grapheme-${currentGpc}-m4a`);
        if (audioM4a) {
          audioM4a.currentTime = 0;
          audioM4a.play().catch(err => console.error("Error playing grapheme audio:", err));
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading GPCs...</p>
      </div>
    );
  }

  if (!setsData || shuffledGpcs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-header text-primary-foreground py-6 px-4 shadow-medium">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/gpc-sets")}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold">GPCs</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-muted-foreground">No GPCs found for this set.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 shadow-medium">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/gpc-sets")}
              className="text-primary-foreground hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold">
              {currentSetName} - Grapheme-Phoneme Correspondences
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card className="border-0 shadow-medium overflow-hidden">
          <div className="bg-gradient-tile-1 p-8 md:p-16">
            {/* Grapheme Display */}
            <div className="bg-white/95 rounded-3xl p-12 md:p-20 mb-8 text-center shadow-soft">
              <p className="text-9xl md:text-[12rem] font-bold text-foreground tracking-wider">
                {shuffledGpcs[currentIndex]}
              </p>
            </div>

            {/* Phoneme and Grapheme Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                onClick={handlePhoneme}
                size="lg"
                className="text-xl md:text-2xl h-16 md:h-20 px-8 md:px-12 bg-white text-foreground hover:bg-white/90 shadow-medium"
              >
                📞Phoneme👂
              </Button>
              <Button
                onClick={handleGrapheme}
                size="lg"
                className="text-xl md:text-2xl h-16 md:h-20 px-8 md:px-12 bg-white text-foreground hover:bg-white/90 shadow-medium"
              >
                📊Grapheme✍️
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handlePrevious}
                size="lg"
                className="h-14 md:h-16 px-6 md:px-8 bg-white/90 text-foreground hover:bg-white shadow-soft"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                <span className="text-lg md:text-xl font-semibold">Previous</span>
              </Button>

              <div className="text-white text-lg md:text-xl font-bold bg-white/20 px-6 py-3 rounded-full">
                {currentIndex + 1} / {shuffledGpcs.length}
              </div>

              <Button
                onClick={handleNext}
                size="lg"
                className="h-14 md:h-16 px-6 md:px-8 bg-white/90 text-foreground hover:bg-white shadow-soft"
              >
                <span className="text-lg md:text-xl font-semibold">Next</span>
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default GPC;
