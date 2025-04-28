
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Import } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductCategory } from "@/types";
import { fetchProductCategories } from "@/services/supabaseProducts";
import { supabase } from "@/lib/supabase";
import ProductSync from "@/components/admin/ProductSync";
import CategoryForm from "@/components/admin/CategoryForm";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryToEdit, setCategoryToEdit] = useState<ProductCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchProductCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити категорії",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = () => {
    setCategoryToEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (category: ProductCategory) => {
    setCategoryToEdit(category);
    setFormOpen(true);
  };

  const handleDelete = (category: ProductCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryToDelete.id);
      
      if (error) throw error;
      
      // Update local state
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      
      toast({
        title: "Успішно",
        description: `Категорію "${categoryToDelete.name}" видалено`,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити категорію",
        variant: "destructive",
      });
    } finally {
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = (category: ProductCategory) => {
    // Update local state
    const isNewCategory = !categories.some(cat => cat.id === category.id);
    
    if (isNewCategory) {
      setCategories([...categories, category]);
    } else {
      setCategories(
        categories.map(cat => cat.id === category.id ? category : cat)
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Категорії товарів</h1>
          <div className="space-x-2">
            <Button onClick={() => navigate("/admin/products")}>
              Керування товарами
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Додати категорію
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "60px" }}>Фото</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>ID</TableHead>
                <TableHead style={{ width: "120px" }}>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                      <span className="ml-2">Завантаження...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Категорій поки немає
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Sync Mock Data Section */}
        <div className="border rounded-lg p-4 mt-8">
          <ProductSync />
        </div>

        {/* Category Form Dialog */}
        <CategoryForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          categoryToEdit={categoryToEdit}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
              <AlertDialogDescription>
                Ви дійсно хочете видалити категорію "{categoryToDelete?.name}"?
                Ця дія не може бути скасована, і всі товари в цій категорії
                стануть недоступними.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Видалити
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default CategoriesManagement;
