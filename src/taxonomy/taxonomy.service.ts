import { Injectable } from '@nestjs/common';
import { IkmanClientService } from '../ikman/ikman-client.service';
import { IkmanNormalizerService } from '../ikman/ikman-normalizer.service';
import { CategoryDto, LocationDto } from './dto/taxonomy-response.dto';

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly ikmanClient: IkmanClientService,
    private readonly normalizer: IkmanNormalizerService,
  ) {}

  async getCategories(locale = 'en'): Promise<CategoryDto[]> {
    const raw = await this.ikmanClient.fetchCategories(locale);
    return this.normalizer.normalizeCategories(raw);
  }

  async getLocations(locale = 'en'): Promise<LocationDto[]> {
    const raw = await this.ikmanClient.fetchLocations(locale);
    return this.normalizer.normalizeLocations(raw);
  }
}
