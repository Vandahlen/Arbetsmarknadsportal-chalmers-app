import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================

type Category = 'Exjobb' | 'Mentorship' | 'Job';

interface Listing {
  id: string;
  category: Category;
  title: string;
  company: string;
  programs: string[];
  deadline: string;
  term: string;
  location: string;
  description: string;
  logoColor: string; // Used as placeholder for company logo
  coverColor?: string; // Used as placeholder for cover photo
}

const MOCK_DATA: Listing[] = [
  {
    id: '1',
    category: 'Exjobb',
    title: 'Machine Learning for Predictive Maintenance',
    company: 'Volvo Group',
    programs: ['Computer Science', 'Data Science'],
    deadline: '2026-10-15',
    term: 'VT27',
    location: 'Gothenburg / Hybrid',
    description: 'Join our cutting-edge research team to develop neural networks that predict hardware failures before they occur. You will be working with large datasets from our global fleet of connected vehicles. Strong background in Python and PyTorch is recommended.',
    logoColor: '#00ACFF',
    coverColor: '#27AD72',
  },
  {
    id: '2',
    category: 'Exjobb',
    title: 'Sustainable Packaging Alternatives',
    company: 'Stora Enso',
    programs: ['Bioengineering', 'Material Science'],
    deadline: '2026-11-01',
    term: 'HT26',
    location: 'Stockholm',
    description: 'An exciting thesis opportunity analyzing the lifecycle of new biodegradable polymers compared to traditional plastics. Laboratory access will be provided.',
    logoColor: '#27AD72',
  },
  {
    id: '3',
    category: 'Mentorship',
    title: 'UX/UI Design Mentorship Program',
    company: 'Spotify',
    programs: ['Interaction Design', 'Software Engineering'],
    deadline: '2026-09-30',
    term: 'HT26',
    location: 'Remote',
    description: 'Get paired with a senior product designer for 6 months. Weekly 1-on-1 sessions, portfolio reviews, and shadowing opportunities.',
    logoColor: '#843690',
  },
  {
    id: '4',
    category: 'Job',
    title: 'Junior React Native Developer',
    company: 'TechNova AB',
    programs: ['Software Engineering', 'IT'],
    deadline: '2026-08-20',
    term: 'Start ASAP',
    location: 'Malmö / On-site',
    description: 'We are looking for a driven graduate to join our mobile team building the next generation of fintech applications.',
    logoColor: '#D8004D',
    coverColor: '#00ACFF',
  }
];

