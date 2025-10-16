import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchPhonicsData } from "@/services/phonicsDataService";

const GPCSetSelection = () => {
  const navigate = useNavigate();
  const [practiceMode, setPracticeMode] = useState<"cumulative" | "single">("cumulative");

  const { data: phonicsData, isLoading } = useQuery({
    queryKey: ["phonics-sets"],
    queryFn: fetchPhonicsData,
  });

  const sets = phonicsData?.phonicsSets || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground py-6 px-4 shadow-medium">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl md:text-4xl font-bold">
            Choose Your GPC Set
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Practice Mode Selection */}
        <Card className="mb-8 p-6 md:p-8 border-0 shadow-soft">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Practice Mode
          </h2>
          <RadioGroup value={practiceMode} onValueChange={(value) => setPracticeMode(value as "cumulative" | "single")}>
            <div className="flex items-center space-x-3 mb-3">
              <RadioGroupItem value="cumulative" id="cumulative" className="h-5 w-5" />
              <Label htmlFor="cumulative" className="text-base md:text-lg cursor-pointer">
                This and All Earlier Sets (Default)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="single" id="single" className="h-5 w-5" />
              <Label htmlFor="single" className="text-base md:text-lg cursor-pointer">
                Just this Set
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {isLoading ? (
          <div className="text-center text-lg text-muted-foreground">
            Loading sets...
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 md:gap-6">
            {sets.filter((set) => set.set_number <= 10).map((set) => (
              <Card
                key={set.set_id}
                onClick={() => navigate(`/gpc/${set.set_number}?mode=${practiceMode}`)}
                className="group cursor-pointer border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in overflow-hidden"
                style={{ animationDelay: `${(set.set_number - 1) * 50}ms` }}
              >
                <div className="bg-gradient-tile-1 p-8 md:p-12 text-center h-full min-h-[140px] md:min-h-[180px] flex flex-col items-center justify-center transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {set.set_id}
                  </h2>
                  {set.gpc_list && set.gpc_list.length > 0 && (
                    <p className="text-sm md:text-base text-white/80">
                      {set.gpc_list.join(", ")}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GPCSetSelection;
