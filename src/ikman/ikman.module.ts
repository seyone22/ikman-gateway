import { Module, Global } from '@nestjs/common';
import { IkmanClientService } from './ikman-client.service';
import { IkmanNormalizerService } from './ikman-normalizer.service';

@Global()
@Module({
  providers: [IkmanClientService, IkmanNormalizerService],
  exports: [IkmanClientService, IkmanNormalizerService],
})
export class IkmanModule {}
