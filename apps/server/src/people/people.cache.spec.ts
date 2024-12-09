import { Test, TestingModule } from '@nestjs/testing';
import { PeopleCache } from './people.cache';
import { PeopleProvider } from './people.provider';
import { People } from '@persons/shared';

const mockPeopleProvider = {
    fetchData: jest.fn(),
};

describe('PeopleCache', () => {
    let peopleCache: PeopleCache;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PeopleCache,
                { provide: PeopleProvider, useValue: mockPeopleProvider },
            ],
        }).compile();

        peopleCache = module.get<PeopleCache>(PeopleCache);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(peopleCache).toBeDefined();
    });

    describe('tryToGet', () => {
        it('should fetch data if not in cache', async () => {
            const page = 1;
            const mockData: People = { totalCount: 20, data: [] };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);

            const result = await peopleCache.tryToGet(page);

            expect(mockPeopleProvider.fetchData).toHaveBeenCalledWith(page);
            expect(result).toEqual(mockData);
        });

        it('should return cached data if available', async () => {
            const page = 1;
            const mockData: People = { totalCount: 20, data: [] };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);
            await peopleCache.tryToGet(page);

            const result = await peopleCache.tryToGet(page);

            expect(mockPeopleProvider.fetchData).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockData);
        });

        it('should reset cache after cache duration', async () => {
            const page = 1;
            const mockData: People = { totalCount: 20, data: [] };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);
            await peopleCache.tryToGet(page);

            jest.spyOn(Date, 'now').mockImplementationOnce(() => Date.now() + 40001);

            const result = await peopleCache.tryToGet(page);

            expect(mockPeopleProvider.fetchData).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockData);
        });
    });

    describe('tryToGetFilterCache', () => {
        it('should filter data based on search term', async () => {
            const page = 1;
            const searchTerm = 'C-3PO';
            const mockData: People = {
                totalCount: 20,
                data: [
                    { name: 'C-3PO', height: '180', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' },
                    { name: 'c-3PO', height: '160', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' }
                ],
            };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);
            await peopleCache.tryToGet(page);

            const result = await peopleCache.tryToGet(page, searchTerm);
            const distinctValues = [...new Set(result.data.map(({ name }) => name))];
            expect(distinctValues).toEqual(['C-3PO']);
        });

        it('should return empty data if no matches found', async () => {
            const page = 1;
            const searchTerm = 'Nonexistent';
            const mockData: People = {
                totalCount: 20,
                data: [
                    { name: 'C-31PO', height: '180', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' },
                    { name: 'C-33pO', height: '160', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' }
                ],
            };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);
            await peopleCache.tryToGet(page);

            const result = await peopleCache.tryToGet(page, searchTerm);

            expect(result.data).toEqual([]);
            expect(result.totalCount).toBe(0);
        });
    });

    describe('fetch', () => {
        it('should fetch data for multiple pages in the background', async () => {
            const pageCount = 3;
            const mockData: People = { totalCount: 30, data: [] };
            mockPeopleProvider.fetchData.mockResolvedValueOnce(mockData);
            mockPeopleProvider.fetchData.mockResolvedValueOnce(mockData);
            mockPeopleProvider.fetchData.mockResolvedValueOnce(mockData);

            await peopleCache.fetch(1, true);

            expect(mockPeopleProvider.fetchData).toHaveBeenCalledTimes(pageCount);
        });

        it('should fetch data for a single page if not cached', async () => {
            const page = 1;
            const mockData: People = { totalCount: 20, data: [] };
            mockPeopleProvider.fetchData.mockResolvedValue(mockData);

            await peopleCache.fetch(page);

            expect(mockPeopleProvider.fetchData).toHaveBeenCalledWith(page);
            expect(peopleCache['peoplePageCache'][page]).toEqual(mockData);
        });
    });
});
