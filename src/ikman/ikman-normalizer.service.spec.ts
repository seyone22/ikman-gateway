import { Test, TestingModule } from '@nestjs/testing';
import { IkmanNormalizerService } from './ikman-normalizer.service';

describe('IkmanNormalizerService', () => {
  let service: IkmanNormalizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IkmanNormalizerService],
    }).compile();

    service = module.get<IkmanNormalizerService>(IkmanNormalizerService);
  });

  describe('parsePrice', () => {
    it('should parse standard LKR price', () => {
      const result = service.parsePrice('Rs 45,000');
      expect(result.amount).toBe(45000);
      expect(result.currency).toBe('LKR');
      expect(result.formatted).toBe('Rs 45,000');
      expect(result.isNegotiable).toBe(false);
      expect(result.isSpamOrDummy).toBe(false);
    });

    it('should identify dummy spam prices like Rs. 0 or Rs. 1', () => {
      const resultZero = service.parsePrice('Rs 0');
      expect(resultZero.amount).toBe(0);
      expect(resultZero.isSpamOrDummy).toBe(true);

      const resultOne = service.parsePrice('Rs 1');
      expect(resultOne.amount).toBe(1);
      expect(resultOne.isSpamOrDummy).toBe(true);

      const resultTwenty = service.parsePrice('Rs 20');
      expect(resultTwenty.amount).toBe(20);
      expect(resultTwenty.isSpamOrDummy).toBe(true);
    });

    it('should handle negotiable strings', () => {
      const result = service.parsePrice('Rs 75,000 (Negotiable)');
      expect(result.amount).toBe(75000);
      expect(result.isNegotiable).toBe(true);
      expect(result.isSpamOrDummy).toBe(false);
    });

    it('should handle missing price gracefully', () => {
      const result = service.parsePrice(undefined);
      expect(result.amount).toBeNull();
      expect(result.formatted).toBe('Contact for price');
      expect(result.isNegotiable).toBe(true);
    });
  });

  describe('resolveImageUrl', () => {
    it('should upgrade thumbnail dimensions to high resolution', () => {
      const thumb =
        'https://i.ikman-st.com/apple-iphone-13/12345/142/107/cropped.jpg';
      const upgraded = service.resolveImageUrl(thumb);
      expect(upgraded).toBe(
        'https://i.ikman-st.com/apple-iphone-13/12345/620/465/cropped.jpg',
      );
    });

    it('should handle protocol-relative URLs', () => {
      const url = '//i.ikman-st.com/sample.jpg';
      expect(service.resolveImageUrl(url)).toBe('https://i.ikman-st.com/sample.jpg');
    });
  });

  describe('normalizeDetails', () => {
    it('should extract contact card phone numbers and specs dictionary', () => {
      const rawDetail: any = {
        id: 'ad_123',
        slug: 'sony-playstation-5',
        title: 'Sony PS5 Disk Edition',
        price: 'Rs 165,000',
        description: 'Brand new in box',
        properties: [
          { label: 'Condition', value: 'Brand New', key: 'condition' },
          { label: 'Brand', value: 'Sony', key: 'brand' },
        ],
        contactCard: {
          name: 'Game Hub',
          phoneNumbers: [
            { number: '0771234567', verified: true },
            { number: '0719876543', verified: false },
          ],
        },
        images: {
          meta: [{ src: 'https://i.ikman-st.com/ps5/img1' }],
        },
      };

      const normalized = service.normalizeDetails(rawDetail);
      expect(normalized.title).toBe('Sony PS5 Disk Edition');
      expect(normalized.price.amount).toBe(165000);
      expect(normalized.specs['Condition']).toBe('Brand New');
      expect(normalized.specs['Brand']).toBe('Sony');
      expect(normalized.seller.phoneNumbers).toEqual(['0771234567', '0719876543']);
      expect(normalized.seller.name).toBe('Game Hub');
      expect(normalized.images[0]).toContain('/620/465/cropped.jpg');
    });
  });
});
