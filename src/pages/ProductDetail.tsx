import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, ShoppingCart, Package, Info, Truck, CreditCard, Calendar, Camera, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockProducts, productCategories } from "@/services/mockData";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ProductDetails } from "@/types";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState("");
  
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-16 container">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Товар не знайдено</h1>
            <Link to="/catalog" className="text-blue-600 hover:underline flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Повернутися до каталогу
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get all available images (main + additional)
  const allImages = [product.image, ...(product.additionalImages || [])];
  
  // If no main image is selected, use the first one
  const currentImage = mainImage || product.image;
  
  const category = productCategories.find(cat => cat.id === product.categoryId);
  
  const handleAddToCart = () => {
    addToCart(product);
  };
  
  // Get details if available, or use default empty object with type safety
  const details: Partial<ProductDetails> = product.details || {};
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <Link to={`/catalog/${product.categoryId}`} className="text-[#3A3C99] hover:underline flex items-center mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Назад до {category?.name || 'каталогу'}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images Section */}
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery - only show if there are additional images */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((photo, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${photo === currentImage ? 'border-[#3A3C99]' : 'border-transparent'}`}
                      onClick={() => setMainImage(photo)}
                    >
                      <img 
                        src={photo} 
                        alt={`${product.name} - фото ${index + 1}`} 
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info Section */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className={`inline-block text-sm px-3 py-1 rounded-full mr-3 ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock ? 'В наявності' : 'Немає в наявності'}
                  </span>
                  <span className="text-sm text-gray-500">Артикул: {product.id}</span>
                </div>
                
                <p className="text-gray-700 mb-6">{product.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <div className="text-2xl font-bold text-[#3A3C99]">
                    {formatCurrency(product.price)}
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart} 
                    disabled={!product.inStock}
                    className="flex items-center bg-[#3A3C99] hover:bg-[#2D2F7A] transition-colors"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Додати до кошика
                  </Button>
                </div>
                
                {/* Quick Product Specs - only show if details are provided */}
                {product.details && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {details.weight && (
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-[#3A3C99] mr-2" />
                        <span className="text-sm">Вага: {details.weight}</span>
                      </div>
                    )}
                    {details.expirationDays && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-[#3A3C99] mr-2" />
                        <span className="text-sm">Термін придатності: {details.expirationDays} днів</span>
                      </div>
                    )}
                    {details.calories && (
                      <div className="flex items-center">
                        <Info className="h-4 w-4 text-[#3A3C99] mr-2" />
                        <span className="text-sm">Енергетична цінність: {details.calories} ккал/100г</span>
                      </div>
                    )}
                    {details.packaging && (
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 text-[#3A3C99] mr-2" />
                        <span className="text-sm">Упакування: {details.packaging}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Detailed Info Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="characteristics">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
                <TabsTrigger value="characteristics" className="flex items-center">
                  <ListChecks className="h-4 w-4 mr-2" /> Характеристики
                </TabsTrigger>
                <TabsTrigger value="shipping" className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" /> Доставка
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" /> Оплата
                </TabsTrigger>
                <TabsTrigger value="ordering" className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Умови замовлення
                </TabsTrigger>
              </TabsList>
              
              {/* Product Characteristics Tab */}
              <TabsContent value="characteristics" className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Характеристики продукту</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Загальна інформація</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Назва:</span>
                        <span className="font-medium">{product.name}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Категорія:</span>
                        <span className="font-medium">{category?.name}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Артикул:</span>
                        <span className="font-medium">{product.id}</span>
                      </li>
                      {details.manufacturer && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Виробник:</span>
                          <span className="font-medium">{details.manufacturer}</span>
                        </li>
                      )}
                      {details.countryOfOrigin && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Країна виробництва:</span>
                          <span className="font-medium">{details.countryOfOrigin}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Склад і харчова цінність</h4>
                    <ul className="space-y-2">
                      {details.weight && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Вага:</span>
                          <span className="font-medium">{details.weight}</span>
                        </li>
                      )}
                      {details.piecesInPackage && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Кількість штук в упаковці:</span>
                          <span className="font-medium">{details.piecesInPackage} шт</span>
                        </li>
                      )}
                      {details.calories && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Енергетична цінність:</span>
                          <span className="font-medium">{details.calories} ккал/100г</span>
                        </li>
                      )}
                      {details.proteins && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Білки:</span>
                          <span className="font-medium">{details.proteins} г/100г</span>
                        </li>
                      )}
                      {details.fats && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Жири:</span>
                          <span className="font-medium">{details.fats} г/100г</span>
                        </li>
                      )}
                      {details.carbs && (
                        <li className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Вуглеводи:</span>
                          <span className="font-medium">{details.carbs} г/100г</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {(details.expirationDays || details.storageConditions || details.packaging) && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-2">Зберігання</h4>
                      <ul className="space-y-2">
                        {details.expirationDays && (
                          <li className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Термін придатності:</span>
                            <span className="font-medium">{details.expirationDays} днів</span>
                          </li>
                        )}
                        {details.storageConditions && (
                          <li className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Умови зберігання:</span>
                            <span className="font-medium">{details.storageConditions}</span>
                          </li>
                        )}
                        {details.packaging && (
                          <li className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Упаковка:</span>
                            <span className="font-medium">{details.packaging}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {details.ingredients && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-2">Склад</h4>
                      <p className="text-gray-800">{details.ingredients}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Shipping Tab */}
              <TabsContent value="shipping" className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Умови доставки</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Доставка по Україні</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Нова Пошта - 1-3 дні</li>
                      <li>Укрпошта - 3-7 днів</li>
                      <li>Meest Express - 2-4 дні</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Доставка по Києву</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Кур'єрська доставка - доставка в день замовлення або на наступний день</li>
                      <li>Самовивіз з нашого магазину - безкоштовно</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Вартість доставки</h4>
                    <p>Вартість доставки залежить від обраного способу доставки та регіону.</p>
                    <p className="mt-2">При замовленні від 1000 грн доставка Новою Поштою безкоштовна.</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Payment Tab */}
              <TabsContent value="payment" className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Умови оплати</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Способи оплати</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Оплата при отриманні (накладений платіж)</li>
                      <li>Онлайн-оплата карткою Visa/MasterCard</li>
                      <li>Оплата через Apple Pay / Google Pay</li>
                      <li>Банківський переказ для юридичних осіб</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Безпека платежів</h4>
                    <p>Всі платежі обробляються через захищені канали з використанням сучасних технологій шифрування. Ми не зберігаємо дані ваших банківських карт.</p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Ordering Tab */}
              <TabsContent value="ordering" className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Умови замовлення</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Як зробити замовлення</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Виберіть потрібні товари та додайте їх у кошик</li>
                      <li>Перейдіть у кошик та перевірте замовлення</li>
                      <li>Натисніть кнопку "Оформити замовлення"</li>
                      <li>Заповніть форму з контактними даними та адресою доставки</li>
                      <li>Виберіть спосіб доставки та оплати</li>
                      <li>Підтвердіть замовлення</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Мінімальна сума замовлення</h4>
                    <p>Мінімальна сума замовлення для відправки - 200 грн.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Оптові замовлення</h4>
                    <p>Для оптових замовлень, будь ласка, зв'яжіться з нашим відділом продажів за телефоном +380 (XX) XXX-XX-XX або відправте запит на електронну пошту sales@vyrobnykplus.com.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Скасування замовлення</h4>
                    <p>Ви можете скасувати замовлення до моменту його відправки, зв'язавшись з нашим сервісним центром.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail; 