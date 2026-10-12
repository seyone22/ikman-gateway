import { Injectable, Logger } from '@nestjs/common';
import { IkmanClientService } from '../ikman/ikman-client.service';
import { IkmanNormalizerService } from '../ikman/ikman-normalizer.service';
import { SearchAdsDto, SortByOption } from './dto/search-ads.dto';
import { AdDetailDto, PaginatedAdsResponseDto } from './dto/ad-response.dto';

@Injectable()
export class AdsService {
  private readonly logger = new Logger(AdsService.name);

  constructor(
    private readonly ikmanClient: IkmanClientService,
    private readonly normalizer: IkmanNormalizerService,
  ) {}

  /**
   * Search classified ads with robust filtering and price sorting.
   */
  async searchAds(dto: SearchAdsDto): Promise<PaginatedAdsResponseDto> {
    const raw = await this.ikmanClient.fetchSerp({
      query: dto.query,
      category: dto.category,
      location: dto.location,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      condition: dto.condition,
      sortBy: dto.sortBy,
      page: dto.page || 1,
    });

    const rawAds = raw.ads || [];
    let normalizedList = rawAds.map((ad) => this.normalizer.normalizeSummary(ad));

    // When sorting by cheapest, filter out Rs. 0/1 dummy spam unless cleanSpam is false
    if (dto.cleanSpam && dto.sortBy === SortByOption.CHEAPEST) {
      normalizedList = normalizedList.filter((ad) => !ad.price.isSpamOrDummy);
    }

    const total = raw.paginationData?.total ?? raw.postedAdCount ?? normalizedList.length;
    const pageSize = raw.paginationData?.pageSize || 25;
    const currentPage = dto.page || 1;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: normalizedList,
      meta: {
        total,
        page: currentPage,
        pageSize,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  /**
   * Get full details of an ad including seller phone numbers.
   */
  async getAdBySlug(slug: string): Promise<AdDetailDto> {
    const raw = await this.ikmanClient.fetchDetails(slug);
    return this.normalizer.normalizeDetails(raw);
  }
}
