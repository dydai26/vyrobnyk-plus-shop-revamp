
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from "./pages/Index";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import WhereToBuy from "./pages/WhereToBuy";
import Catalog from "./pages/Catalog";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetails from "./pages/ProductDetails";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewsManagement from "./pages/admin/NewsManagement";
import NewsForm from "./pages/admin/NewsForm";
import ProductsManagement from "./pages/admin/ProductsManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import ProductForm from "./pages/admin/ProductForm";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "./components/ui/toaster";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CartProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/where-to-buy" element={<WhereToBuy />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:categoryId" element={<CategoryProducts />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute><NewsManagement /></ProtectedRoute>} />
              <Route path="/admin/news/new" element={<ProtectedRoute><NewsForm /></ProtectedRoute>} />
              <Route path="/admin/news/edit/:id" element={<ProtectedRoute><NewsForm /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><ProductsManagement /></ProtectedRoute>} />
              <Route path="/admin/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/admin/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><CategoriesManagement /></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AdminAuthProvider>
        </CartProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
