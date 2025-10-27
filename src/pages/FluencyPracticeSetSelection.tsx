import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Loader2, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchPhonicsData } from "@/services/phonicsDataService";
import { toast } from "sonner";

const FluencyPracticeSetSelection = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<Array<{ set_id: string; set_number: number; passage_count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPhonicsData();
        
        // Map practice word sets
        const setsArray = data.practiceWords.map(wordSet => ({
          set_number: wordSet.set_number,
          set_id: wordSet.set_id,
          passage_count: wordSet.words.length
        })).sort((a, b) => a.set_number - b.set_number);

        setSets(setsArray);
      } catch (error) {
        console.error('Error loading practice word data:', error);
        toast.error('Failed to load practice word sets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSetSelect = (setNumber: number) => {
    navigate(`/fluency/${setNumber}?cumulative=false`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 md:px-8 shadow-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4 text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-2xl md:text-4xl font-bold">Choose your Decodable Words Set</h1>
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
        {/* Sets Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {sets.map((set) => (
            <Card
              key={set.set_number}
              onClick={() => handleSetSelect(set.set_number)}
              className="group cursor-pointer border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${(set.set_number - 1) * 50}ms` }}
            >
              <div className="bg-gradient-tile-3 p-8 md:p-12 text-center h-full min-h-[140px] md:min-h-[180px] flex flex-col items-center justify-center transform transition-transform duration-300 group-hover:scale-[1.02]">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Set {set.set_number}
                </h2>
                <p className="text-sm md:text-base text-white/80">
                  {set.passage_count} word{set.passage_count !== 1 ? 's' : ''}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FluencyPracticeSetSelection;
