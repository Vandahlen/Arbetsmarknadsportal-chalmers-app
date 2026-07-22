// ==========================================
// App.tsx 
// (Read-Only, Dark Mode, Bilingual, React Nav, Auto-Filter & Dynamic Tabs)
// ==========================================

import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ScrollView, StatusBar, ActivityIndicator, useColorScheme, Image
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// --- 1. HARDCODED DATABASE CONFIGURATION (BYPASS) ---
const SUPABASE_URL = 'https://umkejklqekghrrkskgun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta2Vqa2xxZWtnaHJya3NrZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDExOTEsImV4cCI6MjEwMDExNzE5MX0.IQe5oh0eTmBUMucstnFjYMyEtCWsKdWWUwMujhAx9NE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// --- 2. TYPES, THEME & DYNAMIC MAPPINGS ---

// Chalmers Labor Market Committees mapped by program code
const PROGRAM_COMMITTEES: Record<string, string> = {
  'D': 'DAG',
  'IT': 'snIT',
  'F': 'FARM',
  'M': 'MARM',
  'V': 'VARB',
  'Z': 'ZARM',
  'K': 'KARM',
  'I': 'IARM',
  'E': 'E-ARM', 
};

// Fallback generator in case a new program is added
const getCommitteeName = (program: string) => 
  PROGRAM_COMMITTEES[program.toUpperCase()] || `${program.toUpperCase()}-ARM`;

// Standard aliases for database normalization
const CATEGORY_ALIASES: Record<string, string[]> = {
  Examensarbete: ['examensarbete', 'thesis'],
  Mentorskap: ['mentorskap', 'mentorship'],
  Jobb: ['jobb', 'job'],
  CHARM: ['charm'],
};

const normalizeCategory = (value: string): string => {
  const normalizedValue = value.trim().toLowerCase();
  for (const [category, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some(alias => normalizedValue.includes(alias))) {
      return category;
    }
  }
  return value.trim(); 
};

interface Listing {
  id: string;
  type: string;
  titleSv: string;
  titleEn: string;
  descriptionSv: string;
  descriptionEn: string;
  company: string;
  programs: string[];
  location: string;
  applicationDeadline: string | null;
  term: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

export type RootStackParamList = {
  Feed: undefined;
  Detail: { listing: Listing };
};

const FONT_FAMILY = 'System'; 

const BRAND_COLORS = {
  blue: '#00ACFF',
  orange: '#FF8C00',
  red: '#FF3B30',
};

const getTheme = (isDark: boolean) => ({
  background: isDark ? '#121212' : '#FFFFFF',
  card: isDark ? '#634C3D' : '#FFFFFF',
  text: isDark ? '#FFFFFF' : '#1F2937',
  subText: isDark ? '#A0A0A0' : '#634C3D',
  border: isDark ? '#333333' : '#E5E7EB',
  inputBg: isDark ? '#2C2C2C' : '#F3F4F6',
  primary: BRAND_COLORS.blue,
  orange: BRAND_COLORS.orange,
});

// --- 3. BILINGUAL SUPPORT (i18n Context) ---
const translations = {
  en: {
    title: 'Job Market',
    search: 'Search keywords, programs, location...',
    about: 'About the Role',
    apply: 'Apply externally',
    back: 'Back',
    deadline: 'DEADLINE',
    term: 'TERM',
    location: 'LOCATION',
    empty: 'No listings found matching your criteria.',
    langToggle: 'SV',
    categories: {
      Examensarbete: 'Thesis',
      Mentorskap: 'Mentorship',
      Jobb: 'Job',
      CHARM: 'CHARM'
    } as Record<string, string>
  },
  sv: {
    title: 'Arbetsmarknad',
    search: 'Sök nyckelord, program, plats...',
    about: 'Om Rollen',
    apply: 'Ansök externt',
    back: 'Tillbaka',
    deadline: 'DEADLINE',
    term: 'TERMIN',
    location: 'PLATS',
    empty: 'Inga annonser hittades.',
    langToggle: 'EN',
    categories: {
      Examensarbete: 'Examensarbete',
      Mentorskap: 'Mentorskap',
      Jobb: 'Jobb',
      CHARM: 'CHARM'
    } as Record<string, string>
  }
};

type Language = 'en' | 'sv';
const I18nContext = createContext({
  t: translations.en,
  lang: 'en' as Language,
  toggleLang: () => {},
});

// --- 4. CUSTOM HOOK (READ-ONLY FETCH) ---
const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .order('applicationDeadline', { ascending: true }); // <-- Changed from 'deadline' to 'applicationDeadline'

