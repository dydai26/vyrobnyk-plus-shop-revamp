
import { supabase } from "@/lib/supabase";
import { Product, ProductCategory } from "@/types";

// Helper function to get public URL for images
export const getProductImageUrl = (path: string) => {
  if (!path) return '/placeholder.svg';
  
  // If path is already a full URL, return it as is
  if (path.startsWith('http')) return path;
  
  // If path starts with "/", remove it as Supabase doesn't expect leading slash
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  const { data } = supabase.storage.from('products').getPublicUrl(cleanPath);
  return data?.publicUrl || '/placeholder.svg';
};

// Transliterate Cyrillic characters to Latin to avoid storage key errors
export const transliterate = (text: string): string => {
  if (!text) return '';
  
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
    'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sch', 'ь': '', 'ю': 'yu', 'я': 'ya', 'ъ': '',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E',
    'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 
    'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 
    'Ш': 'Sh', 'Щ': 'Sch', 'Ю': 'Yu', 'Я': 'Ya', 'ы': 'y', 'Ы': 'Y', 
    'э': 'e', 'Э': 'E', 'Ь': '', 'Ъ': ''
  };

  return text.split('').map(char => translitMap[char] || char).join('');
};

// Upload product image to Supabase storage
export const uploadProductImage = async (file: File, fileName?: string): Promise<string | null> => {
  try {
    // Generate unique file name with transliteration if not provided
    const originalName = fileName || file.name;
    const fileExtension = originalName.split('.').pop() || '';
    const baseFileName = originalName.replace(`.${fileExtension}`, '');
    const transliteratedName = transliterate(baseFileName);
    
    const uniqueFileName = `${transliteratedName}-${Date.now()}.${fileExtension}`;
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(uniqueFileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Error uploading product image:', error);
      return null;
    }
    
    return getProductImageUrl(data.path);
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
};

// Upload multiple product images
export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    const url = await uploadProductImage(file);
    if (url) {
      uploadedUrls.push(url);
    }
  }
  
  return uploadedUrls;
};

// Delete product image from Supabase storage
export const deleteProductImage = async (path: string): Promise<boolean> => {
  if (!path) return false;
  
  try {
    // Extract the file path from the URL if it's a public URL
    let filePath = path;
    const storageUrl = supabase.storageUrl;
    
    if (path.includes(storageUrl)) {
      // Extract filename from the full URL
      const urlParts = path.split('/');
      filePath = urlParts[urlParts.length - 1];
    }
    
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    return false;
  }
};

// Create product tables in Supabase
export const createProductTables = async (): Promise<boolean> => {
  try {
    // Create products table
    const { error: productsTableError } = await supabase.rpc('pgSQL', {
      query: `
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL,
          image TEXT,
          additional_images TEXT[],
          category_id TEXT NOT NULL,
          in_stock BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          details JSONB
        );
        
        -- Enable Row Level Security
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for products table
        DROP POLICY IF EXISTS "Allow read access for all" ON products;
        CREATE POLICY "Allow read access for all" ON products FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Allow insert for all" ON products;
        CREATE POLICY "Allow insert for all" ON products FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Allow update for all" ON products;
        CREATE POLICY "Allow update for all" ON products FOR UPDATE USING (true);
        
        DROP POLICY IF EXISTS "Allow delete for all" ON products;
        CREATE POLICY "Allow delete for all" ON products FOR DELETE USING (true);
      `
    });
    
    if (productsTableError) {
      console.error('Error creating products table:', productsTableError);
      return false;
    }
    
    // Create categories table
    const { error: categoriesTableError } = await supabase.rpc('pgSQL', {
      query: `
        CREATE TABLE IF NOT EXISTS product_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          image TEXT
        );
        
        -- Enable Row Level Security
        ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for categories table
        DROP POLICY IF EXISTS "Allow read access for all categories" ON product_categories;
        CREATE POLICY "Allow read access for all categories" ON product_categories FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Allow insert for all categories" ON product_categories;
        CREATE POLICY "Allow insert for all categories" ON product_categories FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Allow update for all categories" ON product_categories;
        CREATE POLICY "Allow update for all categories" ON product_categories FOR UPDATE USING (true);
        
        DROP POLICY IF EXISTS "Allow delete for all categories" ON product_categories;
        CREATE POLICY "Allow delete for all categories" ON product_categories FOR DELETE USING (true);
      `
    });
    
    if (categoriesTableError) {
      console.error('Error creating product_categories table:', categoriesTableError);
      return false;
    }
    
    // Create storage bucket for product images if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });
    
    // Ignore error if bucket already exists
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating products storage bucket:', bucketError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating product tables:', error);
    return false;
  }
};

