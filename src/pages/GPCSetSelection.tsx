import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GPCSetSelection = () => {
  const navigate = useNavigate();

  const { data: sets, isLoading } = useQuery({
    queryKey: ["phonics-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phonics_sets")
        .select("*")
        .order("set_number");
      
      if (error) throw error;
      return data;
    },
  });

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
        {isLoading ? (
          <div className="text-center text-lg text-muted-foreground">
            Loading sets...
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 md:gap-6">
            {sets?.filter((set) => set.set_number <= 10).map((set) => (
              <Card
                key={set.id}
                onClick={() => navigate(`/gpc/${set.set_number}`)}
                className="group cursor-pointer border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in overflow-hidden"
                style={{ animationDelay: `${(set.set_number - 1) * 50}ms` }}
              >
                <div className="bg-gradient-tile-1 p-8 md:p-12 text-center h-full min-h-[140px] md:min-h-[180px] flex flex-col items-center justify-center transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {set.set_name}
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
