import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GPC from "./pages/GPC";
import GPCSetSelection from "./pages/GPCSetSelection";
import HFW from "./pages/HFW";
import HFWSetSelection from "./pages/HFWSetSelection";
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
          <Route path="/gpc-sets" element={<GPCSetSelection />} />
          <Route path="/gpc/:setNumber" element={<GPC />} />
          <Route path="/hfw-sets" element={<HFWSetSelection />} />
          <Route path="/hfw/:setNumber" element={<HFW />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
