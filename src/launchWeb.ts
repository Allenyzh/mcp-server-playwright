import { chromium, BrowserContext } from "playwright";

// Store the current context globally so it can be accessed by other functions
let currentContext: BrowserContext | null = null;

/**
 * Launches a web page using Playwright and returns the browser context
 * @param url The URL to launch
 * @returns The browser context
 */
export async function launchWeb(url: string): Promise<BrowserContext> {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const userDataDir = '/Users/yangzhenhao/work/mcp-server-playwright/chrome-user-data';

  // Launch a persistent browser context
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: chromePath,
  });

  // Store the context for later use
  currentContext = context;

  // Open a new page
  const page = await context.newPage();

  // Navigate to the URL
  await page.goto(url);

  return context;
}

/**
 * Returns the current browser context
 * @returns The current browser context or null if none exists
 */
export function getCurrentContext(): BrowserContext | null {
  return currentContext;
}

/**
 * Opens a new page in the existing browser context
 * @param url The URL to navigate to
 * @returns The new page
 */
export async function openNewPage(url: string) {
  const context = getCurrentContext();
  if (!context) {
    throw new Error('No browser context found. Call launchWeb() first.');
  }

  const page = await context.newPage();
  await page.goto(url);
  return page;
}