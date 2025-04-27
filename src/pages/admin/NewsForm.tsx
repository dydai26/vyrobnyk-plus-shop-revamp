import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Upload, X, Plus, Star } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { mockNewsArticles } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { NewsArticle } from "@/types";
import { supabase, getPublicImageUrl } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

const NewsForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id !== undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyArticle: NewsArticle = {
    id: "",
    title: "",
    content: "",
    summary: "",
    image: "/placeholder.svg",
    images: [],
    date: new Date().toISOString(),
    author: "",
  };

  const [article, setArticle] = useState<NewsArticle>(emptyArticle);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          const foundArticle = mockNewsArticles.find((a) => a.id === id);
          if (foundArticle) {
            setArticle(foundArticle);
            setImages(foundArticle.images || [foundArticle.image].filter(Boolean) as string[]);
          }
        } else {
          // Handle schema differences by mapping fields
          const articleData = {
            id: data.id,
            title: data.title,
            content: data.content,
            summary: data.summary,
            author: data.author,
            date: data.date,
            // Map image data based on database schema
            image: data.main_image || data.image_url || "/placeholder.svg",
            images: data.images_urls || data.images || [],
          };
          
          setArticle(articleData);
          setImages(articleData.images.length > 0 ? articleData.images : [articleData.image].filter(Boolean) as string[]);
        }
      };

      fetchArticle();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploadLoading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}-${file.name.replace(/\s+/g, '-')}`;
        
        console.log("Uploading file:", fileName);
        
        const { data, error } = await supabase
          .storage
          .from('news')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Помилка завантаження",
            description: `Не вдалося завантажити зображення: ${error.message}`,
            variant: "destructive"
          });
          continue; // Skip to next file if there's an error
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('news')
          .getPublicUrl(data.path);
        
        const imageUrl = urlData?.publicUrl;
        console.log("Image uploaded successfully:", imageUrl);
        
        if (imageUrl) {
          setImages(prev => [...prev, imageUrl]);
          
          if (!article.image || article.image === "/placeholder.svg") {
            setArticle(prev => ({
              ...prev,
              image: imageUrl
            }));
          }
        }
      }
      
      toast({
        title: "Зображення додано",
        description: "Зображення було успішно завантажено.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Помилка завантаження",
        description: `Не вдалося завантажити зображення: ${error.message || 'Спробуйте ще раз.'}`,
        variant: "destructive"
      });
    } finally {
      setImageUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageToRemove: string) => {
    setImages(prev => prev.filter(img => img !== imageToRemove));
    
    if (article.image === imageToRemove) {
      const newMainImage = images.find(img => img !== imageToRemove) || "/placeholder.svg";
      setArticle(prev => ({
        ...prev,
        image: newMainImage
      }));
    }
  };

  const setAsMainImage = (imageUrl: string) => {
    setArticle(prev => ({
      ...prev,
      image: imageUrl
    }));
    toast({
      title: "Головне зображення встановлено",
      description: "Зображення було встановлено як головне.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Adapt our data structure to match the database schema
      const articleToSave = {
        id: isEditing ? article.id : `news-${Date.now()}`,
        title: article.title,
        content: article.content,
        summary: article.summary,
        author: article.author,
        date: new Date(article.date).toISOString(),
        // Map to the correct column names in the database
        main_image: article.image,
        images_urls: images,
      };
      
      console.log("Saving article:", articleToSave);
      
      let result;
      if (isEditing) {
        result = await supabase
          .from('news')
          .update(articleToSave)
          .eq('id', articleToSave.id);
      } else {
        result = await supabase
          .from('news')
          .insert([articleToSave]);
      }
      
      if (result.error) {
        console.error("Error saving to database:", result.error);
        throw result.error;
      }
      
      toast({
        title: isEditing ? "Новину оновлено" : "Новину створено",
        description: `Новина "${article.title}" була успішно ${isEditing ? "оновлена" : "створена"}.`,
      });
      
      navigate("/admin/news");
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast({
        title: "Помилка збереження",
        description: `Не вдалося зберегти новину: ${error.message || 'Спробуйте ще раз.'}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!article.summary && article.content) {
      const words = article.content.split(' ').slice(0, 30).join(' ');
      setArticle(prev => ({
        ...prev,
        summary: words + (article.content.split(' ').length > 30 ? '...' : '')
      }));
    }
  }, [article.content, article.summary]);

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate("/admin/news")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Назад
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Редагувати новину" : "Створити нову новину"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  name="title"
                  value={article.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Автор</Label>
                <Input
                  id="author"
                  name="author"
                  value={article.author}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Дата публікації</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={article.date ? new Date(article.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    setArticle(prev => ({
                      ...prev,
                      date: new Date(e.target.value).toISOString()
                    }));
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Зображення</Label>
                <div className="mt-2 border rounded-md p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {images.map((img, index) => (
                      <div 
                        key={index} 
                        className={`relative aspect-square border rounded-md overflow-hidden ${
                          article.image === img ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Зображення ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 flex space-x-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeImage(img)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {article.image !== img && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setAsMainImage(img)}
                              title="Встановити як головне"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center aspect-square cursor-pointer hover:bg-gray-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    multiple
                  />
                  
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={imageUploadLoading}
                  >
                    {imageUploadLoading ? 
                      "Завантаження..." : 
                      <><Upload className="h-4 w-4 mr-2" /> Завантажити зображення</>
                    }
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="summary">Короткий опис</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={article.summary}
                  onChange={handleChange}
                  rows={3}
                  required
                />
                <p className="text-sm text-gray-500">
                  Короткий опис статті, що відображатиметься в списку новин (до 200 символів)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Повний текст</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={article.content}
                  onChange={handleChange}
                  rows={10}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-2"
              onClick={() => navigate("/admin/news")}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={imageUploadLoading}>
              <Save className="h-4 w-4 mr-2" /> {isEditing ? "Оновити" : "Створити"} новину
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewsForm;
