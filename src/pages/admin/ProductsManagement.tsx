import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ArrowUpDown 
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { mockProducts, productCategories } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types";

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Filtered products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get category name from ID
  function getCategoryName(categoryId: string): string {
    const category = productCategories.find(cat => cat.id === categoryId);
    return category ? category.name : "Невідома категорія";
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    toast({
      title: "Товар видалено",
      description: "Товар був успішно видалений з системи",
      variant: "destructive",
    });
  };

  const toggleProductStatus = (id: string) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, inStock: !product.inStock } : product
      )
    );
    
    const product = products.find(p => p.id === id);
    if (product) {
      toast({
        title: `Статус оновлено`,
        description: `Товар "${product.name}" тепер ${product.inStock ? 'не в наявності' : 'в наявності'}`,
      });
    }
  };

  // Format price to Ukrainian currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управління товарами</h1>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> Додати товар
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex">
            <Input
              type="text"
              placeholder="Пошук товарів..."
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
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center">
                    Назва <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead className="text-right">Ціна</TableHead>
                <TableHead>Наявність</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="truncate max-w-[300px]">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {product.inStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" /> В наявності
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="mr-1 h-3 w-3" /> Немає
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id)}
                        >
                          {product.inStock ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/products/edit/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">Товари не знайдено</div>
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

export default ProductsManagement;
