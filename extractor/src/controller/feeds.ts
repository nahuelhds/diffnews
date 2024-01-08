import "dotenv/config";

import { extract as feedExtractor, FeedEntry } from "@extractus/feed-extractor";

import { STATIC_FOLDER } from "../constants.js";
import {
  articleExists,
  createArticle,
  storeArticle,
} from "../services/articleService.js";
import { logger } from "../services/loggerService.js";
import { FeedConfig } from "../types.js";
import { saveToJsonFile } from "../utils/fs-utils.js";

/**
 * Fetches every feed and saves the brand-new articles
 */
export function fetchNewArticles(feedConfigs: FeedConfig[]) {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const feedData = await feedExtractor(feedConfig.url);
    const feedPath = `${STATIC_FOLDER}/${feedConfig.id}.json`;
    saveToJsonFile(feedPath, feedData);
    return Promise.all(
      feedData.entries.map((feedEntry) =>
        storeNewArticlesOnly(feedEntry, feedConfig),
      ),
    );
  });
}

async function storeNewArticlesOnly(
  feedEntry: FeedEntry,
  feedConfig: FeedConfig,
) {
  const article = await createArticle(feedEntry, feedConfig);
  if (articleExists(article)) {
    logger.debug(`[EXISTS]: ${article.entryId}`);
    return;
  }

  logger.info(`[NEW]: ${article.entryId}`);
  void storeArticle(article);
}
