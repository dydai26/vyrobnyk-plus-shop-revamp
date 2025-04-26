import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Замовлення оформлено",
      description: "Ваше замовлення прийнято до обробки. Дякуємо за покупку!",
    });
    clearCart();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Кошик</h1>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold">Товари у кошику</h2>
                  </div>

                  <ul>
                    {cartItems.map((item) => {
                      if (!item || !item.product || typeof item.product.price !== 'number') return null;
                      
                      return (
                        <li
                          key={item.product.id}
                          className="p-4 border-b last:border-b-0 flex flex-col sm:flex-row items-start sm:items-center"
                        >
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1">
                            <Link
                              to={`/product/${item.product.id}`}
                              className="font-medium hover:text-brand-blue transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.product.categoryId}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.product.id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-16 border rounded-md p-1 text-center"
                                />
                                <span className="text-gray-500 ml-2">x</span>
                                <span className="font-medium ml-2">
                                  {item.product.price} ₴
                                </span>
                                <span className="font-semibold ml-4">
                                  = {item.product.price * item.quantity} ₴
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 -my-1"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Видалити
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    className="text-gray-600"
                    asChild
                  >
                    <Link to="/catalog">
                      <ShoppingBag className="h-4 w-4 mr-2" /> Продовжити покупки
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => clearCart()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Очистити кошик
                  </Button>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white rounded-lg border sticky top-24">
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold">Оформлення замовлення</h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Кількість товарів:</span>
                        <span>{cartItems.length}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Загальна сума:</span>
                        <span>{totalPrice} ₴</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Оформити замовлення <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Ваш кошик порожній</h2>
              <p className="text-gray-600 mb-8">
                Додайте товари з каталогу, щоб оформити замовлення
              </p>
              <Button asChild>
                <Link to="/catalog">
                  <ShoppingBag className="h-4 w-4 mr-2" /> Перейти до каталогу
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
