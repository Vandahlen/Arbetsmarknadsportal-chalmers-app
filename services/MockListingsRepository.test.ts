import { createMockListingsRepository } from './MockListingsRepository';

test('resolves the fixture listing list', async () => {
  const repository = createMockListingsRepository();
  const listings = await repository.fetchAllListings();

  expect(listings.length).toBe(2);
  expect(listings[0]).toMatchObject({
    id: 'mock-1',
    category: 'Examensarbete',
    company: 'Volvo Group',
  });
});
