
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { ProductCategory } from "@/types";
import { supabase } from "@/lib/supabase";
import { transliterate, uploadProductImage } from "@/services/supabaseProducts";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: ProductCategory) => void;
  categoryToEdit?: ProductCategory | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  open, 
  onClose, 
  onSave, 
  categoryToEdit 
}) => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<string>("/placeholder.svg");
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isEditing = !!categoryToEdit;
  
  // Load category data if editing
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setCategoryId(categoryToEdit.id);
      setImage(categoryToEdit.image || "/placeholder.svg");
    } else {
      // Reset form for new category
      setName("");
      setCategoryId("");
      setImage("/placeholder.svg");
      setImageFile(null);
    }
  }, [categoryToEdit]);
  
  // Generate category ID from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Only auto-generate ID for new categories
    if (!isEditing) {
      const transliteratedName = transliterate(newName.toLowerCase())
        .replace(/[^\w\s]/g, '')  // Remove special characters
        .replace(/\s+/g, '-');    // Replace spaces with hyphens
      
      setCategoryId(transliteratedName);
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show local preview first
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    
    // Save file for later upload
    setImageFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Помилка",
        description: "Ім'я категорії обов'язкове",
        variant: "destructive",
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: "Помилка",
        description: "ID категорії обов'язковий",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload image if new file was selected
      let finalImageUrl = image;
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          toast({
            title: "Помилка",
            description: "Не вдалося завантажити зображення",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }
      
      // Prepare category object
      const categoryData: ProductCategory = {
        id: categoryId,
        name: name,
        image: finalImageUrl === "/placeholder.svg" ? "" : finalImageUrl,
      };
      
      // Save to Supabase
      if (isEditing) {
        // Update existing category
        const { error } = await supabase
          .from('product_categories')
          .update({
            name: categoryData.name,
            image: categoryData.image,
          })
          .eq('id', categoryData.id);
        
        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('product_categories')
          .insert({
            id: categoryData.id,
            name: categoryData.name,
            image: categoryData.image,
          });
        
        if (error) throw error;
      }
      
      // Notify parent component
      onSave(categoryData);
      
      toast({
        title: "Успішно",
        description: `Категорію "${name}" ${isEditing ? "оновлено" : "створено"}`
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Помилка",
        description: `Не вдалося ${isEditing ? "оновити" : "створити"} категорію: ${
          error instanceof Error ? error.message : "Невідома помилка"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редагувати категорію" : "Створити категорію"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Назва категорії</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Введіть назву категорії"
              required
            />
          </div>
          
          {/* Category ID */}
          <div className="space-y-2">
            <Label htmlFor="id">ID категорії</Label>
            <Input
              id="id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Автоматично генерується з назви"
              readOnly={isEditing}
              disabled={isEditing}
            />
          </div>
          
          {/* Category Image */}
          <div className="space-y-2">
            <Label>Зображення категорії</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:bg-gray-50"
              onClick={handleImageClick}
            >
              <div className="flex flex-col items-center">
                <div className="w-full h-48 relative mb-4">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  {image !== "/placeholder.svg" && (
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage("/placeholder.svg");
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="button" variant="outline" onClick={handleImageClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Виберіть зображення
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, GIF до 10MB
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Збереження...
                </>
              ) : (
                `${isEditing ? "Оновити" : "Створити"} категорію`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
