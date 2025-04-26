import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { productCategories } from "@/services/mockData";

const Catalog = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 mt-12">
            {productCategories.map((category) => (
              <div key={category.id} className="relative group overflow-hidden ">
                <img 
                  src={category.image} 
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
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