      if (fetchError) throw new Error(fetchError.message);
      setListings(data as Listing[] || []);
    } catch (err: any) {
      setError(err.message || 'Could not connect to the database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { listings, isLoading, error, refreshListings: loadData };
};

// --- 5. SCREENS ---
type FeedProps = NativeStackScreenProps<RootStackParamList, 'Feed'>;
type DetailProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const FeedScreen: React.FC<FeedProps> = ({ navigation }) => {
  const { listings, isLoading, error } = useListings();
  const [activeTab, setActiveTab] = useState<string>('Examensarbete');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { t, lang, toggleLang } = useContext(I18nContext);
  const theme = getTheme(useColorScheme() === 'dark');

  // --- AUTOMATIC PROGRAM FILTER & DYNAMIC TABS ---
  const userProgram = 'D'; // Hardcoded for testing. Replace with User Context later.
  
  const dynamicTabs = useMemo(() => {
    const committeeTab = getCommitteeName(userProgram);
    return ['Examensarbete', 'Mentorskap', 'Jobb', 'CHARM', committeeTab];
  }, [userProgram]);

  const filteredData = useMemo(() => {
    return listings.filter(item => {
      const matchesTab = normalizeCategory(item.type).toLowerCase() === activeTab.toLowerCase();
      const localizedTitle = (lang === 'sv' ? item.titleSv : item.titleEn) ?? '';
      const matchesSearch = localizedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.company ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = item.programs?.some(p => p.toLowerCase() === userProgram.toLowerCase());

      return matchesTab && matchesSearch && matchesProgram;
    });
  }, [listings, activeTab, searchQuery, userProgram, lang]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{t.title}</Text>
        <TouchableOpacity onPress={toggleLang}>
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t.langToggle}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {dynamicTabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.primary : theme.subText }]}>
                {t.categories[tab] || tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, color: theme.text }]}
          placeholder={t.search}
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: BRAND_COLORS.red }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={[styles.paragraph1, { color: theme.subText, textAlign: 'center' }]}>{t.empty}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('Detail', { listing: item })}
            >
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.logoPlaceholder} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: theme.border }]} />
              )}
              <View style={styles.cardContent}>
                <Text style={[styles.heading2, { color: theme.text }]} numberOfLines={2}>{lang === 'sv' ? item.titleSv : item.titleEn}</Text>
                <Text style={[styles.subheading1, { color: theme.subText }]}>{item.company}</Text>
                <View style={styles.tagContainer}>
                  {item.programs?.map((prog, idx) => (
                    <Text key={idx} style={[styles.label, { color: theme.orange }]}>{prog.toUpperCase()}</Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const DetailScreen: React.FC<DetailProps> = ({ route, navigation }) => {
  const { listing } = route.params;
  const { t, lang } = useContext(I18nContext);
  const theme = getTheme(useColorScheme() === 'dark');
  const title = lang === 'sv' ? listing.titleSv : listing.titleEn;
  const description = lang === 'sv' ? listing.descriptionSv : listing.descriptionEn;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>← {t.back}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        {listing.coverUrl ? (
          <Image source={{ uri: listing.coverUrl }} style={styles.coverPhotoPlaceholder} />
        ) : (
          <View style={[styles.coverPhotoPlaceholder, { backgroundColor: theme.border }]} />
        )}
        <View style={styles.detailHeaderLayout}>
           {listing.logoUrl ? (
             <Image source={{ uri: listing.logoUrl }} style={[styles.detailLogoPlaceholder, { borderColor: theme.background }]} />
           ) : (
             <View style={[styles.detailLogoPlaceholder, { backgroundColor: theme.border, borderColor: theme.background }]} />
           )}
           <View style={styles.detailHeaderContent}>
             <Text style={[styles.heading1, { color: theme.text }]}>{title}</Text>
             <Text style={[styles.subheading1, { color: theme.subText, marginTop: 4 }]}>{listing.company}</Text>
           </View>
        </View>

        <View style={[styles.metaContainer, { backgroundColor: theme.inputBg }]}>
          <View style={styles.metaItem}>
            <Text style={[styles.caption2, { color: theme.subText }]}>{t.deadline}</Text>
            <Text style={[styles.caption1, { color: theme.text }]}>{listing.applicationDeadline ?? '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.caption2, { color: theme.subText }]}>{t.term}</Text>
            <Text style={[styles.caption1, { color: theme.text }]}>{listing.term ?? '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.caption2, { color: theme.subText }]}>{t.location}</Text>
            <Text style={[styles.caption1, { color: theme.text }]}>{listing.location}</Text>
          </View>
        </View>

        <Text style={[styles.heading2, { color: theme.text }]}>{t.about}</Text>
        <Text style={[styles.paragraph1, { color: theme.text }]}>{description}</Text>
        
        <View style={styles.spacer} />
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.primaryButtonText}>{t.apply}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- 6. NAVIGATION ORCHESTRATOR ---
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const isDark = useColorScheme() === 'dark';
  
  const [lang, setLang] = useState<Language>('sv'); 
  const toggleLang = () => setLang(prev => prev === 'en' ? 'sv' : 'en');
  
  return (
    <I18nContext.Provider value={{ t: translations[lang], lang, toggleLang }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </I18nContext.Provider>
  );
}

// --- 7. BASE STYLESHEET (ALIGNED WITH GRAPHICAL PROFILE) ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: '700' },
  heading1: { fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: '700' },
  heading2: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  subheading1: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  caption1: { fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  caption2: { fontFamily: FONT_FAMILY, fontSize: 10, fontWeight: '600', opacity: 0.7, textTransform: 'uppercase' },
  label: { fontFamily: FONT_FAMILY, fontSize: 10, fontWeight: '700', marginRight: 8, marginTop: 4, textTransform: 'uppercase' },
  paragraph1: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '400', lineHeight: 24, marginTop: 8 },
  paragraph2: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '400', lineHeight: 20 },
  primaryButton: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: { paddingVertical: 8, paddingHorizontal: 0 },
  secondaryButtonText: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  spacer: { height: 32 },
  
  tabScrollContent: { paddingHorizontal: 20, paddingBottom: 0 },
  tabButton: { paddingVertical: 12, marginRight: 24 },
  tabText: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '600' },
  
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchInput: { borderRadius: 8, padding: 12, fontFamily: FONT_FAMILY, fontSize: 13 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 8, marginRight: 16 },
  cardContent: { flex: 1 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8, padding: 16, marginBottom: 24 },
  metaItem: { flex: 1 },
  detailScrollContent: { padding: 20, paddingBottom: 60 },
  coverPhotoPlaceholder: { height: 160, borderRadius: 12, marginBottom: -30 },
  detailHeaderLayout: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24, paddingHorizontal: 12 },
  detailLogoPlaceholder: { width: 72, height: 72, borderRadius: 12, borderWidth: 3, marginRight: 16 },
  detailHeaderContent: { flex: 1, paddingBottom: 4 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});