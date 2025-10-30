import { BookOpen, Waves, Zap, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BrowseByActivity = () => {
  const navigate = useNavigate();
  
  const activities = [
    {
      id: 1,
      title: "GPCs",
      description: "Grapheme-Phoneme Correspondences",
      icon: BookOpen,
      gradient: "bg-gradient-tile-1",
      delay: "0ms",
      path: "/gpc-sets",
    },
    {
      id: 2,
      title: "Decodable Words",
      description: "Blend sounds to read words",
      icon: Waves,
      gradient: "bg-gradient-tile-3",
      delay: "100ms",
      path: "/fluency-sets",
    },
    {
      id: 3,
      title: "High Frequency Words",
      description: "Practise irregular words",
      icon: Zap,
      gradient: "bg-gradient-tile-2",
      delay: "200ms",
      path: "/hfw-sets",
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
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Home className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
            <h1 className="text-3xl md:text-4xl font-bold">Browse by Activity</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Choose Your Activity
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Select a tile below to begin!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="group relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer animate-scale-in"
              style={{ animationDelay: activity.delay }}
              onClick={() => activity.path && navigate(activity.path)}
            >
              <div
                className={`${activity.gradient} p-8 md:p-10 rounded-[var(--radius)] h-full min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center text-center text-white transform transition-transform duration-300 group-hover:scale-[1.02]`}
              >
                <div className="mb-6 p-4 bg-white/20 rounded-full group-hover:animate-bounce-gentle transition-all">
                  <activity.icon className="w-16 h-16 md:w-20 md:h-20" strokeWidth={2} />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-3 drop-shadow-lg">
                  {activity.title}
                </h3>
                
                <p className="text-base md:text-lg opacity-90 drop-shadow">
                  {activity.description}
                </p>

                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-xl" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-xl" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowseByActivity;
