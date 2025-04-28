
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { mockProducts, productCategories } from "@/services/mockData";
import { 
  createProductTables, 
  importMockProductsToSupabase 
} from "@/services/supabaseProducts";
import { AlertCircle, CheckCircle } from "lucide-react";

const ProductSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; message: string }>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    
    try {
      // First create tables
      const tablesCreated = await createProductTables();
      
      if (!tablesCreated) {
        setResult({
          success: false,
          message: "Не вдалося створити таблиці в Supabase"
        });
        return;
      }
      
      // Then import mock data
      const importResult = await importMockProductsToSupabase(mockProducts, productCategories);
      
      setResult({
        success: true,
        message: `Синхронізовано ${importResult.productsAdded} товарів і ${importResult.categoriesAdded} категорій`
      });
    } catch (error) {
      console.error("Error syncing products:", error);
      setResult({
        success: false,
        message: `Помилка: ${error instanceof Error ? error.message : "Невідома помилка"}`
      });
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Синхронізація даних з Supabase</h2>
      <p className="text-gray-600">
        Ця функція створить необхідні таблиці в Supabase і заповнить їх тестовими даними.
        Використовуйте її тільки для початкового налаштування бази даних.
      </p>
      
      <Button 
        onClick={handleSync} 
        disabled={syncing}
        variant="outline"
        className="w-full"
      >
        {syncing ? "Синхронізація..." : "Синхронізувати тестові дані з Supabase"}
      </Button>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.success ? "Успішно" : "Помилка"}
          </AlertTitle>
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProductSync;
