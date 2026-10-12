import { Injectable, Logger } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AdsService } from '../ads/ads.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { ConditionOption, SortByOption } from '../ads/dto/search-ads.dto';

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    private readonly adsService: AdsService,
    private readonly taxonomyService: TaxonomyService,
  ) {}

  createServer(): Server {
    const server = new Server(
      {
        name: 'ikman-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerHandlers(server);
    return server;
  }

  getServer(): Server {
    return this.createServer();
  }

  private registerHandlers(server: Server): void {
    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'ikman_search_ads',
          description:
            'Search classified ads on ikman.lk with filters and true price sorting (cheapest/expensive/newest). Automatically filters out Rs. 0/1 spam prices.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search keyword (e.g. "iPhone 15", "Toyota Prius")',
              },
              category: {
                type: 'string',
                description:
                  'Category slug (e.g. "mobile-phones", "cars", "electronics", "house-for-sale")',
              },
              location: {
                type: 'string',
                description: 'Location slug (e.g. "colombo", "kandy", "gampaha", "sri-lanka")',
              },
              minPrice: {
                type: 'number',
                description: 'Minimum price filter in LKR',
              },
              maxPrice: {
                type: 'number',
                description: 'Maximum price filter in LKR',
              },
              condition: {
                type: 'string',
                enum: ['new', 'used', 'refurbished'],
                description: 'Condition of the item',
              },
              sortBy: {
                type: 'string',
                enum: ['cheapest', 'expensive', 'newest'],
                description:
                  'Sort criterion. "cheapest" activates real low-to-high price ordering.',
              },
              page: {
                type: 'number',
                description: 'Page number for pagination (starts at 1)',
              },
              cleanSpam: {
                type: 'boolean',
                description:
                  'Filter out fake/dummy Rs. 0 or Rs. 1 spam prices when sorting by cheapest (default: true)',
              },
            },
          },
        },
        {
          name: 'ikman_get_ad_details',
          description:
            'Retrieve complete details for a single classified ad on ikman.lk, including direct seller phone numbers, verified badges, full specs, and high-res images.',
          inputSchema: {
            type: 'object',
            required: ['slug'],
            properties: {
              slug: {
                type: 'string',
                description:
                  'The ad slug or full URL (e.g. "apple-iphone-13-128gb-used-for-sale-colombo-10")',
              },
            },
          },
        },
        {
          name: 'ikman_list_categories',
          description:
            'List all categories and subcategories with their valid slugs on ikman.lk.',
          inputSchema: {
            type: 'object',
            properties: {
              locale: {
                type: 'string',
                description: 'Language locale ("en", "si", "ta"). Default is "en".',
              },
            },
          },
        },
        {
          name: 'ikman_list_locations',
          description: 'List all districts and cities with their valid slugs on ikman.lk.',
          inputSchema: {
            type: 'object',
            properties: {
              locale: {
                type: 'string',
                description: 'Language locale ("en", "si", "ta"). Default is "en".',
              },
            },
          },
        },
      ];
      return { tools };
    });

    // Execute tools
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      this.logger.log(`MCP CallTool: ${name} with args: ${JSON.stringify(args)}`);

      try {
        switch (name) {
          case 'ikman_search_ads': {
            const result = await this.adsService.searchAds({
              query: args?.query as string,
              category: args?.category as string,
              location: args?.location as string,
              minPrice: args?.minPrice as number,
              maxPrice: args?.maxPrice as number,
              condition: args?.condition as ConditionOption,
              sortBy: (args?.sortBy as SortByOption) || SortByOption.NEWEST,
              page: (args?.page as number) || 1,
              cleanSpam: args?.cleanSpam !== false,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'ikman_get_ad_details': {
            if (!args?.slug) {
              throw new Error('Missing required argument: slug');
            }
            const result = await this.adsService.getAdBySlug(args.slug as string);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'ikman_list_categories': {
            const categories = await this.taxonomyService.getCategories(
              (args?.locale as string) || 'en',
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(categories, null, 2),
                },
              ],
            };
          }

          case 'ikman_list_locations': {
            const locations = await this.taxonomyService.getLocations(
              (args?.locale as string) || 'en',
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(locations, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        this.logger.error(`MCP Tool error (${name}): ${error.message}`);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing tool '${name}': ${error.message}`,
            },
          ],
        };
      }
    });
  }
}
