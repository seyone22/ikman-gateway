import { ApiProperty } from '@nestjs/swagger';

export class PriceDto {
  @ApiProperty({ example: 85000, nullable: true })
  amount: number | null;

  @ApiProperty({ example: 'LKR' })
  currency: string;

  @ApiProperty({ example: 'Rs 85,000' })
  formatted: string;

  @ApiProperty({ example: false })
  isNegotiable: boolean;

  @ApiProperty({ example: false })
  isSpamOrDummy: boolean;
}

export class LocationSummaryDto {
  @ApiProperty({ example: 1506, required: false })
  id?: number;

  @ApiProperty({ example: 'Colombo' })
  name: string;

  @ApiProperty({ example: 'colombo', required: false })
  slug?: string;
}

export class CategorySummaryDto {
  @ApiProperty({ example: 2003, required: false })
  id?: number;

  @ApiProperty({ example: 'Mobile Phones' })
  name: string;

  @ApiProperty({ example: 'mobile-phones', required: false })
  slug?: string;
}

export class AdSummaryDto {
  @ApiProperty({ example: '6abc1234def' })
  id: string;

  @ApiProperty({ example: 'apple-iphone-13-128gb-used-for-sale-colombo-10' })
  slug: string;

  @ApiProperty({ example: 'Apple iPhone 13 128GB (Used)' })
  title: string;

  @ApiProperty({ type: PriceDto })
  price: PriceDto;

  @ApiProperty({ example: 'https://i.ikman-st.com/.../620/465/cropped.jpg', nullable: true })
  thumbnailUrl: string | null;

  @ApiProperty({ type: LocationSummaryDto })
  location: LocationSummaryDto;

  @ApiProperty({ type: CategorySummaryDto })
  category: CategorySummaryDto;

  @ApiProperty({ example: false })
  isPromoted: boolean;

  @ApiProperty({ example: false })
  isUrgent: boolean;

  @ApiProperty({ example: true })
  isMember: boolean;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: '10 mins ago' })
  postedAt: string;

  @ApiProperty({ example: 'Apple Store Colombo', required: false })
  shopName?: string;

  @ApiProperty({ example: 'https://ikman.lk/en/ad/apple-iphone-13-128gb-used-for-sale-colombo-10' })
  url: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 154 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  pageSize: number;

  @ApiProperty({ example: 7 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class PaginatedAdsResponseDto {
  @ApiProperty({ type: [AdSummaryDto] })
  data: AdSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class SellerShopDto {
  @ApiProperty({ example: 'shop_123', required: false })
  id?: string;

  @ApiProperty({ example: 'Gadget Studio', required: false })
  name?: string;

  @ApiProperty({ example: 'gadget-studio', required: false })
  slug?: string;

  @ApiProperty({ example: 'https://i.ikman-st.com/...', required: false })
  logo?: string;
}

export class SellerDto {
  @ApiProperty({ example: 'Nimal Perera' })
  name: string;

  @ApiProperty({ example: ['0771234567', '0719876543'] })
  phoneNumbers: string[];

  @ApiProperty({ example: true })
  isMember: boolean;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: 'January 2022', required: false })
  memberSince?: string;

  @ApiProperty({ example: 'premium', required: false })
  membershipLevel?: string;

  @ApiProperty({ type: SellerShopDto, required: false })
  shop?: SellerShopDto;
}

export class AdDetailDto extends AdSummaryDto {
  @ApiProperty({ example: 'Selling mint condition iPhone 13 with all accessories...' })
  description: string;

  @ApiProperty({ example: ['https://i.ikman-st.com/.../620/465/cropped.jpg'] })
  images: string[];

  @ApiProperty({
    example: { Condition: 'Used', Brand: 'Apple', Model: 'iPhone 13', Edition: '128GB' },
  })
  specs: Record<string, string>;

  @ApiProperty({ type: SellerDto })
  seller: SellerDto;

  @ApiProperty({ example: { views: 350 }, required: false })
  statistics?: {
    views?: number;
  };
}