// Get all product categories from Supabase
export const fetchProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data.map((category) => ({
      id: category.id,
      name: category.name,
      image: getProductImageUrl(category.image)
    }));
  } catch (error) {
    console.error('Error in fetchProductCategories:', error);
    return [];
  }
};

// Get all products from Supabase
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: getProductImageUrl(product.image),
      additionalImages: product.additional_images?.map(getProductImageUrl) || [],
      categoryId: product.category_id,
      inStock: product.in_stock,
      createdAt: product.created_at,
      details: product.details
    }));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
};

// Get products by category from Supabase
export const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
    
    return data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: getProductImageUrl(product.image),
      additionalImages: product.additional_images?.map(getProductImageUrl) || [],
      categoryId: product.category_id,
      inStock: product.in_stock,
      createdAt: product.created_at,
      details: product.details
    }));
  } catch (error) {
    console.error('Error in fetchProductsByCategory:', error);
    return [];
  }
};

// Get product by ID from Supabase
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: getProductImageUrl(data.image),
      additionalImages: data.additional_images?.map(getProductImageUrl) || [],
      categoryId: data.category_id,
      inStock: data.in_stock,
      createdAt: data.created_at,
      details: data.details
    };
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
};

// Create or update product in Supabase
export const saveProduct = async (product: Product): Promise<string | null> => {
  try {
    const { id, ...rest } = product;
    const isNew = !id || id === '';
    
    // Prepare data for Supabase
    const productData = {
      id: isNew ? `product-${Date.now()}` : id,
      name: rest.name,
      description: rest.description,
      price: rest.price,
      image: rest.image,
      additional_images: rest.additionalImages,
      category_id: rest.categoryId,
      in_stock: rest.inStock,
      created_at: rest.createdAt || new Date().toISOString(),
      details: rest.details
    };
    
    let result;
    
    if (isNew) {
      // Insert new product
      result = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();
    } else {
      // Update existing product
      result = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select('id')
        .single();
    }
    
    if (result.error) {
      console.error('Error saving product:', result.error);
      return null;
    }
    
    return result.data.id;
  } catch (error) {
    console.error('Error in saveProduct:', error);
    return null;
  }
};

// Delete product from Supabase
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Get product details to delete associated images
    const product = await fetchProductById(id);
    
    if (product) {
      // Delete main image
      if (product.image && product.image !== '/placeholder.svg') {
        await deleteProductImage(product.image);
      }
      
      // Delete additional images
      if (product.additionalImages && product.additionalImages.length > 0) {
        for (const imageUrl of product.additionalImages) {
          await deleteProductImage(imageUrl);
        }
      }
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return false;
  }
};

// Import mock data to Supabase
export const importMockProductsToSupabase = async (
  products: Product[], 
  categories: ProductCategory[]
): Promise<{ productsAdded: number, categoriesAdded: number }> => {
  const results = { productsAdded: 0, categoriesAdded: 0 };
  
  try {
    // Import categories first
    for (const category of categories) {
      const { error } = await supabase
        .from('product_categories')
        .upsert({
          id: category.id,
          name: category.name,
          image: category.image
        }, { onConflict: 'id' });
      
      if (!error) {
        results.categoriesAdded++;
      }
    }
    
    // Then import products
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          additional_images: product.additionalImages,
          category_id: product.categoryId,
          in_stock: product.inStock,
          created_at: product.createdAt,
          details: product.details
        }, { onConflict: 'id' });
      
      if (!error) {
        results.productsAdded++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error importing mock data:', error);
    return results;
  }
};
