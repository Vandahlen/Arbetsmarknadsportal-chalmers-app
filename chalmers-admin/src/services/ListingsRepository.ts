import { createClient } from '@supabase/supabase-js';

// Fallback configuration using hardcoded project keys if .env is not yet set
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://umkejklqekghrrkskgun.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2Vqa2xxZWtnaHJya3NrZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDExOTEsImV4cCI6MjEwMDExNzE5MX0.IQe5oh0eTmBUMucstnFjYMyEtCWsKdWWUwMujhAx9NE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ListingData {
  type: 'job' | 'thesis' | 'event';
  titleSv: string;
  titleEn: string;
  descriptionSv: string;
  descriptionEn: string;
  company: string;
  programs: string[];
  location: string;
  status: 'draft' | 'published';
  contactName?: string;
  contactEmail?: string;
  compensationType?: string;
  applicationUrl?: string;
  eventStart?: string;
  eventEnd?: string;
  foodPreferences?: boolean;
  maxCapacity?: number;
}

export const ListingsRepository = {
  async uploadImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  },

  async create(data: ListingData, imageFile?: File): Promise<void> {
    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile);
    }

    const payload = { ...data, imageUrl };

    const { error } = await supabase.from('listings').insert([payload]);
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
};