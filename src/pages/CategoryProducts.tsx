
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchProductCategories, fetchProductsByCategory } from "@/services/supabaseProducts";
import { Product, ProductCategory } from "@/types";

const CategoryProducts = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Fetch all categories to get current category details
        const categories = await fetchProductCategories();
        const currentCategory = categories.find(cat => cat.id === categoryId) || null;
        setCategory(currentCategory);
        
        // If category exists, fetch its products
        if (currentCategory && categoryId) {
          const categoryProducts = await fetchProductsByCategory(categoryId);
          setProducts(categoryProducts);
        }
      } catch (error) {
        console.error("Error loading category data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categoryId]);
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="animate-pulse h-8 w-48 bg-gray-200 mb-4"></div>
            <div className="animate-pulse h-12 w-64 bg-gray-300 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-[350px] rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-16 container">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Категорію не знайдено</h1>
            <Link to="/catalog" className="text-blue-600 hover:underline flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Повернутися до каталогу
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <Link to="/catalog" className="text-[#3A3C99] hover:underline flex items-center mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад до каталогу
            </Link>
            <h1 className="text-3xl font-bold text-[#3A3C99]">{category.name}</h1>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 hover:text-[#3A3C99] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                      <span className={`text-sm px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.inStock ? 'В наявності' : 'Немає в наявності'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Товарів у цій категорії не знайдено</h3>
              <p className="text-gray-600 mb-4">
                Наразі немає доступних товарів у цій категорії
              </p>
              <Link
                to="/catalog"
                className="text-[#3A3C99] hover:underline"
              >
                Повернутися до каталогу
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryProducts;
