import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';
import { AdsModule } from '../ads/ads.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';

@Module({
  imports: [AdsModule, TaxonomyModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
