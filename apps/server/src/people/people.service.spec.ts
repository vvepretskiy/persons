import { Test, TestingModule } from '@nestjs/testing';
import { PeopleService } from './people.service';
import { PeopleCache } from './people.cache';
import { People } from '@persons/shared'; // Adjust the import path as necessary

describe('PeopleService', () => {
  let service: PeopleService;
  let cache: PeopleCache;

  const mockPeopleCache = {
    tryToGet: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleService,
        {
          provide: PeopleCache,
          useValue: mockPeopleCache,
        },
      ],
    }).compile();

    service = module.get<PeopleService>(PeopleService);
    cache = module.get<PeopleCache>(PeopleCache);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPeople', () => {
    it('should return people from cache', async () => {
      const mockPeople: People = {
        data: [{ name: 'Luke Skywalker', height: '172' }],
        totalCount: 1,
        averageHeight: '172',
      };

      mockPeopleCache.tryToGet.mockResolvedValue(mockPeople);

      const result = await service.getPeople(1, 'Luke');

      expect(result).toEqual(mockPeople);
      expect(cache.tryToGet).toHaveBeenCalledWith(1, 'Luke');
    });

    it('should handle errors from cache', async () => {
      mockPeopleCache.tryToGet.mockRejectedValue(new Error('Cache Error'));

      await expect(service.getPeople(1, 'Luke')).rejects.toThrow('Cache Error');
    });
  });
});
