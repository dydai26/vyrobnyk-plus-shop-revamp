
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Truck, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { fetchProductById } from "@/services/supabaseProducts";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const productData = await fetchProductById(id);
        setProduct(productData);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="animate-pulse h-4 w-32 bg-gray-200 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="animate-pulse bg-gray-100 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="animate-pulse h-8 w-3/4 bg-gray-200"></div>
                <div className="animate-pulse h-4 w-full bg-gray-100"></div>
                <div className="animate-pulse h-4 w-full bg-gray-100"></div>
                <div className="animate-pulse h-4 w-1/2 bg-gray-100"></div>
                <div className="animate-pulse h-16 w-full bg-gray-200 mt-8"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              
              {/* Product Details */}
              {product.details && (
                <div className="bg-white p-4 border rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {product.details.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Вага:</span>
                        <span>{product.details.weight}</span>
                      </div>
                    )}
                    {product.details.expirationDays && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Термін придатності:</span>
                        <span>{product.details.expirationDays} днів</span>
                      </div>
                    )}
                    {product.details.calories !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Калорійність:</span>
                        <span>{product.details.calories} ккал/100г</span>
                      </div>
                    )}
                    {product.details.packaging && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Упакування:</span>
                        <span>{product.details.packaging}</span>
                      </div>
                    )}
                    {product.details.proteins !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Білки:</span>
                        <span>{product.details.proteins} г/100г</span>
                      </div>
                    )}
                    {product.details.fats !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Жири:</span>
                        <span>{product.details.fats} г/100г</span>
                      </div>
                    )}
                    {product.details.carbs !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Вуглеводи:</span>
                        <span>{product.details.carbs} г/100г</span>
                      </div>
                    )}
                    {product.details.piecesInPackage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Кількість в упаковці:</span>
                        <span>{product.details.piecesInPackage} шт</span>
                      </div>
                    )}
                    {product.details.manufacturer && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Виробник:</span>
                        <span>{product.details.manufacturer}</span>
                      </div>
                    )}
                    {product.details.countryOfOrigin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Країна виробництва:</span>
                        <span>{product.details.countryOfOrigin}</span>
                      </div>
                    )}
                  </div>
                  
                  {product.details.storageConditions && (
                    <div className="mt-4">
                      <h3 className="text-gray-600 mb-1">Умови зберігання:</h3>
                      <p>{product.details.storageConditions}</p>
                    </div>
                  )}
                  
                  {product.details.ingredients && (
                    <div className="mt-4">
                      <h3 className="text-gray-600 mb-1">Склад:</h3>
                      <p>{product.details.ingredients}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
