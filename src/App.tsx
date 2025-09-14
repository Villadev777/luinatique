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
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import Garantia from "./pages/Garantia"; // ← Agregar esta línea
import Anillos from "./pages/categories/Anillos";
import Aretes from "./pages/categories/Aretes";
import Collares from "./pages/categories/Collares";
import Pulseras from "./pages/categories/Pulseras";
import Llaveros from "./pages/categories/Llaveros";
import Prendedores from "./pages/categories/Prendedores";
import Envios from "./pages/Envios";

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
              <Route path="/garantia" element={<Garantia />} /> {/* ← Agregar esta línea */}
              <Route path="/envios" element={<Envios />} />
              
              {/* User Account Pages */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Category Pages */}
              <Route path="/shop/anillos" element={<Anillos />} />
              <Route path="/shop/anillos/:subcategory" element={<Anillos />} />
              <Route path="/shop/aretes" element={<Aretes />} />
              <Route path="/shop/aretes/:subcategory" element={<Aretes />} />
              <Route path="/shop/collares" element={<Collares />} />
              <Route path="/shop/collares/:subcategory" element={<Collares />} />
              <Route path="/shop/pulseras" element={<Pulseras />} />
              <Route path="/shop/pulseras/:subcategory" element={<Pulseras />} />
              <Route path="/shop/llaveros" element={<Llaveros />} />
              <Route path="/shop/llaveros/:subcategory" element={<Llaveros />} />
              <Route path="/shop/prendedores" element={<Prendedores />} />
              <Route path="/shop/prendedores/:subcategory" element={<Prendedores />} />
              
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