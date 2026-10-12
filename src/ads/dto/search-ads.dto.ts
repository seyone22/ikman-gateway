import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum, Min, IsBoolean } from 'class-validator';

export enum SortByOption {
  CHEAPEST = 'cheapest',
  EXPENSIVE = 'expensive',
  NEWEST = 'newest',
}

export enum ConditionOption {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
}

export class SearchAdsDto {
  @ApiPropertyOptional({
    description: 'Free-text search keyword (e.g. "iPhone 15", "Toyota Prius")',
    example: 'iPhone 15',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Category slug or numeric ID (e.g. "mobile-phones", "cars", "electronics")',
    example: 'mobile-phones',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Location slug or numeric ID (e.g. "colombo", "kandy", "sri-lanka")',
    example: 'colombo',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Minimum price in LKR',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price in LKR',
    example: 150000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Item condition',
    enum: ConditionOption,
  })
  @IsOptional()
  @IsEnum(ConditionOption)
  condition?: ConditionOption;

  @ApiPropertyOptional({
    description: 'Sorting criteria',
    enum: SortByOption,
    default: SortByOption.NEWEST,
  })
  @IsOptional()
  @IsEnum(SortByOption)
  sortBy?: SortByOption = SortByOption.NEWEST;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Filter out placeholder or dummy spam prices (e.g. Rs 0, Rs 1) when sorting by cheapest',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  cleanSpam?: boolean = true;
}
