import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { IkmanModule } from './ikman/ikman.module';
import { AdsModule } from './ads/ads.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 120, // default cache 2 minutes
      max: 500, // max 500 items in cache
    }),
    IkmanModule,
    AdsModule,
    TaxonomyModule,
    McpModule,
  ],
})
export class AppModule {}
