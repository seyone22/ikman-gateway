# Ikman API Gateway & Headless MCP Server

A production-grade, enterprise-ready **NestJS** RESTful API Gateway and Model Context Protocol (**MCP**) server that unlocks, sanitizes, and normalizes Sri Lanka's largest classifieds marketplace (**ikman.lk**).

## 🚀 Key Features

* **True Price Sorting (Low-to-High & High-to-Low):** Unlocks the backend price sorting that ikman intentionally hides from its web interface.
* **Spam Price Sanitization:** Automatically detects and filters out bogus `Rs. 0` and `Rs. 1` placeholder ads when sorting by cheapest.
* **Dual Architecture:**
  * **REST API:** Clean, strongly-typed camelCase JSON with full OpenAPI / Swagger documentation (`/api/docs`).
  * **Model Context Protocol (MCP):** Connect your favorite AI agents (Cursor, Claude Desktop, Antigravity, custom LLMs) via **stdio** or **HTTP/SSE**.
* **Direct Seller Contact Extraction:** Pulls verified seller phone numbers, shop info, and high-resolution images.
* **In-Memory Caching & Cloudflare Resilience:** Protects your IP from Cloudflare rate-limiting by caching taxonomy (1 hour) and searches (2 minutes).

---

## 🌐 Live Production Deployment (Railway)

* **Public URL:** [https://ikman-gateway-production.up.railway.app](https://ikman-gateway-production.up.railway.app)
* **Interactive Swagger UI:** [https://ikman-gateway-production.up.railway.app/api/docs](https://ikman-gateway-production.up.railway.app/api/docs)
* **MCP SSE Endpoint:** `https://ikman-gateway-production.up.railway.app/mcp/sse`
* **Region:** Southeast Asia (Singapore)

---

## 📦 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Start the REST API & Swagger UI

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Once started:
* **Interactive Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
* **REST Search Endpoint:** `GET http://localhost:3000/api/v1/ads`
* **MCP SSE Endpoint:** `http://localhost:3000/mcp/sse`

---

## 🤖 Using as an MCP Server (Cursor / Claude Desktop / Antigravity)

### Claude Desktop Integration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ikman": {
      "command": "node",
      "args": ["<PATH_TO_PROJECT>/dist/bin/mcp-stdio.js"]
    }
  }
}
```

### Available MCP Tools

1. **`ikman_search_ads`**: Search classifieds with keywords, category, location, min/max price, condition, and sorting (`cheapest`, `expensive`, `newest`).
2. **`ikman_get_ad_details`**: Retrieve full description, direct seller phone numbers, high-res photos, and specifications.
3. **`ikman_list_categories`**: Browse all categories and subcategory slugs.
4. **`ikman_list_locations`**: Browse all districts and cities.

---

## 🌐 REST API Reference

### 1. Search Listings

```http
GET /api/v1/ads?category=mobile-phones&location=colombo&sortBy=cheapest&minPrice=20000&maxPrice=100000
```

#### Query Parameters:
| Param | Type | Description |
|---|---|---|
| `query` | string | Keyword (e.g. `iPhone 15`, `Civic`, `Land`) |
| `category` | string | Category slug (e.g. `mobile-phones`, `cars`, `electronics`) |
| `location` | string | District or city slug (e.g. `colombo`, `kandy`, `gampaha`) |
| `sortBy` | string | `cheapest` (price asc), `expensive` (price desc), `newest` (date desc) |
| `minPrice` | number | Minimum price in LKR |
| `maxPrice` | number | Maximum price in LKR |
| `condition`| string | `new`, `used`, `refurbished` |
| `cleanSpam`| boolean| Discards Rs 0/1 spam listings when sorting cheapest (default: `true`) |
| `page` | number | Page number (default: `1`) |

### 2. Get Ad Details & Seller Phone Numbers

```http
GET /api/v1/ads/:slug
```

**Example:**
```http
GET /api/v1/ads/apple-iphone-13-128gb-used-for-sale-colombo-10
```

### 3. Categories & Locations

```http
GET /api/v1/categories
GET /api/v1/locations
```

---

## 🧪 Testing

```bash
# Run unit & integration tests
npm test
```
