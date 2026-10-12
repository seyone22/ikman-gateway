import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AdsService } from './ads.service';
import { SearchAdsDto } from './dto/search-ads.dto';
import { AdDetailDto, PaginatedAdsResponseDto } from './dto/ad-response.dto';

@ApiTags('Ads')
@Controller('api/v1/ads')
@UseInterceptors(CacheInterceptor)
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  @CacheTTL(120) // Cache search results for 2 minutes
  @ApiOperation({
    summary: 'Search classified listings',
    description:
      'Search ads with keyword, category, location, min/max price, condition, and sorting (cheapest, expensive, newest). Supports automatic spam-price filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of normalized ads',
    type: PaginatedAdsResponseDto,
  })
  async search(@Query() dto: SearchAdsDto): Promise<PaginatedAdsResponseDto> {
    return this.adsService.searchAds(dto);
  }

  @Get(':slug')
  @CacheTTL(300) // Cache ad details for 5 minutes
  @ApiOperation({
    summary: 'Get single ad details',
    description:
      'Retrieve deep information for an ad including seller contact phone numbers, specs, full images, and shop profile.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ad slug (e.g. "apple-iphone-13-128gb-used-for-sale-colombo-10")',
    example: 'apple-iphone-13-128gb-used-for-sale-colombo-10',
  })
  @ApiResponse({
    status: 200,
    description: 'Normalized ad details',
    type: AdDetailDto,
  })
  async getBySlug(@Param('slug') slug: string): Promise<AdDetailDto> {
    return this.adsService.getAdBySlug(slug);
  }
}
