/**
 * The one file to edit if the target site's markup changes (§10, §12). Isolated
 * deliberately — nothing else in the app should know a CSS selector.
 */
export const NEWS_SOURCE = {
  name: "生活副刊",
  actorId: "apify/cheerio-scraper",
  startUrl: "https://www.hk01.com/channel/生活", // calm lifestyle section, verify before demo
  selectors: {
    item: "article",
    headline: "h1, h2",
    paragraph: "p",
    link: "a",
  },
};
