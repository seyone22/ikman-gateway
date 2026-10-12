import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  IkmanRawSerpResponse,
  IkmanRawAdDetails,
  IkmanRawCategoryNode,
  IkmanRawLocationNode,
} from './interfaces/ikman-raw.interface';

export interface SerpRequestOptions {
  query?: string;
  category?: string; // slug or ID
  location?: string; // slug or ID
  minPrice?: number;
  maxPrice?: number;
  condition?: 'new' | 'used' | 'refurbished';
  sortBy?: 'cheapest' | 'expensive' | 'newest';
  page?: number;
}

@Injectable()
export class IkmanClientService {
  private readonly logger = new Logger(IkmanClientService.name);
  private readonly client: AxiosInstance;
  private categorySlugMap = new Map<string, number>();
  private locationSlugMap = new Map<string, number>();
  private isTaxonomyLoaded = false;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://ikman.lk',
      timeout: 12000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'accept-language': 'en',
        'accept': 'application/json, text/plain, */*',
        'X-mobile-request': 'false',
        'Referer': 'https://ikman.lk/',
      },
    });
  }

  /**
   * Loads category and location taxonomy to map slugs <-> numeric IDs.
   */
  async ensureTaxonomyLoaded(): Promise<void> {
    if (this.isTaxonomyLoaded) return;
    try {
      const [categories, locations] = await Promise.all([
        this.fetchCategories('en'),
        this.fetchLocations('en'),
      ]);

      for (const [key, node] of Object.entries(categories)) {
        if (node && typeof node === 'object' && node.slug && node.id) {
          this.categorySlugMap.set(node.slug.toLowerCase(), node.id);
        }
      }

      for (const [key, node] of Object.entries(locations)) {
        if (node && typeof node === 'object' && node.slug && node.id) {
          this.locationSlugMap.set(node.slug.toLowerCase(), node.id);
        }
      }

      this.isTaxonomyLoaded = true;
      this.logger.log(
        `Taxonomy loaded: ${this.categorySlugMap.size} categories, ${this.locationSlugMap.size} locations mapped.`,
      );
    } catch (err) {
      this.logger.warn(`Could not preload taxonomy: ${err.message}`);
    }
  }

  /**
   * Resolve category input (slug or ID) to both ID and slug.
   */
  resolveCategory(input?: string): { id?: number; slug?: string } {
    if (!input) return {};
    const parsedId = parseInt(input, 10);
    if (!isNaN(parsedId)) {
      return { id: parsedId };
    }
    const cleanSlug = input.trim().toLowerCase();
    const id = this.categorySlugMap.get(cleanSlug);
    return { id, slug: cleanSlug };
  }

  /**
   * Resolve location input (slug or ID) to both ID and slug.
   */
  resolveLocation(input?: string): { id?: number; slug?: string } {
    if (!input) return { slug: 'sri-lanka' };
    const parsedId = parseInt(input, 10);
    if (!isNaN(parsedId)) {
      return { id: parsedId };
    }
    const cleanSlug = input.trim().toLowerCase();
    const id = this.locationSlugMap.get(cleanSlug);
    return { id, slug: cleanSlug };
  }

  /**
   * Fetch ad search results (SERP) from ikman.lk
   */
  async fetchSerp(options: SerpRequestOptions): Promise<IkmanRawSerpResponse> {
    await this.ensureTaxonomyLoaded();

    const categoryInfo = this.resolveCategory(options.category);
    const locationInfo = this.resolveLocation(options.location);

    // Build sort & order params
    let sort = 'date';
    let order = 'desc';

    if (options.sortBy === 'cheapest') {
      sort = 'price';
      order = 'asc';
    } else if (options.sortBy === 'expensive') {
      sort = 'price';
      order = 'desc';
    } else if (options.sortBy === 'newest') {
      sort = 'date';
      order = 'desc';
    }

    // Dynamic filters (price range, condition)
    const filterJson: any[] = [];

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const priceFilter: any = {
        type: 'money',
        key: 'price',
      };
      if (options.minPrice !== undefined) priceFilter.minimum = options.minPrice;
      if (options.maxPrice !== undefined) priceFilter.maximum = options.maxPrice;
      filterJson.push(priceFilter);
    }

    if (options.condition) {
      filterJson.push({
        type: 'enum',
        key: 'condition',
        values: [options.condition],
      });
    }

    const params: Record<string, any> = {
      page: options.page || 1,
      sort,
      order,
      top_ads: 2,
      spotlights: 5,
      filter_json: JSON.stringify(filterJson),
    };

    if (categoryInfo.id) params.category = categoryInfo.id;
    if (categoryInfo.slug) params.categorySlug = categoryInfo.slug;
    if (locationInfo.id) params.location = locationInfo.id;
    if (locationInfo.slug) params.locationSlug = locationInfo.slug;
    if (options.query && options.query.trim()) params.query = options.query.trim();

    try {
      const response = await this.client.get<IkmanRawSerpResponse>('/data/serp', {
        params,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching SERP: ${error.message}`, error.stack);
      if (error.response?.status === 404) {
        return { ads: [], paginationData: { total: 0, page: 1, totalPages: 0 } };
      }
      throw new HttpException(
        `Failed to retrieve listings from upstream: ${error.response?.data || error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Fetch full details for a single ad.
   */
  async fetchDetails(slug: string): Promise<IkmanRawAdDetails> {
    const cleanSlug = slug.replace(/^https?:\/\/ikman\.lk\/[a-z]{2}\/ad\//, '').replace(/^\//, '');

    try {
      const response = await this.client.get<any>('/data/details', {
        params: { slug: cleanSlug },
      });
      const data = response.data?.ad || response.data?.adDetail || response.data;
      if (!data || (!data.title && !data.id)) {
        throw new HttpException(`Ad with slug '${cleanSlug}' not found`, HttpStatus.NOT_FOUND);
      }
      return data;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND || error.response?.status === 404) {
        throw new HttpException(`Ad with slug '${cleanSlug}' not found`, HttpStatus.NOT_FOUND);
      }
      this.logger.error(`Error fetching ad details: ${error.message}`);
      throw new HttpException(
        `Failed to retrieve ad details from upstream: ${error.message}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Fetch category hierarchy dictionary.
   */
  async fetchCategories(locale = 'en'): Promise<Record<string, IkmanRawCategoryNode>> {
    try {
      const response = await this.client.get<Record<string, IkmanRawCategoryNode>>(
        `/data/categories/${locale}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching categories: ${error.message}`);
      throw new HttpException(
        `Failed to retrieve categories from upstream`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Fetch location hierarchy dictionary.
   */
  async fetchLocations(locale = 'en'): Promise<Record<string, IkmanRawLocationNode>> {
    try {
      const response = await this.client.get<any>(
        `/data/locations/${locale}`,
      );
      return response.data?.locations || response.data;
    } catch (error) {
      this.logger.error(`Error fetching locations: ${error.message}`);
      throw new HttpException(
        `Failed to retrieve locations from upstream`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
