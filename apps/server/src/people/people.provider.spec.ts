import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProvider } from './people.provider';
import axios from 'axios';
import { getAverageHeight } from '../utils/parser';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PeopleProvider', () => {
    let provider: PeopleProvider;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PeopleProvider],
        }).compile();

        provider = module.get<PeopleProvider>(PeopleProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchData', () => {
        it('should fetch data and return formatted persons with average height', async () => {
            const mockResponse = {
                data: {
                    results: [
                        { name: 'Luke Skywalker', birth_year: '29BBY', height: '172', homeworld: 'https://swapi.dev/api/planets/1/' },
                        { name: 'Darth Vader', birth_year: '29BBY', height: '202', homeworld: 'https://swapi.dev/api/planets/1/' },
                    ],
                    count: 2,
                },
            };

            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'desert' };
            mockedAxios.get.mockResolvedValueOnce({ data: mockHomeworldResponse });

            const result = await provider.fetchData(1);

            expect(result).toEqual({
                data: [
                    { name: 'Luke Skywalker', birth_year: '29BBY', height: '172', homeworld: 'Tatooine', terrain: 'desert' },
                    { name: 'Darth Vader', birth_year: '29BBY', height: '202', homeworld: 'Tatooine', terrain: 'desert' },
                ],
                totalCount: 2,
                averageHeight: getAverageHeight([
                    { height: '172' },
                    { height: '202' },
                ]),
            });
        });

        it('should handle errors when fetching data', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

            await expect(provider.fetchData(1)).rejects.toThrow('Network Error');
        });
    });

    describe('fetchHomeworld', () => {
        it('should fetch homeworld data and cache it', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'desert' };

            mockedAxios.get.mockResolvedValueOnce({ data: mockHomeworldResponse });

            const result = await provider.fetchHomeworld(homeworldUrl);

            expect(result).toEqual(mockHomeworldResponse);
            expect(provider['homeworldCache'][homeworldUrl]).toEqual(mockHomeworldResponse);
        });

        it('should return cached homeworld data if available', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'desert' };

            provider['homeworldCache'][homeworldUrl] = mockHomeworldResponse;

            const result = await provider.fetchHomeworld(homeworldUrl);

            expect(result).toEqual({ [homeworldUrl]: mockHomeworldResponse });
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });
    });

    describe('fetchHomeworl', () => {
        it('should clear cache if cache duration has passed', async () => {
            jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 400000); // Simulate time passing
            provider['lastCacheUpdate'] = Date.now() - 300000; // Set last cache update to 5 minutes ago

            await provider.fetchHomeworl([{ homeworld: 'https://swapi.dev/api/planets/1/' }]);

            expect(provider['homeworldCache']).toEqual({});
        });

        it('should fetch homeworlds and cache them', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'desert' };

            mockedAxios.get.mockResolvedValueOnce({ data: mockHomeworldResponse });

            await provider.fetchHomeworl([{ homeworld: homeworldUrl }]);

            expect(provider['homeworldCache'][homeworldUrl]).toEqual(mockHomeworldResponse);
        });

        it('should not fetch homeworlds if they are already cached', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'desert' };

            // Pre-fill the cache
            provider['homeworldCache'][homeworldUrl] = mockHomeworldResponse;

            await provider.fetchHomeworl([{ homeworld: homeworldUrl }]);

            expect(mockedAxios.get).not.toHaveBeenCalled();
        });
    });
});

