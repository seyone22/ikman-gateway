import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: 2003 })
  id: number;

  @ApiProperty({ example: 'Mobile Phones' })
  name: string;

  @ApiProperty({ example: 'mobile-phones' })
  slug: string;

  @ApiProperty({ type: [CategoryDto], required: false })
  subcategories?: CategoryDto[];
}

export class LocationDto {
  @ApiProperty({ example: 1506 })
  id: number;

  @ApiProperty({ example: 'Colombo' })
  name: string;

  @ApiProperty({ example: 'colombo' })
  slug: string;

  @ApiProperty({ type: [LocationDto], required: false })
  cities?: LocationDto[];
}
