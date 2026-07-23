import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real environment, use react-native-dotenv. 
// Hardcoded here temporarily if you haven't set up .env yet.
// services/DatabaseAdapter.ts

const API_URL = 'https://umkejklqekghrrkskgun.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2Vqa2xxZWtnaHJya3NrZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDExOTEsImV4cCI6MjEwMDExNzE5MX0.IQe5oh0eTmBUMucstnFjYMyEtCWsKdWWUwMujhAx9NE';

const supabase = createClient(API_URL, API_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface Listing {
  id: string;
  category: string;
  title: string;
  company: string;
  programs: string[];
  deadline: string;
  term: string;
  location: string;
  description: string;
  logoColor: string;
  coverColor?: string;
}

export const DatabaseAdapter = {
  async fetchAllListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('applicationDeadline', { ascending: true }); // Fixed column name here!

    if (error) throw new Error(error.message);

    // Translate the database columns into the strict format your UI expects
    return data.map((item: any) => ({
      id: item.id,
      category: item.type,
      title: item.titleSv,
      company: item.company,
      programs: item.programs || [],
      deadline: item.applicationDeadline,
      term: item.term,
      location: item.location,
      description: item.descriptionSv,
      logoColor: item.logoColor || '#CCCCCC',
      coverColor: item.coverColor,
    }));
  }
};