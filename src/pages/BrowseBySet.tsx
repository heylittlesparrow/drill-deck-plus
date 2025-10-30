import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";
import { fetchPhonicsData, PhonicsSet } from "@/services/phonicsDataService";
import { toast } from "sonner";

const BrowseBySet = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<PhonicsSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const data = await fetchPhonicsData();
        // Only show sets 1-12
        const availableSets = data.phonicsSets.filter(set => set.set_number <= 12);
        setSets(availableSets);
      } catch (error) {
        console.error("Error loading sets:", error);
        toast.error("Failed to load sets");
      } finally {
        setLoading(false);
      }
    };

    loadSets();
  }, []);

  const handleSetSelect = (setNumber: number) => {
    navigate(`/practice-mode-selection/${setNumber}`);
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
      <header className="bg-primary text-primary-foreground py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-6 h-6" />
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Choose a Set
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground text-base md:text-lg">
            Select a set to practice
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sets.map((set) => (
            <Card
              key={set.set_id}
              className="group cursor-pointer hover:shadow-medium transition-all duration-300 animate-scale-in"
              onClick={() => handleSetSelect(set.set_number)}
            >
              <div className="p-6 flex flex-col items-center justify-center min-h-[120px] bg-gradient-tile-1 text-white rounded-[var(--radius)]">
                <h3 className="text-3xl font-bold mb-1">Set {set.set_number}</h3>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowseBySet;
