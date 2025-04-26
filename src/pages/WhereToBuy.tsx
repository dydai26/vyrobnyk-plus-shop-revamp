import React from "react";
import { ExternalLink, MapPin, Search, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Store } from "@/types";

// Mock store data - in a real app, this would come from a backend
const mockStores: Store[] = [
  { id: "1", name: "Карамелька", logo: "/karamelka.png", url: "https://atb.ua" },
  { id: "2", name: "Сільпо", logo: "/partners-logo-2png@2x.png", url: "https://silpo.ua" },
  { id: "3", name: "Новус", logo: "/partners-logo-1png@2x.png", url: "https://novus.com.ua" },
  { id: "4", name: "Ашан", logo: "/partners-logo-1png@2x.png", url: "https://auchan.ua" },
  { id: "5", name: "Метро", logo: "/partners-logo-1png@2x.png", url: "https://metro.ua" },
  { id: "6", name: "Фора", logo: "/partners-logo-1png@2x.png", url: "https://fora.ua" },
  { id: "7", name: "ЕКО маркет", logo: "/partners-logo-1png@2x.png", url: "https://eko.com.ua" },
  { id: "8", name: "Велика Кишеня", logo: "/partners-logo-1png@2x.png", url: "https://kishenya.ua" },
  { id: "9", name: "Фуршет", logo: "/partners-logo-1png@2x.png", url: "https://furshet.ua" },
];

const cities = [
  "Київ", "Харків", "Одеса", "Дніпро", "Львів", "Запоріжжя", "Вінниця", "Полтава", "Чернігів"
];

const WhereToBuy = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState<string | null>(null);
  
  const filteredStores = mockStores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-8">Де придбати нашу продукцію</h1>
          
          <div className="mb-12">
            <p className="text-gray-600 mb-6 max-w-3xl">
              Наша продукція представлена в найбільших торговельних мережах України. Ви можете знайти товари VYROBNYKPLUS у супермаркетах, продуктових магазинах та спеціалізованих кондитерських відділах.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Пошук магазинів..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" /> Пошук
              </Button>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Оберіть місто:</h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "outline"}
                    onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                    className="mb-2"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-white border rounded-lg p-6 flex flex-col items-center hover:shadow-md transition-shadow">
                <div className="w-24 h-24 mb-4 flex items-center justify-center">
                  <img 
                    src={store.logo} 
                    alt={store.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{store.name}</h3>
                {store.url && (
                  <a 
                    href={store.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline flex items-center mt-2"
                  >
                    Перейти на сайт <ExternalLink className="ml-1 w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-12">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-brand-blue mr-2" />
              <h2 className="text-2xl font-semibold">Карта магазинів</h2>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              {/* In a real app, this would be an embedded Google Maps iframe with store locations */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Карта з розташуванням магазинів
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-6">Замовлення для бізнесу</h2>
            <p className="text-gray-600 mb-4">
              Якщо ви власник магазину, кафе, ресторану або іншого бізнесу і хочете закуповувати нашу продукцію оптом, зв'яжіться з нашим відділом продажів.
            </p>
            <p className="text-gray-600 mb-6">
              Ми пропонуємо гнучкі умови співпраці, можливість доставки та індивідуальний підхід до кожного клієнта.
            </p>
            <div className="bg-brand-blue/10 p-6 rounded-lg">
              <p className="font-semibold mb-2">Контакти відділу оптових продажів:</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Phone className="w-5 h-5 text-brand-blue mr-2" />
                  +380 (50) 987-65-43
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 text-brand-blue mr-2" />
                  sales@vyrobnykplus.com
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WhereToBuy;
