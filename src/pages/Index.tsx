import { BookOpen, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
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
      description: "Blend learned sounds to read words",
      icon: Zap,
      gradient: "bg-gradient-tile-2",
      delay: "100ms",
      path: "/fluency-sets",
    },
    {
      id: 3,
      title: "High Frequency Words",
      description: "Practise irregular words",
      icon: Sparkles,
      gradient: "bg-gradient-tile-3",
      delay: "200ms",
      path: "/hfw-sets",
    },
  ];

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
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Choose Your Activity
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Select a tile below to begin!
          </p>
        </div>

        {/* Activity Tiles Grid */}
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

                {/* Decorative corner elements */}
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

export default Index;
