import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PracticeModeSelection = () => {
  const navigate = useNavigate();
  const { setNumber } = useParams();
  const [selectedModes, setSelectedModes] = useState({
    gpc: false,
    decodables: false,
    hfw: false,
  });

  const toggleMode = (mode: keyof typeof selectedModes) => {
    setSelectedModes(prev => ({
      ...prev,
      [mode]: !prev[mode],
    }));
  };

  const handleStart = () => {
    const hasSelection = Object.values(selectedModes).some(v => v);
    if (!hasSelection) {
      toast.error("Please select at least one practice mode");
      return;
    }

    const modes = Object.entries(selectedModes)
      .filter(([_, selected]) => selected)
      .map(([mode, _]) => mode)
      .join(",");

    navigate(`/combined-practice/${setNumber}?modes=${modes}`);
  };

  const practiceOptions = [
    {
      id: "gpc",
      title: "GPCs",
      description: "Grapheme-Phoneme Correspondences",
      gradient: "bg-gradient-tile-1",
    },
    {
      id: "decodables",
      title: "Decodable Words",
      description: "Blend sounds to read words",
      gradient: "bg-gradient-tile-3",
    },
    {
      id: "hfw",
      title: "High Frequency Words",
      description: "Practise irregular words",
      gradient: "bg-gradient-tile-2",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/browse-by-set")}
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
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Set {setNumber} - Choose Practice Modes
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground text-base md:text-lg">
            Select one or more practice modes
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {practiceOptions.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer hover:shadow-medium transition-all duration-300"
              onClick={() => toggleMode(option.id as keyof typeof selectedModes)}
            >
              <div className="p-6 flex items-center gap-4">
                <Checkbox
                  checked={selectedModes[option.id as keyof typeof selectedModes]}
                  className="w-6 h-6 pointer-events-none"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{option.title}</h3>
                  <p className="text-muted-foreground">{option.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${option.gradient}`} />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleStart}
            className="text-lg px-8"
          >
            Start Practice
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PracticeModeSelection;
