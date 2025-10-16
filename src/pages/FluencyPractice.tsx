import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchPhonicsData, getPassagesBySetNumber, getCumulativePassages, type FluencyPassage } from "@/services/phonicsDataService";
import { toast } from "sonner";

const FluencyPractice = () => {
  const { setNumber } = useParams<{ setNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passages, setPassages] = useState<FluencyPassage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const isCumulative = searchParams.get('cumulative') === 'true';

  useEffect(() => {
    const loadPassages = async () => {
      try {
        const data = await fetchPhonicsData();
        const setNum = parseInt(setNumber || '1', 10);
        
        const relevantPassages = isCumulative
          ? getCumulativePassages(data.fluencyPassages, setNum)
          : getPassagesBySetNumber(data.fluencyPassages, setNum);

        if (relevantPassages.length === 0) {
          toast.error('No passages found for this set');
          navigate('/fluency-sets');
          return;
        }

        setPassages(relevantPassages);
      } catch (error) {
        console.error('Error loading passages:', error);
        toast.error('Failed to load fluency passages');
        navigate('/fluency-sets');
      } finally {
        setLoading(false);
      }
    };

    loadPassages();
  }, [setNumber, isCumulative, navigate]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < passages.length - 1) {
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

  const currentPassage = passages[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 md:px-8 shadow-medium">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/fluency-sets")}
            className="mb-4 text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sets
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-2xl md:text-4xl font-bold">
              {isCumulative ? `Sets 1-${setNumber}` : `Set ${setNumber}`}
            </h1>
          </div>
          <p className="text-center text-base md:text-lg opacity-90">
            Fluency Practice
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Passage Display */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-8 md:p-12">
            <div className="mb-4 text-sm text-muted-foreground text-center">
              Passage {currentIndex + 1} of {passages.length}
              {currentPassage && ` • ${currentPassage.set_id}`}
            </div>
            
            <div className="text-xl md:text-2xl leading-relaxed text-center min-h-[200px] flex items-center justify-center">
              {currentPassage ? (
                <p className="whitespace-pre-wrap">{currentPassage.passage}</p>
              ) : (
                <p className="text-muted-foreground">No passage available</p>
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
            {currentIndex + 1} / {passages.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === passages.length - 1}
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
