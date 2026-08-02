import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy chalmers-admin/.env.example to chalmers-admin/.env and fill in your real values.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ListingData {
  id?: string;
  type: 'event' | 'thesis' | 'job' | 'mentorship';
  titleSv: string;
  titleEn: string;
  descriptionSv: string;
  descriptionEn: string;
  company: string;
  programs: string[];
  location: string;
  status: 'draft' | 'published' | 'archived';
  workFormat?: 'remote' | 'onsite' | 'hybrid';
  workLoad?: 'full-time' | 'part-time';
  keywords?: string;
  applicationDeadline?: string;
  term?: 'HT' | 'VT' | 'Båda';
  eventStart?: string;
  eventEnd?: string;
  foodPreferences?: boolean;
  applicationUrl?: string;
  logoUrl?: string;
  coverUrl?: string;
}

export const ListingsRepository = {
  async uploadImage(file: File, folder: string): Promise<string | null> {
    try {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const fileName = `${Math.random()}.${compressedFile.name.split('.').pop()}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage.from('media').upload(filePath, compressedFile);
      if (error) throw error;

      return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  },

  async create(data: ListingData, logoFile?: File | null, coverFile?: File | null): Promise<void> {
    const logoUrl = logoFile ? await this.uploadImage(logoFile, 'logos') : null;
    const coverUrl = coverFile ? await this.uploadImage(coverFile, 'covers') : null;
    const { error } = await supabase.from('listings').insert([{ ...data, logoUrl, coverUrl }]);
    if (error) throw new Error(error.message);
  },

  async getAll(): Promise<ListingData[]> {
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as ListingData[];
  },

  async update(id: string, data: ListingData, logoFile?: File | null, coverFile?: File | null): Promise<void> {
    const updates = { ...data };
    if (logoFile) updates.logoUrl = await this.uploadImage(logoFile, 'logos') || undefined;
    if (coverFile) updates.coverUrl = await this.uploadImage(coverFile, 'covers') || undefined;
    const { error } = await supabase.from('listings').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
};