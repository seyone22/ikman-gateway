import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({
    summary: 'Health check endpoint for Railway and container orchestrators',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 42.5 },
        timestamp: { type: 'string', example: '2026-10-12T06:00:00.000Z' },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'Versioned API health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  checkV1() {
    return this.check();
  }
}
