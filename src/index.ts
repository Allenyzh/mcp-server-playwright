import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { launchWeb, getCurrentContext, openNewPage } from "./launchWeb";
import { getPageStats } from "./pageCounts";

// Create a new server instance
const server = new McpServer({
  name: "playwright-mcp-server",
  description: "A server that uses Playwright to interact with web pages.",
  version: "1.0.0",
});

server.tool(
  "web-launcher",
  "Launch a web page using Playwright",
  {
    url: z
      .string()
      .url()
      .describe(
        "The URL of the web page to launch and it must be a valid URL like https://www.google.com"
      ),
  },
  async ({ url }) => {
    console.error("Launching web page:", url);
    await launchWeb(url);
    return {
      content: [
        {
          type: "text",
          text: "Web page launched successfully!",
        },
      ],
    };
  }
);

server.tool(
  "open-new-page",
  "Open a new page in the existing browser context",
  {
    url: z
      .string()
      .url()
      .describe(
        "The URL of the web page to open and it must be a valid URL like https://www.google.com"
      ),
  },
  async ({ url }) => {
    const context = getCurrentContext();
    if (!context) {
      return {
        content: [
          {
            type: "text",
            text: "No browser context is currently open. Please launch a web page first using web-launcher.",
          },
        ],
      };
    }
    await openNewPage(url);
    return {
      content: [
        {
          type: "text",
          text: `New page opened successfully at ${url}!`,
        },
      ],
    };
  }
);

server.tool(
  "web-page-counts",
  "Get the number of currently open pages and their names/URLs",
  {
    context: z.object({}).optional(),
    
  },
  async () => {
    const context = getCurrentContext();

    if (!context) {
      return {
        content: [
          {
            type: "text",
            text: "No browser context is currently open. Please launch a web page first using web-launcher.",
          },
        ],
      };
    }

    const stats = await getPageStats(context);

    const pageList = stats.pages
      .map((page) => `- ${page.title} (${page.url})`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Number of open pages: ${stats.count}\n\nOpen pages:\n${pageList}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main(): ", error);
  process.exit(1);
});
