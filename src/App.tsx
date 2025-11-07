import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BrowseByActivity from "./pages/BrowseByActivity";
import BrowseBySet from "./pages/BrowseBySet";
import PracticeModeSelection from "./pages/PracticeModeSelection";
import CombinedPractice from "./pages/CombinedPractice";
import GPC from "./pages/GPC";
import GPCSetSelection from "./pages/GPCSetSelection";
import HFW from "./pages/HFW";
import HFWSetSelection from "./pages/HFWSetSelection";
import FluencyPractice from "./pages/FluencyPractice";
import FluencyPracticeSetSelection from "./pages/FluencyPracticeSetSelection";
import SetSummaries from "./pages/SetSummaries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse-by-activity" element={<BrowseByActivity />} />
          <Route path="/browse-by-set" element={<BrowseBySet />} />
          <Route path="/practice-mode-selection/:setNumber" element={<PracticeModeSelection />} />
          <Route path="/combined-practice/:setNumber" element={<CombinedPractice />} />
          <Route path="/gpc-sets" element={<GPCSetSelection />} />
          <Route path="/gpc/:setNumber" element={<GPC />} />
          <Route path="/hfw-sets" element={<HFWSetSelection />} />
          <Route path="/hfw/:setNumber" element={<HFW />} />
          <Route path="/fluency-sets" element={<FluencyPracticeSetSelection />} />
          <Route path="/fluency/:setNumber" element={<FluencyPractice />} />
          <Route path="/set-summaries" element={<SetSummaries />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
