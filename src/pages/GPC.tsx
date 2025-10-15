import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GPC = () => {
  const navigate = useNavigate();
  const { setNumber } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: setData, isLoading } = useQuery({
    queryKey: ["phonics-set", setNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phonics_sets")
        .select("*")
        .eq("set_number", parseInt(setNumber || "1"))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!setNumber,
  });

  const gpcs = setData?.gpc_list || [];

  useEffect(() => {
    setCurrentIndex(0);
  }, [setNumber]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : gpcs.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < gpcs.length - 1 ? prev + 1 : 0));
  };

  const handleSoundOut = () => {
    if (gpcs.length === 0) return;
    const utterance = new SpeechSynthesisUtterance(gpcs[currentIndex].toLowerCase());
    utterance.rate = 0.7;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading GPCs...</p>
      </div>
    );
  }

  if (!setData || gpcs.length === 0) {
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
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/gpc-sets")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl md:text-4xl font-bold">
            {setData.set_name} - Grapheme-Phoneme Correspondences
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card className="border-0 shadow-medium overflow-hidden">
          <div className="bg-gradient-tile-1 p-8 md:p-16">
            {/* Grapheme Display */}
            <div className="bg-white/95 rounded-3xl p-12 md:p-20 mb-8 text-center shadow-soft">
              <p className="text-9xl md:text-[12rem] font-bold text-foreground tracking-wider">
                {gpcs[currentIndex]}
              </p>
            </div>

            {/* Sound It Out Button */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={handleSoundOut}
                size="lg"
                className="text-xl md:text-2xl h-16 md:h-20 px-8 md:px-12 bg-white text-foreground hover:bg-white/90 shadow-medium"
              >
                <Volume2 className="w-8 h-8 md:w-10 md:h-10 mr-3" />
                Sound It Out
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
                {currentIndex + 1} / {gpcs.length}
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
