import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";

// Pages
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import WhereToBuy from "./pages/WhereToBuy";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewsManagement from "./pages/admin/NewsManagement";
import NewsForm from "./pages/admin/NewsForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:categoryId" element={<CategoryProducts />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/where-to-buy" element={<WhereToBuy />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/news" element={<NewsManagement />} />
              <Route path="/admin/news/new" element={<NewsForm />} />
              <Route path="/admin/news/edit/:id" element={<NewsForm />} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
          <Sonner />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
