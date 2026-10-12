import { Controller, Get, Post, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { McpService } from './mcp.service';

@ApiTags('MCP (Model Context Protocol)')
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);
  private transports = new Map<string, SSEServerTransport>();

  constructor(private readonly mcpService: McpService) {}

  @Get('sse')
  @ApiOperation({
    summary: 'MCP SSE stream endpoint',
    description: 'Server-Sent Events endpoint for remote AI agents connecting via Model Context Protocol.',
  })
  async handleSse(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.logger.log('New MCP SSE client connection initiated');
    const transport = new SSEServerTransport('/mcp/messages', res);

    const sessionId = transport.sessionId;
    this.transports.set(sessionId, transport);

    req.on('close', () => {
      this.logger.log(`MCP client disconnected: ${sessionId}`);
      this.transports.delete(sessionId);
    });

    await this.mcpService.getServer().connect(transport);
  }

  @Post('messages')
  @ApiOperation({
    summary: 'MCP messages endpoint',
    description: 'Post JSON-RPC requests for active MCP SSE sessions.',
  })
  async handleMessages(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).send('Missing sessionId parameter');
      return;
    }

    const transport = this.transports.get(sessionId);
    if (!transport) {
      res.status(404).send('Session not found or expired');
      return;
    }

    await transport.handlePostMessage(req, res);
  }
}
