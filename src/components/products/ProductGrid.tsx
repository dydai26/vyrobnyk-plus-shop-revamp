import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  category?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, category }) => {
  // Filter products by category if a category is provided
  const filteredProducts = category 
    ? products.filter(product => product.categoryId === category)
    : products;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
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
