export interface NormalizedPrice {
  amount: number | null;
  currency: string;
  formatted: string;
  isNegotiable: boolean;
  isSpamOrDummy: boolean;
}

export interface NormalizedAdSummary {
  id: string;
  slug: string;
  title: string;
  price: NormalizedPrice;
  thumbnailUrl: string | null;
  location: {
    id?: number;
    name: string;
    slug?: string;
  };
  category: {
    id?: number;
    name: string;
    slug?: string;
  };
  isPromoted: boolean;
  isUrgent: boolean;
  isMember: boolean;
  isVerified: boolean;
  postedAt: string;
  shopName?: string;
  url: string;
}

export interface NormalizedAdDetail extends NormalizedAdSummary {
  description: string;
  images: string[];
  specs: Record<string, string>;
  seller: {
    name: string;
    phoneNumbers: string[];
    isMember: boolean;
    isVerified: boolean;
    memberSince?: string;
    membershipLevel?: string;
    shop?: {
      id?: string;
      name?: string;
      slug?: string;
      logo?: string;
    };
  };
  statistics?: {
    views?: number;
  };
}

export interface NormalizedCategory {
  id: number;
  name: string;
  slug: string;
  subcategories?: NormalizedCategory[];
}

export interface NormalizedLocation {
  id: number;
  name: string;
  slug: string;
  cities?: NormalizedLocation[];
}
