import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fetchPhonicsData } from "@/services/phonicsDataService";
import { toast } from "sonner";

const FluencyPracticeSetSelection = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<Array<{ set_id: string; set_number: number; passage_count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [cumulativeMode, setCumulativeMode] = useState(false);

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
    navigate(`/fluency/${setNumber}?cumulative=${cumulativeMode}`);
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
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-2xl md:text-4xl font-bold">Word Practice</h1>
          </div>
          <p className="text-center text-base md:text-lg opacity-90">
            Select a set to practice words
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Cumulative Mode Toggle */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle>Practice Mode</CardTitle>
            <CardDescription>
              Choose whether to practice just one set or all sets up to your selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="cumulative-mode"
                checked={cumulativeMode}
                onCheckedChange={setCumulativeMode}
              />
              <Label htmlFor="cumulative-mode" className="cursor-pointer">
                Cumulative Mode {cumulativeMode ? "(Practice all sets up to selection)" : "(Practice single set only)"}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Sets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sets.map((set) => (
            <Card
              key={set.set_number}
              className="cursor-pointer hover:shadow-medium transition-shadow duration-200 border-2 hover:border-primary"
              onClick={() => handleSetSelect(set.set_number)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {set.set_number}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {set.set_id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {set.passage_count} word{set.passage_count !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FluencyPracticeSetSelection;
