import { NestFactory } from '@nestjs/core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AppModule } from '../src/app.module';
import { McpService } from '../src/mcp/mcp.service';

async function bootstrap() {
  // Use logger: ['error', 'warn'] directed to stderr to keep stdout clean for JSON-RPC
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const mcpService = app.get(McpService);
  const transport = new StdioServerTransport();

  await mcpService.getServer().connect(transport);

  process.stderr.write('Ikman MCP Server running on stdio\n');
}

bootstrap().catch((err) => {
  process.stderr.write(`Fatal error starting MCP Server: ${err.message}\n`);
  process.exit(1);
});
