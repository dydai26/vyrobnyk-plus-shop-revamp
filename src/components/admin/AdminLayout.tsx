import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Newspaper, LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
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
          </nav>
        </div>
        <div className="mt-auto p-6">
          <Link
            to="/"
            className="flex items-center p-3 text-white/70 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Вийти з панелі
          </Link>
        </div>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
