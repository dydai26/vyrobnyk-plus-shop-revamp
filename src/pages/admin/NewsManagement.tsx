import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, CalendarDays, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockNewsArticles } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { NewsArticle } from "@/types";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

const NewsManagement = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      // Try to get articles from Supabase
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Map database columns to our frontend model
        const mappedArticles: NewsArticle[] = data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary || '',
          author: item.author || '',
          date: item.date,
          // Map the image fields correctly
          image: item.main_image || '/placeholder.svg',
          images: item.images_urls || [],
        }));
        setArticles(mappedArticles);
      } else {
        // Fallback to mock data if Supabase returns empty
        setArticles(mockNewsArticles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      // Fallback to mock data
      setArticles(mockNewsArticles);
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити новини. Використовуються тестові дані.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteArticle = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setArticles(articles.filter((article) => article.id !== id));
      
      toast({
        title: "Новину видалено",
        description: "Новина була успішно видалена з системи",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Помилка видалення",
        description: "Не вдалося видалити новину. Спробуйте ще раз.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управління новинами</h1>
          <Button asChild>
            <Link to="/admin/news/new">
              <Plus className="h-4 w-4 mr-2" /> Додати новину
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex">
            <Input
              type="text"
              placeholder="Пошук новин..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" /> Пошук
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead className="min-w-[300px]">Заголовок</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Дата публікації</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Завантаження новин...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                          <img
                            src={article.image || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate max-w-[300px]">{article.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
                        {format(new Date(article.date), "d MMMM yyyy", { locale: uk })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/news/edit/${article.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-gray-500">Новини не знайдено</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsManagement;
