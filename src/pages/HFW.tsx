import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchPhonicsData, getSetByNumber, getCumulativeSets } from "@/services/phonicsDataService";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const HFW = () => {
  const navigate = useNavigate();
  const { setNumber } = useParams<{ setNumber: string }>();
  const [searchParams] = useSearchParams();
  const practiceMode = searchParams.get("mode") === "single" ? "single" : "cumulative";

  const { data: phonicsData, isLoading } = useQuery({
    queryKey: ["phonics-sets"],
    queryFn: fetchPhonicsData,
  });

  const setNum = parseInt(setNumber || "1", 10);
  
  // Get the appropriate sets based on practice mode
  const setsData = phonicsData
    ? practiceMode === "single" 
      ? [getSetByNumber(phonicsData.phonicsSets, setNum)].filter(Boolean)
      : getCumulativeSets(phonicsData.phonicsSets, setNum)
    : [];

  // Collect all HFWs from the selected set(s)
  const hfws = setsData.flatMap(set => set?.hfw_list || []);
  const currentSetName = setsData.length > 0 ? setsData[setsData.length - 1]?.set_id : '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledHfws, setShuffledHfws] = useState<string[]>([]);

  // Shuffle HFWs when data changes
  useEffect(() => {
    if (hfws.length > 0) {
      setShuffledHfws(shuffleArray(hfws));
      setCurrentIndex(0);
    }
  }, [practiceMode, setNumber, phonicsData]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? shuffledHfws.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === shuffledHfws.length - 1 ? 0 : prev + 1));
  };

  const handleSpeak = () => {
    const currentWord = shuffledHfws[currentIndex];
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!shuffledHfws.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">No High Frequency Words found for this set.</p>
      </div>
    );
  }

  const currentWord = shuffledHfws[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 shadow-medium">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/hfw-sets")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">
              High Frequency Words
            </h1>
            <p className="text-sm md:text-base opacity-90">
              {currentSetName} • {practiceMode === "cumulative" ? "Cumulative" : "Single Set"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Word Display Card */}
          <Card className="mb-8 p-12 md:p-20 border-0 shadow-medium text-center bg-gradient-tile-2">
            <div className="text-6xl md:text-9xl font-bold text-white drop-shadow-lg mb-8">
              {currentWord}
            </div>
            
            {/* Speak Button */}
            <Button
              onClick={handleSpeak}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white text-lg md:text-xl px-8 py-6 rounded-xl shadow-soft"
            >
              🔊 Say the Word
            </Button>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrevious}
              size="lg"
              variant="outline"
              className="flex-1 text-lg md:text-xl py-6 md:py-8 shadow-soft"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Previous
            </Button>

            <div className="text-center px-4">
              <p className="text-lg md:text-xl font-semibold text-foreground">
                {currentIndex + 1} / {shuffledHfws.length}
              </p>
            </div>

            <Button
              onClick={handleNext}
              size="lg"
              variant="outline"
              className="flex-1 text-lg md:text-xl py-6 md:py-8 shadow-soft"
            >
              Next
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HFW;
