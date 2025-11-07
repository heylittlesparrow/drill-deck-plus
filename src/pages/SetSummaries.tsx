import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SetSummary {
  setNumber: number;
  gpcs: string;
  hfw: string;
  skills: string;
}

const setSummaries: SetSummary[] = [
  {
    setNumber: 1,
    gpcs: "s, t, a, p, n, i",
    hfw: "and, for, the",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 2,
    gpcs: "m, d, g, o, c, f",
    hfw: "is, of, a",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 3,
    gpcs: "k, e, r, u",
    hfw: "I, my, are, was",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 4,
    gpcs: "b, h, l",
    hfw: "all, too, said, says",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 5,
    gpcs: "j, w, v",
    hfw: "she, he, we, me, with, what, you, your",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 6,
    gpcs: "y, z",
    hfw: "they, her, his, that, there, this",
    skills: "blending to read, segmenting to spell"
  },
  {
    setNumber: 7,
    gpcs: "x, qu",
    hfw: "out, come, some, love",
    skills: "q is always followed by u, spell 'qu' for /kw/"
  },
  {
    setNumber: 8,
    gpcs: "ck, th/th, wh",
    hfw: "I'm, have, be, like, were, so, go, no",
    skills: "consonant digraphs (two letters making one sound), 'ck' comes after a short vowel /a/ /e/ /i/ /o/ /u/"
  },
  {
    setNumber: 9,
    gpcs: "ll, ff, ss, zz",
    hfw: "little, down, does, one, here",
    skills: "consonant digraphs (two letters making one sound), 'll' for /l/, 'ff' for /f/, 'ss' for /s/ and 'zz' for /z/ after a short vowel"
  },
  {
    setNumber: 10,
    gpcs: "ch, sh, ng",
    hfw: "it's, see, very, look, don't, because, children",
    skills: "consonant digraphs (two letters making one sound)"
  },
  {
    setNumber: 11,
    gpcs: "Revise all GPCs from Sets 1-10",
    hfw: "into, now, came, oh, about, their, these",
    skills: "consonant clusters (blends)"
  },
  {
    setNumber: 12,
    gpcs: "Revise all GPCs from Sets 1-10",
    hfw: "people, put, could, house, to, by, day",
    skills: "consonant clusters (blends)"
  }
];

const SetSummaries = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Set 1-12 Summaries
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {setSummaries.map((summary) => (
            <Card
              key={summary.setNumber}
              className="p-6 hover:shadow-medium transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">
                Set {summary.setNumber}
              </h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">GPCs:</h3>
                  <p className="text-muted-foreground">{summary.gpcs}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-1">HFW:</h3>
                  <p className="text-muted-foreground">{summary.hfw}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Skills:</h3>
                  <p className="text-muted-foreground">{summary.skills}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SetSummaries;
