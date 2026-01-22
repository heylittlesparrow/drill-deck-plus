import { useEffect, useState } from "react";
import { BookOpen, Loader2, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { fetchPhonicsData, PhonicsSet } from "@/services/phonicsDataService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [sets, setSets] = useState<PhonicsSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const data = await fetchPhonicsData();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Integrated Header and Hero Section */}
      <div className="relative overflow-hidden">
        {/* Hero Image as Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={heroBanner}
            alt="Educational learning banner with books and stars"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay to blend header with image */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-transparent" />
        </div>

        {/* Header Content */}
        <header className="relative z-10 text-primary-foreground py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg">
                Drill Deck PLUS
              </h1>
            </div>
            <p className="text-center text-lg md:text-xl drop-shadow-md mb-8">
              Connect the Code. Build the Confidence.
            </p>
          </div>
        </header>
      </div>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-[#7A9BB8] border-foreground text-foreground hover:bg-[#6A8BA8]"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                New here?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Welcome to Drill Deck PLUS!</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To access flash cards for each Phonics Set, tap your preferred collection below.
                </p>
                <p>
                  The next screen will prompt you to select practice for GPCs, Decodable Words, and High Frequency Words - choose one or all you please.
                </p>
                <p>
                  Unsure where to start? Tap the 'Set 1-12 Summaries' button at the foot of this page to see a run-down of the content for each step!
                </p>
                <p>
                  Drill Deck PLUS is designed to enable grown-ups assisting their early learners with highly targeted phonics practice.
                </p>
                <p>
                  For instructional guidance, head to our creator's instagram account:{" "}
                  <a 
                    href="https://instagram.com/SharonShares.thecode" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    @SharonShares.thecode
                  </a>
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="text-center mt-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Quick Start
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Choose a set to begin your revision session
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
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
        )}

        {!loading && (
          <div className="mt-8">
            <Button 
              onClick={() => navigate('/set-summaries')}
              className="w-full h-14 text-lg font-semibold"
            >
              Set 1-12 Summaries
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
