import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Volume2, Loader2 } from "lucide-react";
import { fetchPhonicsData } from "@/services/phonicsDataService";
import { toast } from "sonner";

interface PracticeItem {
  type: "gpc" | "decodable" | "hfw";
  content: string;
  audioUrl?: string;
  phonemeAudioUrl?: string;
  graphemeAudioUrl?: string;
}

const CombinedPractice = () => {
  const navigate = useNavigate();
  const { setNumber } = useParams();
  const [searchParams] = useSearchParams();
  const modes = useMemo(() => searchParams.get("modes")?.split(",") || [], [searchParams]);

  const [items, setItems] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const loadPracticeData = async () => {
      try {
        const data = await fetchPhonicsData();
        const set = data.phonicsSets.find(s => s.set_number === Number(setNumber));
        const wordSet = data.practiceWords.find(w => w.set_number === Number(setNumber));

        if (!set) {
          toast.error("Set not found");
          navigate("/browse-by-set");
          return;
        }

        const allItems: PracticeItem[] = [];

        // Add GPCs if selected
        if (modes.includes("gpc") && set.gpc_list) {
          const gpcItems = set.gpc_list.map((gpc, idx) => ({
            type: "gpc" as const,
            content: gpc,
            phonemeAudioUrl: set.phoneme_audio_urls?.[idx],
            graphemeAudioUrl: set.grapheme_audio_urls?.[idx],
          }));
          allItems.push(...shuffleArray(gpcItems));
        }

        // Add Decodables if selected (max 15 cards)
        if (modes.includes("decodables") && wordSet?.words) {
          const decodableItems = wordSet.words.map(word => ({
            type: "decodable" as const,
            content: word,
          }));
          allItems.push(...shuffleArray(decodableItems).slice(0, 15));
        }

        // Add HFWs if selected
        if (modes.includes("hfw") && set.hfw_list) {
          const hfwItems = set.hfw_list.map((word, idx) => ({
            type: "hfw" as const,
            content: word,
            audioUrl: set.hfw_audio_urls?.[idx],
          }));
          allItems.push(...shuffleArray(hfwItems));
        }

        if (allItems.length === 0) {
          toast.error("No practice items found");
          navigate("/browse-by-set");
          return;
        }

        setItems(allItems);
      } catch (error) {
        console.error("Error loading practice data:", error);
        toast.error("Failed to load practice data");
        navigate("/browse-by-set");
      } finally {
        setLoading(false);
      }
    };

    loadPracticeData();
  }, [setNumber, modes, navigate]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
      toast.error("Could not play audio");
    });
  };

  const getCardStyles = (type: PracticeItem["type"]) => {
    switch (type) {
      case "gpc":
        return {
          gradient: "bg-gradient-tile-1",
          label: "GPC",
        };
      case "decodable":
        return {
          gradient: "bg-gradient-tile-3",
          label: "Decodable",
        };
      case "hfw":
        return {
          gradient: "bg-gradient-tile-2",
          label: "HFW",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const cardStyles = getCardStyles(currentItem.type);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/practice-mode-selection/${setNumber}`)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-6 h-6" />
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Set {setNumber} - Combined Practice
          </h1>
          <p className="text-center text-sm md:text-base mt-2 opacity-90">
            {currentIndex + 1} of {items.length}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Card className="mb-8 overflow-hidden border-0 shadow-medium">
          <div className={`${cardStyles.gradient} p-12 md:p-16 relative`}>
            {/* Type Label */}
            <div className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
              {cardStyles.label}
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-6xl md:text-8xl font-bold text-white text-center mb-6">
                {currentItem.content}
              </p>

              {/* Audio Buttons */}
              {currentItem.type === "gpc" && (
                <div className="flex gap-4 mt-6">
                  {currentItem.phonemeAudioUrl && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => playAudio(currentItem.phonemeAudioUrl!)}
                    >
                      <Volume2 className="w-6 h-6 mr-2" />
                      Phoneme
                    </Button>
                  )}
                  {currentItem.graphemeAudioUrl && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => playAudio(currentItem.graphemeAudioUrl!)}
                    >
                      <Volume2 className="w-6 h-6 mr-2" />
                      Grapheme
                    </Button>
                  )}
                </div>
              )}
              {currentItem.type === "hfw" && currentItem.audioUrl && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => playAudio(currentItem.audioUrl!)}
                  className="mt-6"
                >
                  <Volume2 className="w-6 h-6 mr-2" />
                  Play Sound
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === items.length - 1}
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CombinedPractice;
