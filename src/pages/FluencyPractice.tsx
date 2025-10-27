import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchPhonicsData, getWordsBySetNumber, getCumulativeWords } from "@/services/phonicsDataService";
import { toast } from "sonner";

const FluencyPractice = () => {
  const { setNumber } = useParams<{ setNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const isCumulative = searchParams.get('cumulative') === 'true';

  // Shuffle function to randomize array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const loadWords = async () => {
      try {
        const data = await fetchPhonicsData();
        const setNum = parseInt(setNumber || '1', 10);
        
        const relevantWords = isCumulative
          ? getCumulativeWords(data.practiceWords, setNum)
          : getWordsBySetNumber(data.practiceWords, setNum)?.words || [];

        if (relevantWords.length === 0) {
          toast.error('No practice words found for this set');
          navigate('/fluency-sets');
          return;
        }

        // Shuffle the words for random display
        setWords(shuffleArray(relevantWords));
      } catch (error) {
        console.error('Error loading practice words:', error);
        toast.error('Failed to load practice words');
        navigate('/fluency-sets');
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [setNumber, isCumulative, navigate]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 md:px-8 shadow-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/fluency-sets")}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">
                Decodable Words
              </h1>
              <p className="text-sm md:text-base opacity-90 mt-1">
                Set {setNumber} • {isCumulative ? "Cumulative" : "Single Set"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-white/10"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Word Display */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-8 md:p-12">
            <div className="mb-4 text-sm text-muted-foreground text-center">
              Word {currentIndex + 1} of {words.length}
            </div>
            
            <div className="text-4xl md:text-6xl font-bold text-center min-h-[200px] flex items-center justify-center">
              {currentWord ? (
                <p>{currentWord}</p>
              ) : (
                <p className="text-muted-foreground">No word available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="lg"
            variant="outline"
            className="flex-1 max-w-[200px]"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {words.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            size="lg"
            variant="outline"
            className="flex-1 max-w-[200px]"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FluencyPractice;
