import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockProducts, productCategories } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Product, ProductDetails } from "@/types";
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const isEditing = id !== undefined;

  const emptyProduct: Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "/placeholder.svg",
    additionalImages: [],
    categoryId: "",
    inStock: true,
    createdAt: new Date().toISOString(),
    details: {
      weight: "",
      expirationDays: 0,
      calories: 0,
      packaging: "",
      proteins: 0,
      fats: 0,
      carbs: 0,
      storageConditions: "",
      ingredients: "",
      piecesInPackage: 0,
      manufacturer: "ТОВ \"Виробник Плюс\"",
      countryOfOrigin: "Україна"
    }
  };

  const [product, setProduct] = useState<Product>(emptyProduct);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (isEditing) {
      const foundProduct = mockProducts.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setMainImagePreview(foundProduct.image);
        setAdditionalImagePreviews(foundProduct.additionalImages || []);
      }
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setProduct((prev) => ({ ...prev, inStock: checked }));
  };

  const handleCategoryChange = (value: string) => {
    setProduct((prev) => ({ ...prev, categoryId: value }));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      details: {
        ...prev.details!,
        [name]: value
      }
    }));
  };

  const handleDetailsNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      details: {
        ...prev.details!,
        [name]: parseFloat(value)
      }
    }));
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // First show a local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setMainImagePreview(result);
        };
        reader.readAsDataURL(file);
        
        // Create form data to send to server
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload to server
        const response = await fetch('http://localhost:3000/api/upload/product', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        // Update product with the server path
        setProduct((prev) => ({ 
          ...prev, 
          image: data.url 
        }));
        
        toast({
          title: "Зображення завантажено",
          description: "Основне зображення товару успішно завантажено.",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Помилка завантаження",
          description: "Не вдалося завантажити зображення. Спробуйте ще раз.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Show local previews first
        const fileArray = Array.from(files);
        const newPreviews: string[] = [];
        
        // Create local previews
        for (const file of fileArray) {
          const preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          newPreviews.push(preview);
        }
        
        // Create form data
        const formData = new FormData();
        fileArray.forEach(file => {
          formData.append('images', file);
        });
        
        // Upload to server
        const response = await fetch('http://localhost:3000/api/upload/product/additional', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        const serverUrls = data.urls;
        
        setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
        setProduct(prev => ({
          ...prev,
          additionalImages: serverUrls
        }));
        
        toast({
          title: "Зображення завантажені",
          description: `${files.length} додаткових зображень успішно завантажено.`,
        });
      } catch (error) {
        console.error("Error uploading additional images:", error);
        toast({
          title: "Помилка завантаження",
          description: "Не вдалося завантажити додаткові зображення. Спробуйте ще раз.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const removeAdditionalImage = (index: number) => {
    const updatedImages = [...(product.additionalImages || [])];
    updatedImages.splice(index, 1);
    
    setAdditionalImagePreviews(updatedImages);
    setProduct(prev => ({
      ...prev,
      additionalImages: updatedImages
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a random ID if not editing
    if (!isEditing) {
      const newId = `product-${Date.now()}`;
      setProduct(prev => ({ ...prev, id: newId }));
    }
    
    // In a real application, this would send data to the server
    // For now, we'll just show a success toast
    
    toast({
      title: isEditing ? "Товар оновлено" : "Товар створено",
      description: `Товар "${product.name}" був успішно ${isEditing ? "оновлений" : "створений"}.`,
    });
    
    // Update the mockProducts array in a real app
    // Here we'd likely use a state management solution or API call
    
    navigate("/admin/products");
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Назад
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Редагувати товар" : "Створити новий товар"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Основна інформація</TabsTrigger>
              <TabsTrigger value="details">Характеристики</TabsTrigger>
              <TabsTrigger value="images">Зображення</TabsTrigger>
            </TabsList>
            
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Назва товару</Label>
                    <Input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Категорія</Label>
                    <Select
                      value={product.categoryId}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть категорію" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Ціна (грн)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={product.inStock}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="inStock">В наявності</Label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Опис товару</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Product Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Вага</Label>
                    <Input
                      id="weight"
                      name="weight"
                      value={product.details?.weight || ""}
                      onChange={handleDetailsChange}
                      placeholder="250 г"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="calories">Енергетична цінність (ккал/100г)</Label>
                    <Input
                      id="calories"
                      name="calories"
                      type="number"
                      min="0"
                      value={product.details?.calories || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="proteins">Білки (г/100г)</Label>
                    <Input
                      id="proteins"
                      name="proteins"
                      type="number"
                      min="0"
                      step="0.1"
                      value={product.details?.proteins || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fats">Жири (г/100г)</Label>
                    <Input
                      id="fats"
                      name="fats"
                      type="number"
                      min="0"
                      step="0.1"
                      value={product.details?.fats || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Вуглеводи (г/100г)</Label>
                    <Input
                      id="carbs"
                      name="carbs"
                      type="number"
                      min="0"
                      step="0.1"
                      value={product.details?.carbs || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="packaging">Упакування</Label>
                    <Input
                      id="packaging"
                      name="packaging"
                      value={product.details?.packaging || ""}
                      onChange={handleDetailsChange}
                      placeholder="Картонна коробка"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expirationDays">Термін придатності (днів)</Label>
                    <Input
                      id="expirationDays"
                      name="expirationDays"
                      type="number"
                      min="0"
                      value={product.details?.expirationDays || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="piecesInPackage">Кількість штук в упаковці</Label>
                    <Input
                      id="piecesInPackage"
                      name="piecesInPackage"
                      type="number"
                      min="0"
                      value={product.details?.piecesInPackage || 0}
                      onChange={handleDetailsNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="storageConditions">Умови зберігання</Label>
                    <Textarea
                      id="storageConditions"
                      name="storageConditions"
                      value={product.details?.storageConditions || ""}
                      onChange={handleDetailsChange}
                      rows={2}
                      placeholder="Зберігати у сухому, захищеному від світла місці при температурі не вище +25°C"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredients">Склад</Label>
                    <Textarea
                      id="ingredients"
                      name="ingredients"
                      value={product.details?.ingredients || ""}
                      onChange={handleDetailsChange}
                      rows={2}
                      placeholder="Борошно пшеничне вищого ґатунку, цукор, яйця, маргарин, сіль, ваніль, дріжджі"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Основне зображення</Label>
                    <div className="mt-2 border rounded-md p-4 bg-gray-50">
                      <div className="w-full h-64 bg-white border rounded-md overflow-hidden mb-4">
                        <img
                          src={mainImagePreview || product.image || "/placeholder.svg"}
                          alt="Попередній перегляд"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleMainImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Завантаження... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" /> Завантажити зображення
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Додаткові зображення</Label>
                    <div className="mt-2 border rounded-md p-4 bg-gray-50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        {additionalImagePreviews.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-24 bg-white border rounded-md overflow-hidden">
                              <img
                                src={image}
                                alt={`Додаткове зображення ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        <div 
                          className="w-full h-24 bg-white border border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
                          onClick={() => additionalImagesInputRef.current?.click()}
                        >
                          <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        ref={additionalImagesInputRef}
                        onChange={handleAdditionalImagesUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      
                      <Button
                        type="button"
                        onClick={() => additionalImagesInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Додати зображення
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-2"
              onClick={() => navigate("/admin/products")}
            >
              Скасувати
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" /> {isEditing ? "Оновити" : "Створити"} товар
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
