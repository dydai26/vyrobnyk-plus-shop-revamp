import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exfsaxzpwqfxsxinrkbz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZnNheHpwd3FmeHN4aW5ya2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTA3MTYsImV4cCI6MjA2MTA2NjcxNn0.u_a0KplU2mueKCJXbSsAOc5kjBjWEQmvSpmDPCXNktU';

// Creating a client with storage options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Adding global headers to authenticate storage operations
  global: {
    headers: {
      Authorization: `Bearer ${supabaseKey}`
    }
  }
});

// Helper function to get public URL for images
export const getPublicImageUrl = (path: string) => {
  if (!path) return '';
  
  // If path is already a full URL, return it as is
  if (path.startsWith('http')) return path;
  
  // If path starts with "/", remove it as Supabase doesn't expect leading slash
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  const { data } = supabase.storage.from('news').getPublicUrl(cleanPath);
  return data?.publicUrl || '';
};

// Helper function to upload an image to the news bucket
export const uploadImage = async (file: File, fileName?: string): Promise<string | null> => {
  try {
    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('news')
      .upload(uniqueFileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    return getPublicImageUrl(data.path);
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
};

// Helper function to delete an image from the news bucket
export const deleteImage = async (path: string): Promise<boolean> => {
  if (!path) return false;
  
  try {
    // Extract the file path from the URL if it's a public URL
    let filePath = path;
    if (path.includes(supabaseUrl)) {
      filePath = path.split('/').pop() || '';
    }
    
    const { error } = await supabase.storage
      .from('news')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
};
