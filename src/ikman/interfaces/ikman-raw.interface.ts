export interface IkmanRawAdSummary {
  id: string;
  slug: string;
  title: string;
  description?: string;
  details?: string;
  subtitle?: string;
  imgUrl?: string;
  images?: string[];
  price?: string;
  discount?: string | number;
  mrp?: string;
  isMember?: boolean;
  isAuthDealer?: boolean;
  isFeaturedMember?: boolean;
  isFeaturedAd?: boolean;
  membershipLevel?: string;
  shopName?: string;
  shopLogoUrl?: string;
  isDoorstepDelivery?: boolean;
  isExtraImages?: boolean;
  isDeliveryFree?: boolean;
  isTopAd?: boolean;
  isUrgentAd?: boolean;
  timeStamp?: string;
  lastBumpUpDate?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  isVerified?: boolean;
  location?: {
    id: number;
    name: string;
    slug: string;
  };
  adType?: string;
}

export interface IkmanRawSerpResponse {
  ads?: IkmanRawAdSummary[];
  topAds?: IkmanRawAdSummary[];
  spotlights?: IkmanRawAdSummary[];
  paginationData?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  categoryId?: number;
  locationId?: number;
  title?: string;
  description?: string;
  h1Text?: string;
  postedAdCount?: number;
}

export interface IkmanRawProperty {
  label: string;
  value: string;
  key: string;
  value_key?: string;
}

export interface IkmanRawContactCard {
  name?: string;
  phoneNumbers?: Array<{
    number: string;
    verified: boolean;
  }>;
  chatEnabled?: boolean;
}

export interface IkmanRawAdDetails {
  id: string;
  slug: string;
  title: string;
  description?: string;
  properties?: IkmanRawProperty[];
  isMember?: boolean;
  isAuthDealer?: boolean;
  isFeaturedMember?: boolean;
  type?: string;
  status?: string;
  membershipLevel?: string;
  memberSince?: string;
  isVerified?: boolean;
  timestamp?: string;
  adDate?: string;
  deactivates?: string;
  location?: {
    id: number;
    name: string;
    slug: string;
    geo_region?: string;
    parent?: {
      id: number;
      name: string;
      slug: string;
    };
    geography?: {
      simple_polygons?: Array<{
        coordinates: Array<{ latitude: number; longitude: number }>;
      }>;
    };
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    parent?: {
      id: number;
      name: string;
      slug: string;
    };
  };
  contactCard?: IkmanRawContactCard;
  images?: {
    meta?: Array<{
      src: string;
      alt?: string;
    }>;
    base_uri?: string;
  };
  shop?: {
    id?: string;
    slug?: string;
    name?: string;
    email?: string;
    logo?: string;
  };
  money?: {
    label?: string;
    amount?: string;
  };
  statistics?: {
    views?: number;
  };
}

export interface IkmanRawCategoryNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: number[];
  ad_types?: string[];
  serp_type?: string;
}

export interface IkmanRawLocationNode {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: number[];
  geo_region?: string;
}
