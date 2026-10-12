import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TaxonomyService } from './taxonomy.service';
import { CategoryDto, LocationDto } from './dto/taxonomy-response.dto';

@ApiTags('Taxonomy')
@Controller('api/v1')
@UseInterceptors(CacheInterceptor)
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('categories')
  @CacheTTL(3600) // Cache taxonomy for 1 hour
  @ApiOperation({
    summary: 'List category hierarchy',
    description: 'Returns the full category tree with parent categories and subcategory slugs/IDs.',
  })
  @ApiQuery({ name: 'locale', required: false, example: 'en' })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  async getCategories(@Query('locale') locale?: string): Promise<CategoryDto[]> {
    return this.taxonomyService.getCategories(locale);
  }

  @Get('locations')
  @CacheTTL(3600) // Cache taxonomy for 1 hour
  @ApiOperation({
    summary: 'List location hierarchy',
    description: 'Returns districts and cities with their respective slugs and IDs.',
  })
  @ApiQuery({ name: 'locale', required: false, example: 'en' })
  @ApiResponse({ status: 200, type: [LocationDto] })
  async getLocations(@Query('locale') locale?: string): Promise<LocationDto[]> {
    return this.taxonomyService.getLocations(locale);
  }
}
