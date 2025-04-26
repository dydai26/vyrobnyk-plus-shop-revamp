
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
  const { data } = supabase.storage.from('news').getPublicUrl(path);
  return data?.publicUrl || '';
};
