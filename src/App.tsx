import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import Story from "./pages/Story";
import Journal from "./pages/Journal";
import Sale from "./pages/Sale";
import Lunatique from "./pages/Lunatique";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:categorySlug" element={<Shop />} />
              <Route path="/shop/:categorySlug/:subcategorySlug" element={<Shop />} />
              <Route path="/product/:productSlug" element={<ProductDetail />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/story" element={<Story />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/sale" element={<Sale />} />
              <Route path="/lunatique" element={<Lunatique />} />
              <Route path="/contactanos" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