const AVAILABLE_PROGRAMS = [
  'Computer Science', 'Bioengineering', 'Material Science', 
  'Interaction Design', 'Software Engineering', 'IT', 'Data Science'
];

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [currentView, setCurrentView] = useState<'feed' | 'detail' | 'submit'>('feed');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Feed State
  const [activeTab, setActiveTab] = useState<Category>('Exjobb');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Exjobb');
  const [formPrograms, setFormPrograms] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      const matchesTab = item.category === activeTab;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleNavigateDetail = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('detail');
  };

  const handleBackToFeed = () => {
    setSelectedListing(null);
    setCurrentView('feed');
  };

  const toggleProgramSelection = (program: string) => {
    if (formPrograms.includes(program)) {
      setFormPrograms(formPrograms.filter(p => p !== program));
    } else {
      setFormPrograms([...formPrograms, program]);
    }
  };

  // --- VIEWS ---

  const renderFeedView = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Exjobbsportal</Text>
        <TouchableOpacity onPress={() => setCurrentView('submit')}>
          <Text style={styles.secondaryButtonText}>+ Post Ad</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['Exjobb', 'Mentorship', 'Job'] as Category[]).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search keywords, programs, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.warmGrey}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleNavigateDetail(item)}>
            <View style={[styles.logoPlaceholder, { backgroundColor: item.logoColor }]} />
            <View style={styles.cardContent}>
              <Text style={styles.heading2} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.subheading1}>{item.company}</Text>
              <View style={styles.tagContainer}>
                {item.programs.map((prog, idx) => (
                  <Text key={idx} style={styles.label}>{prog.toUpperCase()}</Text>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.paragraph2}>No listings found matching your criteria.</Text>
        }
      />
    </View>
  );

  const renderDetailView = () => {
    if (!selectedListing) return null;
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackToFeed} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.detailScrollContent}>
          {/* Cover Photo */}
          <View style={[styles.coverPhotoPlaceholder, { backgroundColor: selectedListing.coverColor || COLORS.lightGrey }]} />
          
          <View style={styles.detailHeaderLayout}>
             <View style={[styles.detailLogoPlaceholder, { backgroundColor: selectedListing.logoColor }]} />
             <View style={styles.detailHeaderContent}>
               <Text style={styles.heading1}>{selectedListing.title}</Text>
               <Text style={[styles.subheading1, { color: COLORS.warmGrey, marginTop: 4 }]}>
                 {selectedListing.company}
               </Text>
             </View>
          </View>

          {/* Meta Information Row */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.caption2}>DEADLINE</Text>
              <Text style={styles.caption1}>{selectedListing.deadline}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.caption2}>TERM</Text>
              <Text style={styles.caption1}>{selectedListing.term}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.caption2}>LOCATION</Text>
              <Text style={styles.caption1}>{selectedListing.location}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.heading2}>About the Role</Text>
          <Text style={styles.paragraph1}>{selectedListing.description}</Text>

          <View style={styles.spacer} />

          {/* Primary Action */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => Alert.alert('Success', 'Application flow initiated!')}
          >
            <Text style={styles.primaryButtonText}>Contact / Apply</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderSubmitView = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBackToFeed} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>← Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.submitScrollContent}>
        <Text style={styles.title}>Post an Ad</Text>
        
        <Text style={styles.caption1}>CATEGORY</Text>
        <View style={styles.tabContainer}>
          {(['Exjobb', 'Mentorship', 'Job'] as Category[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, formCategory === tab && styles.tabButtonActive]}
              onPress={() => setFormCategory(tab)}
            >
              <Text style={[styles.tabText, formCategory === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.caption1}>TITLE</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="e.g. Frontend Developer Intern"
          value={formTitle}
          onChangeText={setFormTitle}
        />

        <Text style={styles.caption1}>DESCRIPTION</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe the role, requirements, and benefits..."
          multiline
          numberOfLines={6}
          value={formDescription}
          onChangeText={setFormDescription}
          textAlignVertical="top"
        />

        <Text style={styles.caption1}>TARGETED PROGRAMS</Text>
        <View style={styles.pillContainer}>
          {AVAILABLE_PROGRAMS.map(prog => {
            const isSelected = formPrograms.includes(prog);
            return (
              <TouchableOpacity 
                key={prog} 
                style={[styles.pillButton, isSelected && styles.pillButtonActive]}
                onPress={() => toggleProgramSelection(prog)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {prog}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => {
            Alert.alert('Listing Posted', 'Your listing has been submitted successfully.');
            handleBackToFeed();
          }}
        >
          <Text style={styles.primaryButtonText}>Submit Ad</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Wrap inside SafeAreaProvider to correctly power the context-based SafeAreaView
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        {currentView === 'feed' && renderFeedView()}
        {currentView === 'detail' && renderDetailView()}
        {currentView === 'submit' && renderSubmitView()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ==========================================
// 3. DESIGN SYSTEM & STYLESHEET
// ==========================================

const COLORS = {
  primaryBlue: '#00ACFF',
  purple: '#843690',
  red: '#D8004D',
  matteRed: '#F8686D',
  orange: '#F86600',
  warmGrey: '#634C3D',
  green: '#27AD72',
  turquoise: '#7CCDC2',
  white: '#FFFFFF',
  lightGrey: '#F3F4F6',
  borderGrey: '#E5E7EB',
  darkText: '#1F2937'
};

// Assuming 'Open Sans' is linked. Falls back to system sans-serif.
const FONT_FAMILY = 'Open Sans'; 

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // Typography
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 16,
  },
  heading1: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  heading2: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  subheading1: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.warmGrey,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  caption1: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warmGrey,
    marginTop: 16,
    marginBottom: 8,
  },
  caption2: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.warmGrey,
    opacity: 0.7,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.orange,
    marginRight: 8,
    marginTop: 4,
  },
  paragraph1: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.darkText,
    lineHeight: 24,
    marginTop: 8,
  },
  paragraph2: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.warmGrey,
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  secondaryButtonText: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },

  // Layout & Components
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  spacer: {
    height: 32,
  },
  
  // Feed View
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGrey,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryBlue,
  },
  tabText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warmGrey,
  },
  tabTextActive: {
    color: COLORS.primaryBlue,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: COLORS.darkText,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Detail View
  detailScrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  coverPhotoPlaceholder: {
    height: 160,
    borderRadius: 12,
    marginBottom: -30, 
  },
  detailHeaderLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  detailLogoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.white,
    marginRight: 16,
  },
  detailHeaderContent: {
    flex: 1,
    paddingBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  metaItem: {
    flex: 1,
  },

  // Submit View
  submitScrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  textInput: {
    backgroundColor: COLORS.lightGrey,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    borderRadius: 8,
    padding: 12,
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 8,
  },
  textArea: {
    height: 120,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  pillButton: {
    backgroundColor: COLORS.lightGrey,
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pillButtonActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  pillText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: COLORS.darkText,
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});