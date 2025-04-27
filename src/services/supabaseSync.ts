import { supabase } from "@/lib/supabase";
import { mockNewsArticles } from "./mockData";

export interface SyncStats {
  uploaded: number;
  updated: number;
  deleted: number;
  errors: number;
}

/**
 * Service for handling data synchronization with Supabase
 */
export const SupabaseSync = {
  /**
   * Create the news table in Supabase if it doesn't exist
   */
  async createNewsTable(): Promise<boolean> {
    try {
      // Check if the news table exists
      const { error } = await supabase
        .from('news')
        .select('count');
      
      if (error) {
        console.log('News table does not exist, creating...');
        
        // Create the news table using SQL query
        const { error: createError } = await supabase.rpc('pgSQL', {
          query: `
            CREATE TABLE IF NOT EXISTS news (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              summary TEXT,
              date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              author TEXT,
              main_image TEXT,
              images_urls TEXT[]
            );
            
            -- Спочатку видалимо існуючі політики, щоб уникнути конфліктів
            DROP POLICY IF EXISTS "Дозволити анонімне читання" ON news;
            DROP POLICY IF EXISTS "Дозволити авторизованим користувачам повний доступ" ON news;
            
            -- Створимо нові політики, які дозволяють повний доступ для всіх
            -- Дозвіл на SELECT для всіх
            CREATE POLICY "Дозволити читання всім" 
            ON news FOR SELECT 
            USING (true);
            
            -- Дозвіл на INSERT для всіх
            CREATE POLICY "Дозволити додавання всім" 
            ON news FOR INSERT 
            WITH CHECK (true);
            
            -- Дозвіл на UPDATE для всіх
            CREATE POLICY "Дозволити оновлення всім" 
            ON news FOR UPDATE 
            USING (true);
            
            -- Дозвіл на DELETE для всіх
            CREATE POLICY "Дозволити видалення всім" 
            ON news FOR DELETE 
            USING (true);
          `
        });
        
        if (createError) {
          console.error('Error creating news table:', createError);
          return false;
        }
        
        return true;
      }
      
      return true; // Table already exists
    } catch (error) {
      console.error('Error checking/creating news table:', error);
      return false;
    }
  },
  
  /**
   * Synchronize local news data with Supabase
   */
  async syncNews(): Promise<SyncStats> {
    const stats: SyncStats = {
      uploaded: 0,
      updated: 0,
      deleted: 0,
      errors: 0
    };

    try {
      // First ensure the table exists
      const tableCreated = await this.createNewsTable();
      if (!tableCreated) {
        throw new Error("Failed to create news table");
      }
      
      // Get all news from Supabase
      const { data: existingNews, error: fetchError } = await supabase
        .from('news')
        .select('id, title');

      if (fetchError) throw fetchError;

      // Process local mock data
      for (const article of mockNewsArticles) {
        // Check if article already exists in Supabase
        const existingArticle = existingNews?.find(item => item.id === article.id);

        if (existingArticle) {
          // Update existing article
          const { error: updateError } = await supabase
            .from('news')
            .update({
              title: article.title,
              content: article.content,
              summary: article.summary,
              date: article.date,
              author: article.author,
              main_image: article.image,
              images_urls: article.images
            })
            .eq('id', article.id);

          if (updateError) {
            stats.errors++;
            console.error('Update error:', updateError);
          } else {
            stats.updated++;
          }
        } else {
          // Insert new article
          const { error: insertError } = await supabase
            .from('news')
            .insert({
              id: article.id,
              title: article.title,
              content: article.content,
              summary: article.summary,
              date: article.date,
              author: article.author,
              main_image: article.image,
              images_urls: article.images
            });

          if (insertError) {
            stats.errors++;
            console.error('Insert error:', insertError);
          } else {
            stats.uploaded++;
          }
        }
      }

      // Handle deletions (items in Supabase that aren't in local data)
      if (existingNews) {
        const localIds = mockNewsArticles.map(article => article.id);
        const toDelete = existingNews.filter(item => !localIds.includes(item.id));

        for (const item of toDelete) {
          const { error: deleteError } = await supabase
            .from('news')
            .delete()
            .eq('id', item.id);

          if (deleteError) {
            stats.errors++;
            console.error('Delete error:', deleteError);
          } else {
            stats.deleted++;
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  },

  /**
   * Check connection to Supabase
   */
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('news').select('count');
      
      // If error is specific to table not existing, that's okay
      if (error && error.code === '42P01') {
        return true; // Table doesn't exist but connection is fine
      }
      
      return !error;
    } catch {
      return false;
    }
  },
  
  /**
   * Create a storage bucket for news images
   */
  async createStorageBucket(): Promise<boolean> {
    try {
      const { error } = await supabase.storage.createBucket('news', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (error) {
        // If the error message indicates the bucket already exists, that's fine
        if (error.message && error.message.includes('already exists')) {
          console.log('News storage bucket already exists');
          return true;
        }
        console.error('Error creating storage bucket:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating storage bucket:', error);
      return false;
    }
  },

  getPublicImageUrl: (path: string) => {
    if (!path) return '';
    
    // Якщо шлях вже повний URL, просто поверніть його
    if (path.startsWith('http')) return path;
    
    // Інакше сформуйте URL через Supabase
    const { data } = supabase.storage.from('news').getPublicUrl(path);
    return data?.publicUrl || '';
  }
};

export default SupabaseSync; 