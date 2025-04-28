
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCategory } from "@/types";
import { fetchProductCategories } from "@/services/supabaseProducts";

const Catalog = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchProductCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="text-center mb-12">
            {/* Title with decorative line */}
            <div className="flex items-center justify-center mb-12">
              <div className="border-t border-[#3A3C99] w-[100px] flex-grow max-w-[100px] mr-4"></div>
              <h2 className="text-4xl font-bold text-center text-[#3A3C99] whitespace-nowrap">Каталог продукції</h2>
              <div className="border-t border-[#3A3C99] w-[100px] flex-grow max-w-[100px] ml-4"></div>
            </div>             
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[350px] bg-gray-100 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="relative group overflow-hidden">
                    <img 
                      src={category.image || "/placeholder.svg"} 
                      alt={category.name} 
                      className="w-full h-[350px] object-cover"
                    />
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <Link to={`/catalog/${category.id}`} className="inline-block">
                        <div className="bg-white inline-block px-8 py-2 hover:bg-gray-100 transition-colors">
                          <span className="text-[#3A3C99] text-xl">{category.name.toUpperCase()}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Категорії не знайдено
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
