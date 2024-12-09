import { Test, TestingModule } from '@nestjs/testing';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

describe('PeopleController', () => {
  let controller: PeopleController;
  let service: PeopleService;
  const mockData = [{ name: 'C-32PO', height: '180', birth_year: '112BBY', homeworld: 'Unknown', terrain: 'Unknown' }];

  const mockPeopleService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPeople: jest.fn((_page: number, _search: string) => {
      return mockData;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeopleController],
      providers: [
        {
          provide: PeopleService,
          useValue: mockPeopleService,
        },
      ],
    }).compile();

    controller = module.get<PeopleController>(PeopleController);
    service = module.get<PeopleService>(PeopleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPeople', () => {
    it('should return an array of people', async () => {
      const page = '1';
      const search = 'C-32PO';
      const result = await controller.getPeople(page, search);
      
      expect(result).toEqual(mockData);
      expect(service.getPeople).toHaveBeenCalledWith(1, search);
    });

    it('should default to page 1 if no page is provided', async () => {
      const search = 'C-32PO';
      const result = await controller.getPeople(undefined, search);
      
      expect(result).toEqual(mockData);
      expect(service.getPeople).toHaveBeenCalledWith(1, search);
    });
  });
});
