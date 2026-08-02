import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_KEY } from '@env';

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

/**
 * Repository contract for the listings data layer. Any backend
 * (Supabase, a mock, a REST adapter) can implement this interface,
 * keeping App.tsx decoupled from the data source.
 */
export interface IListingsRepository {
  fetchAllListings(): Promise<Listing[]>;
}

export class SupabaseListingsRepository implements IListingsRepository {
  private supabase = (() => {
    if (!API_URL || !API_KEY) {
      throw new Error(
        'Missing API_URL or API_KEY. Copy .env.example to .env and fill in your real values.'
      );
    }
    return createClient(API_URL, API_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  })();

  async fetchAllListings(): Promise<Listing[]> {
    const { data, error } = await this.supabase
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
}

export function createSupabaseListingsRepository(): IListingsRepository {
  return new SupabaseListingsRepository();
}
