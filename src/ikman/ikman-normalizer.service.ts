import { Injectable } from '@nestjs/common';
import {
  IkmanRawAdSummary,
  IkmanRawAdDetails,
  IkmanRawCategoryNode,
  IkmanRawLocationNode,
} from './interfaces/ikman-raw.interface';
import {
  NormalizedAdDetail,
  NormalizedAdSummary,
  NormalizedCategory,
  NormalizedLocation,
  NormalizedPrice,
} from './interfaces/ikman-normalized.interface';

@Injectable()
export class IkmanNormalizerService {
  /**
   * Parse price strings like "Rs 40,990", "negotiable", "Rs 1" into structured data.
   */
  parsePrice(rawPrice?: string): NormalizedPrice {
    if (!rawPrice) {
      return {
        amount: null,
        currency: 'LKR',
        formatted: 'Contact for price',
        isNegotiable: true,
        isSpamOrDummy: false,
      };
    }

    const trimmed = rawPrice.trim();
    const isNegotiable = /negotiable/i.test(trimmed);

    // Extract digits
    const cleanedDigits = trimmed.replace(/[^0-9]/g, '');
    const amount = cleanedDigits ? parseInt(cleanedDigits, 10) : null;

    // Detect spam/placeholder prices commonly posted by sellers (Rs. 0, 1, 10, etc.)
    const isSpamOrDummy = amount !== null && amount <= 50;

    return {
      amount,
      currency: 'LKR',
      formatted: trimmed,
      isNegotiable,
      isSpamOrDummy,
    };
  }

  /**
   * Converts thumbnail/cropped image URLs to highest resolution available.
   */
  resolveImageUrl(imgUrl?: string): string | null {
    if (!imgUrl) return null;
    if (imgUrl.startsWith('//')) {
      return `https:${imgUrl}`;
    }
    // If it's a thumbnail like ".../142/107/cropped.jpg", upgrade to full size if possible
    return imgUrl.replace(/\/\d+\/\d+\/cropped\.(jpg|png|webp)/, '/620/465/cropped.$1');
  }

  /**
   * Normalize an Ad Summary from SERP listing.
   */
  normalizeSummary(raw: IkmanRawAdSummary & { money?: { amount?: string } }): NormalizedAdSummary {
    const price = this.parsePrice(raw.money?.amount || raw.price || raw.mrp);
    const locationName = raw.location?.name || raw.description?.split(',')[0]?.trim() || 'Sri Lanka';
    const categoryName = raw.category?.name || raw.description?.split(',')[1]?.trim() || '';

    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      price,
      thumbnailUrl: this.resolveImageUrl(raw.imgUrl || (raw.images && raw.images[0])),
      location: {
        id: raw.location?.id,
        name: locationName,
        slug: raw.location?.slug,
      },
      category: {
        id: raw.category?.id,
        name: categoryName,
        slug: raw.category?.slug,
      },
      isPromoted: !!(raw.isTopAd || raw.isFeaturedAd),
      isUrgent: !!raw.isUrgentAd,
      isMember: !!(raw.isMember || raw.isFeaturedMember),
      isVerified: !!raw.isVerified,
      postedAt: raw.timeStamp || raw.lastBumpUpDate || '',
      shopName: raw.shopName,
      url: `https://ikman.lk/en/ad/${raw.slug}`,
    };
  }

  /**
   * Normalize an Ad Details response.
   */
  normalizeDetails(raw: IkmanRawAdDetails): NormalizedAdDetail {
    const summary = this.normalizeSummary(raw as any);

    // Collect all full-resolution images
    const images: string[] = [];
    if (raw.images?.meta && Array.isArray(raw.images.meta)) {
      for (const item of raw.images.meta) {
        if (item.src) {
          images.push(`${item.src}/620/465/cropped.jpg`);
        }
      }
    }
    if (images.length === 0 && summary.thumbnailUrl) {
      images.push(summary.thumbnailUrl);
    }

    // Convert properties array into key-value specs
    const specs: Record<string, string> = {};
    if (raw.properties && Array.isArray(raw.properties)) {
      for (const prop of raw.properties) {
        if (prop.label && prop.value) {
          specs[prop.label] = prop.value;
        }
      }
    }

    // Phone numbers from contact card
    const phoneNumbers: string[] = [];
    if (raw.contactCard?.phoneNumbers && Array.isArray(raw.contactCard.phoneNumbers)) {
      for (const p of raw.contactCard.phoneNumbers) {
        if (p.number && !phoneNumbers.includes(p.number)) {
          phoneNumbers.push(p.number);
        }
      }
    }

    return {
      ...summary,
      description: raw.description || '',
      images,
      specs,
      seller: {
        name: raw.contactCard?.name || raw.shop?.name || 'Seller',
        phoneNumbers,
        isMember: !!raw.isMember,
        isVerified: !!raw.isVerified,
        memberSince: raw.memberSince,
        membershipLevel: raw.membershipLevel,
        shop: raw.shop?.name
          ? {
              id: raw.shop.id,
              name: raw.shop.name,
              slug: raw.shop.slug,
              logo: raw.shop.logo,
            }
          : undefined,
      },
      statistics: raw.statistics,
    };
  }

  /**
   * Builds a normalized hierarchical category tree.
   */
  normalizeCategories(rawRecord: Record<string, IkmanRawCategoryNode>): NormalizedCategory[] {
    const rootNodes: NormalizedCategory[] = [];
    const childrenMap = new Map<number, NormalizedCategory[]>();

    for (const [key, node] of Object.entries(rawRecord)) {
      if (!node || typeof node !== 'object' || typeof node.id !== 'number' || node.id === -1 || !node.name) {
        continue;
      }

      const normalized: NormalizedCategory = {
        id: node.id,
        name: node.name,
        slug: node.slug,
      };

      if (!node.parentId || node.parentId === -1) {
        rootNodes.push(normalized);
      } else {
        const list = childrenMap.get(node.parentId) || [];
        list.push(normalized);
        childrenMap.set(node.parentId, list);
      }
    }

    // Attach subcategories
    for (const root of rootNodes) {
      root.subcategories = childrenMap.get(root.id) || [];
    }

    return rootNodes.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Builds a normalized hierarchical location tree.
   */
  normalizeLocations(rawRecord: Record<string, IkmanRawLocationNode>): NormalizedLocation[] {
    const districts: NormalizedLocation[] = [];
    const citiesMap = new Map<number, NormalizedLocation[]>();

    for (const [key, node] of Object.entries(rawRecord)) {
      if (!node || typeof node !== 'object' || typeof node.id !== 'number' || node.id === -1 || !node.name) {
        continue;
      }

      const normalized: NormalizedLocation = {
        id: node.id,
        name: node.name,
        slug: node.slug,
      };

      if (!node.parentId || node.parentId === -1) {
        districts.push(normalized);
      } else {
        const list = citiesMap.get(node.parentId) || [];
        list.push(normalized);
        citiesMap.set(node.parentId, list);
      }
    }

    for (const dist of districts) {
      dist.cities = (citiesMap.get(dist.id) || []).sort((a, b) => a.name.localeCompare(b.name));
    }

    return districts.sort((a, b) => a.name.localeCompare(b.name));
  }
}
