import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Truck, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { mockProducts } from "@/services/mockData";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Find the product with the matching ID
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Товар не знайдено</h1>
              <p className="mb-6">Товар з ID {id} не існує або був видалений.</p>
              <Button asChild>
                <Link to="/catalog">Повернутися до каталогу</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Товар додано до кошика",
      description: `${product.name} (${quantity} шт.)`,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/catalog"
              className="text-brand-blue hover:underline flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад до каталогу
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="aspect-square overflow-hidden rounded-md">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-600">Категорія:</span>
                <span className="font-medium">{product.categoryId}</span>
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <span className="text-gray-600">Наявність:</span>
                {product.inStock ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> В наявності
                  </span>
                ) : (
                  <span className="flex items-center text-red-500">
                    <XCircle className="h-4 w-4 mr-1" /> Немає в наявності
                  </span>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="text-3xl font-bold text-brand-blue mb-4">
                  {product.price.toLocaleString()} ₴
                </div>

                <div className="flex space-x-4 mb-4">
                  <div className="w-24">
                    <label htmlFor="quantity" className="block text-sm text-gray-600 mb-1">
                      Кількість
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      className="w-full border rounded-md p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Додати до кошика
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-brand-blue" />
                    <span>Доставка по всій Україні</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                    <span>Відправка протягом 1-2 робочих днів</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
