
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-8">Про нас</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Наша історія</h2>
              <p className="text-gray-600 mb-4">
                Компанія VYROBNYKPLUS була заснована у 2005 році як невелике виробництво 
                кондитерських виробів. За ці роки ми виросли до сучасного підприємства 
                з повним циклом виробництва та широким асортиментом продукції.
              </p>
              <p className="text-gray-600 mb-4">
                Від початку нашою метою було створення смачних, якісних та доступних 
                солодощів для українських споживачів. Ми пишаємося тим, що зберігаємо 
                традиційні рецепти та водночас впроваджуємо інновації.
              </p>
              <p className="text-gray-600">
                Сьогодні VYROBNYKPLUS - це команда професіоналів, сучасне обладнання 
                та натуральні інгредієнти, які дозволяють нам виробляти кондитерські 
                вироби найвищої якості.
              </p>
            </div>
            <div>
              <img 
                src="/placeholder.svg" 
                alt="Історія компанії" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Наша місія</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl text-gray-700 italic">
                "Створювати якісні та смачні кондитерські вироби, сприяти позитивним 
                емоціям та радості в житті наших споживачів"
              </p>
            </div>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Наше виробництво</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">
                  Виробництво VYROBNYKPLUS оснащене сучасним обладнанням від провідних 
                  європейських виробників. Ми суворо дотримуємося всіх санітарних норм 
                  та стандартів якості.
                </p>
                <p className="text-gray-600">
                  Наші технологи постійно працюють над вдосконаленням рецептур та 
                  розробкою нових видів продукції. Ми використовуємо лише натуральні 
                  інгредієнти та не застосовуємо консерванти.
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-4">
                  Контроль якості здійснюється на всіх етапах виробництва: від перевірки 
                  сировини до дегустації готової продукції. Наша лабораторія проводить 
                  регулярні тестування, щоб гарантувати безпеку та якість кожної партії.
                </p>
                <p className="text-gray-600">
                  Завдяки цьому підходу, продукція VYROBNYKPLUS відповідає найвищим 
                  стандартам якості та має відмінні смакові характеристики.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Сертифікація</h3>
              <p className="text-gray-600">
                Уся наша продукція сертифікована згідно з українським законодавством 
                та відповідає міжнародним стандартам якості ISO 9001.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Екологічність</h3>
              <p className="text-gray-600">
                Ми дбаємо про навколишнє середовище, використовуючи енергоефективне 
                обладнання та екологічно чисті матеріали для упаковки.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Соціальна відповідальність</h3>
              <p className="text-gray-600">
                VYROBNYKPLUS регулярно підтримує соціальні проекти та благодійні організації, 
                допомагаючи дитячим будинкам та школам.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Наша команда</h2>
            <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
              Наша команда складається з досвідчених фахівців, які люблять свою справу та 
              постійно вдосконалюють свої навички. Ми створюємо комфортні умови праці та 
              можливості для професійного розвитку.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Placeholder for team members - in real app, would map through actual team data */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                    <img src="/placeholder.svg" alt="Team member" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">Ім'я Прізвище</h3>
                  <p className="text-gray-500 mb-3">Посада</p>
                  <p className="text-gray-600 max-w-xs mx-auto">
                    Короткий опис досвіду та експертизи команди
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
