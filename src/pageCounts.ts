import { BrowserContext, Page } from "playwright/test";

/**
 * Returns the number of currently open pages and their names/URLs
 * @param context The Playwright BrowserContext or Page to check
 * @returns An object containing the count of pages and an array of page information
 */
export async function getPageStats(contextOrPage: BrowserContext | Page) {
  let context: BrowserContext;

  // If a page is provided, get its context
  if ("context" in contextOrPage) {
    context = contextOrPage.context();
  } else {
    context = contextOrPage;
  }

  // Get all pages in the context
  const pages = context.pages();

  // Collect information about each page
  const pageInfo = await Promise.all(
    pages.map(async (page) => {
      const title = await page.title().catch(() => "Unknown title");
      const url = page.url();
      return { title, url };
    })
  );


  return {
    count: pages.length,
    pages: pageInfo,
  };
}

// launchWeb("https://www.google.com").then(async (context) => {
//   const { count, pages } = await getPageStats(context);
//   console.log(`Number of open pages: ${count}`);
//   console.log("Open pages:");
//   pages.forEach((page) => {
//     console.log(`- ${page.title} (${page.url})`);
//   });
// })
