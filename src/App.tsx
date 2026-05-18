import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Website from "./pages/Website";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import MarketPricePage from "./pages/MarketPricePage";
import VerificationPage from "./pages/VerificationPage";
import PriceComparisonPage from "./pages/PriceComparisonPage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/auth-context";
import { MarketProvider } from "./context/market-context";
import { LanguageProvider } from "./context/language-context";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <LanguageProvider>
      <MarketProvider>
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Website />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/market-prices" element={<MarketPricePage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/price-compare" element={<PriceComparisonPage />} />
              <Route path="/dashboard" element={<FarmerDashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </MarketProvider>
    </LanguageProvider>
  </TooltipProvider>
);
export default App;
