import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { launchWeb, getCurrentContext, openNewPage } from "./launchWeb";
import { getPageStats } from "./pageCounts";
import { closePage } from "./closePage";

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
        "The URL of the web page to launch for the first time and it must be a valid URL like https://www.google.com"
      ),
  },
  async ({ url }) => {
    const context = getCurrentContext();
    if (context) {
      await openNewPage(url);
      return {
        content: [
          {
            type: "text",
            text: `New page opened successfully!`,
          },
        ],
      };
    }

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

server.tool(
  "web-page-close",
  "Close the current browser context",
  {
    i: z.number().describe("The number of the page to close. Do not convert it to the index."),
  },
  async ({ i }) => {
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

    // Check if the page number is valid
    if (i < 1 || i > context.pages().length) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid page number. Please provide a number between 1 and ${
              context.pages().length
            }.`,
          },
        ],
      };
    }

    console.error("Closing: ", context.pages()[i - 1].url());
    await closePage(context.pages()[i - 1]);

    return {
      content: [
        {
          type: "text",
          text: `The ${i} ${
            i == 1 ? "st" : i == 2 ? "nd" : i == 3 ? "rd" : "th"
          } page closed successfully!`,
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
