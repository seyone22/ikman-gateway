import { Test, TestingModule } from '@nestjs/testing';
import { AdsService } from './ads.service';
import { IkmanClientService } from '../ikman/ikman-client.service';
import { IkmanNormalizerService } from '../ikman/ikman-normalizer.service';
import { SortByOption } from './dto/search-ads.dto';

describe('AdsService', () => {
  let service: AdsService;
  let clientMock: Partial<IkmanClientService>;

  beforeEach(async () => {
    clientMock = {
      fetchSerp: jest.fn().mockResolvedValue({
        ads: [
          {
            id: '1',
            slug: 'ad-0-rupees',
            title: 'Spam Ad 0',
            price: 'Rs 0',
          },
          {
            id: '2',
            slug: 'ad-1-rupee',
            title: 'Spam Ad 1',
            price: 'Rs 1',
          },
          {
            id: '3',
            slug: 'ad-real',
            title: 'Real Phone',
            price: 'Rs 15,000',
          },
        ],
        paginationData: {
          total: 3,
          page: 1,
          pageSize: 25,
          totalPages: 1,
        },
      }),
      fetchDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdsService,
        IkmanNormalizerService,
        {
          provide: IkmanClientService,
          useValue: clientMock,
        },
      ],
    }).compile();

    service = module.get<AdsService>(AdsService);
  });

  it('should filter out spam Rs 0 / Rs 1 ads when sorting by cheapest with cleanSpam=true', async () => {
    const response = await service.searchAds({
      category: 'mobile-phones',
      sortBy: SortByOption.CHEAPEST,
      cleanSpam: true,
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].title).toBe('Real Phone');
    expect(response.data[0].price.amount).toBe(15000);
  });

  it('should preserve all ads if cleanSpam is false', async () => {
    const response = await service.searchAds({
      category: 'mobile-phones',
      sortBy: SortByOption.CHEAPEST,
      cleanSpam: false,
    });

    expect(response.data).toHaveLength(3);
  });
});
