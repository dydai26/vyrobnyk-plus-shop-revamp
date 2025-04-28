
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Newspaper, LogOut, RefreshCw, Package } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SupabaseSync from "@/services/supabaseSync";
import { createProductTables } from "@/services/supabaseProducts";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isInitializingProducts, setIsInitializingProducts] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const stats = await SupabaseSync.syncNews();
      toast({
        title: "Синхронізація завершена",
        description: `Завантажено: ${stats.uploaded}, Оновлено: ${stats.updated}, Видалено: ${stats.deleted}, Помилок: ${stats.errors}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка синхронізації",
        description: "Не вдалося синхронізувати дані з базою даних",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateProductTables = async () => {
    setIsInitializingProducts(true);
    try {
      const success = await createProductTables();
      if (success) {
        toast({
          title: "Таблиці продукції створено",
          description: "Таблиці для товарів та категорій успішно створено в базі даних",
        });
      } else {
        throw new Error("Не вдалося створити таблиці");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка створення таблиць",
        description: "Не вдалося створити таблиці для продукції",
      });
    } finally {
      setIsInitializingProducts(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-brand-darkBlue text-white w-full md:w-64 md:min-h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-6">Адмін Панель</h1>
          <nav className="space-y-2">
            <Link
              to="/admin/news"
              className={`flex items-center p-3 rounded-md transition-colors ${
                isActive("/admin/news")
                  ? "bg-brand-blue text-white"
                  : "hover:bg-brand-blue/20"
              }`}
            >
              <Newspaper className="mr-3 h-5 w-5" />
              Новини
            </Link>
            <Link
              to="/admin/products"
              className={`flex items-center p-3 rounded-md transition-colors ${
                isActive("/admin/products")
                  ? "bg-brand-blue text-white"
                  : "hover:bg-brand-blue/20"
              }`}
            >
              <Package className="mr-3 h-5 w-5" />
              Товари
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-6 space-y-4">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="flex items-center justify-center w-full text-white hover:text-white hover:bg-brand-blue/20"
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            Синхронізувати новини
          </Button>
          <Button
            onClick={handleCreateProductTables}
            disabled={isInitializingProducts}
            variant="outline"
            className="flex items-center justify-center w-full text-white hover:text-white hover:bg-brand-blue/20"
          >
            <Package className={`mr-2 h-5 w-5 ${isInitializingProducts ? 'animate-spin' : ''}`} />
            {isInitializingProducts ? 'Ініціалізація...' : 'Ініціалізувати таблиці товарів'}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center justify-center w-full text-white hover:text-white hover:bg-brand-blue/20"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Вийти з панелі
          </Button>
        </div>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
