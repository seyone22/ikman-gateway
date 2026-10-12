import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for web and frontend integrations
  app.enableCors();

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Setup Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Ikman API Gateway & MCP Server')
    .setDescription(
      'Clean, normalized RESTful API and Model Context Protocol (MCP) server for ikman.lk classifieds. ' +
        'Features real price sorting (low-to-high & high-to-low), spam price sanitization, seller phone extraction, and category/location taxonomies.',
    )
    .setVersion('1.0.0')
    .addTag('Ads', 'Search and retrieve classified ads')
    .addTag('Taxonomy', 'Browse category and location trees')
    .addTag('MCP (Model Context Protocol)', 'Model Context Protocol endpoints for AI agents')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 REST API Server running at http://localhost:${port}`);
  logger.log(`📖 Swagger API Docs available at http://localhost:${port}/api/docs`);
  logger.log(`🤖 MCP SSE Endpoint available at http://localhost:${port}/mcp/sse`);
}

bootstrap();
