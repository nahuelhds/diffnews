import "dotenv/config";
import { FeedConfig } from "../types.js";
import { extract as feedExtractor, FeedEntry } from "@extractus/feed-extractor";
import { feedConfigs } from "../config.js";

import {
  articleExists,
  storeArticle,
  createArticle
} from "../services/articleService.js";

export function parseFeeds() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const feedData = await feedExtractor(feedConfig.url);
    return Promise.all(feedData.entries.map((feedEntry) => storeNewArticlesOnly(feedEntry, feedConfig)));
  });
}

async function storeNewArticlesOnly(feedEntry: FeedEntry, feedConfig: FeedConfig) {
  const article = await createArticle(feedEntry, feedConfig);
  if (articleExists(article)) {
    return;
  }

  void storeArticle(article);
  console.log(`[NEW]: ${article.entryId}`);
}
