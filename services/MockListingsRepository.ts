import { IListingsRepository, Listing } from './DatabaseAdapter';

const FIXTURE_LISTINGS: Listing[] = [
  {
    id: 'mock-1',
    category: 'Examensarbete',
    title: 'Data-driven route optimization',
    company: 'Volvo Group',
    programs: ['Mechanical Eng', 'Industrial Eng'],
    deadline: '2026-09-15',
    term: 'HT26',
    location: 'Gothenburg',
    description: 'We are looking for a masters student to explore reinforcement learning approaches for real-time fleet routing across our logistics network.',
    logoColor: '#00ACFF',
  },
  {
    id: 'mock-2',
    category: 'Jobb',
    title: 'Frontend developer',
    company: 'Northvolt',
    programs: ['Computer Science', 'IT'],
    deadline: '2026-08-30',
    term: 'HT26',
    location: 'Remote',
    description: 'Join our team building the next generation of battery manufacturing software.',
    logoColor: '#27AD72',
  },
];

export class MockListingsRepository implements IListingsRepository {
  async fetchAllListings(): Promise<Listing[]> {
    return FIXTURE_LISTINGS;
  }
}

export function createMockListingsRepository(): IListingsRepository {
  return new MockListingsRepository();
}
