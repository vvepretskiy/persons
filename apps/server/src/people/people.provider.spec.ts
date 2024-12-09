import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProvider } from './people.provider';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { getAverageHeight } from '../utils/parser';

jest.mock('axios');
jest.mock('../utils/parser');

describe('PeopleProvider', () => {
    let provider: PeopleProvider;
    let cacheManager: { get: jest.Mock; set: jest.Mock };

    beforeEach(async () => {
        cacheManager = {
            get: jest.fn(),
            set: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PeopleProvider,
                {
                    provide: CACHE_MANAGER,
                    useValue: cacheManager,
                },
            ],
        }).compile();

        provider = module.get<PeopleProvider>(PeopleProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchData', () => {
        it('should fetch data and return formatted people', async () => {
            const mockResponse = {
                data: {
                    results: [
                        {
                            name: 'Luke Skywalker',
                            height: '172',
                            homeworld: 'https://swapi.dev/api/planets/1/',
                            birth_year: '19BBY', // Add the required field
                        },
                    ],
                    count: 1,
                },
            };

            (axios.get as jest.Mock).mockResolvedValue(mockResponse);
            (getAverageHeight as jest.Mock).mockReturnValue(172);
            jest.spyOn(provider, 'fetchHomeworld').mockResolvedValue({ name: 'Tatooine', terrain: 'Desert' });

            cacheManager.get.mockResolvedValueOnce({ name: 'Tatooine', terrain: 'Desert' });

            const result = await provider.fetchData(1);

            expect(result).toEqual({
                data: [
                    {
                        name: 'Luke Skywalker',
                        height: '172',
                        homeworld: 'Unknown',
                        terrain: 'Unknown',
                        birth_year: '19BBY',
                    },
                ],
                totalCount: 1,
                averageHeight: 172,
            });

            expect(axios.get).toHaveBeenCalledWith('https://swapi.dev/api/people/?page=1');
        });
    });

    describe('fetchHomeworld', () => {
        it('should fetch homeworld data and cache it', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            const mockHomeworldResponse = { name: 'Tatooine', terrain: 'Desert' };

            cacheManager.get.mockResolvedValue(null);
            (axios.get as jest.Mock).mockResolvedValue({ data: mockHomeworldResponse });

            const result = await provider.fetchHomeworld(homeworldUrl);

            expect(result).toEqual({ [homeworldUrl]: mockHomeworldResponse });
            expect(cacheManager.set).toHaveBeenCalledWith(homeworldUrl, mockHomeworldResponse);
        });

        it('should return default values if fetching homeworld fails', async () => {
            const homeworldUrl = 'https://swapi.dev/api/planets/1/';
            cacheManager.get.mockResolvedValue(null);
            (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

            const result = await provider.fetchHomeworld(homeworldUrl);

            expect(result).toEqual({ [homeworldUrl]: { name: 'Unknown', terrain: 'Unknown' } });
            expect(cacheManager.set).not.toHaveBeenCalled();
        });
    });

});
