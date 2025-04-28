
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types";
import { fetchProducts, fetchProductsByCategory } from "@/services/supabaseProducts";

interface ProductGridProps {
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let productData: Product[];
        
        if (category) {
          productData = await fetchProductsByCategory(category);
        } else {
          productData = await fetchProducts();
        }
        
        setProducts(productData);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[300px] bg-gray-100 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-gray-500">
          Товари не знайдено
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
