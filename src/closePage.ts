import { Page } from "playwright/test";


export async function closePage(page: Page) {
  // Close the page
  await page.close();

  // Get the context of the closed page
  const context = page.context();

  // If there are no more pages in the context, close the context
  if (context.pages().length === 0) {
    await context.close();
  }
}
// Example usage
// (async () => {
//   const context = await launchWeb("https://www.google.com");
//   const page = await context.newPage();
//   await page.goto("https://www.baidu.com");
//   await closePage(page);
//   console.log("Page closed and context checked.");
// })();
