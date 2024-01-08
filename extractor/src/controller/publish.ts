import "dotenv/config";

import filenamify from "filenamify";
import fs from "fs";

import { feedConfigs } from "../config.js";
import {
  getArticlesDir,
  parseArticleFromFile,
} from "../services/articleService.js";
import {
  getArticlesDirForDiff,
  getDiffsDir,
  getSnapshotsDir,
  parseDiffFromFile,
} from "../services/diffService.js";
import { logger } from "../services/loggerService.js";
import {
  continueThread,
  getTwitUrl,
  startThread,
} from "../services/twitter/apiService.js";
import { Article, ArticleDiff, FeedConfig } from "../types.js";
import { saveToJsonFile } from "../utils/fs-utils.js";

/**
 * Traverses every article and starts what will be the thread of it
 */
export function publishArticlesOnTwitter() {
  return feedConfigs.map((feedConfig: FeedConfig) => {
    const articlesDir = getArticlesDir(feedConfig);
    return fs.readdirSync(articlesDir).map(async (file) => {
      const articlePath = `${articlesDir}/${file}`;
      const article = parseArticleFromFile(articlePath);

      if (
        !article.url.match("https://www.elpais.com.uy/informacion/politica/")
      ) {
        return;
      }

      if (article.lastTweetId !== undefined) {
        logger.debug(
          "Article is already published at %s",
          await getTwitUrl(article.lastTweetId),
        );
        return;
      }

      const post = await startThread(article);
      if (post.errors) {
        logger.error("Error publishing article %s", article.url);
        logger.error(post.errors);
        return;
      }
      article.lastTweetId = post.data.id;
      saveToJsonFile(articlePath, article);
    });
  });
}

/**
 * Traverses every diff file and generates the related screenshot
 */
export function publishDiffsOnTwitter() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    fs.readdirSync(diffsDir).map(async (file) => {
      const snapshot = `${snapshotsDir}/${file}.jpeg`;
      if (!fs.existsSync(snapshot)) {
        logger.debug("Diff is not ready for publishing");
        return null;
      }

      const diffPath = `${diffsDir}/${file}`;
      const diff = parseDiffFromFile(diffPath);

      if (diff.tweetId !== undefined) {
        logger.debug(
          "Diff already published at %s",
          await getTwitUrl(diff.tweetId),
        );
        return;
      }

      const articlesDir = getArticlesDirForDiff(diff);
      const articlePath = `${articlesDir}/${filenamify(diff.articleId)}.json`;
      const article = parseArticleFromFile(articlePath);
      const tweetId = await publishOnTwitter(article, diff, snapshot);

      diff.tweetId = tweetId;
      article.lastTweetId = tweetId;
      logger.info("Diff published: %s", await getTwitUrl(article.lastTweetId));
      saveToJsonFile(diffPath, diff);
      saveToJsonFile(articlePath, article);

      // removeFile(diffPath);
      // removeFile(snapshot);
    });
  });
}

async function publishOnTwitter(
  article: Article,
  diff: ArticleDiff,
  snapshot: string,
) {
  // If it's the first twit to be published in reply to the original twit
  if (article.lastTweetId === undefined) {
    logger.error(
      "Article %s has not been tweeted yet. Cannot proceed",
      article.url,
    );
    return null;
  }
  // If it's not, then need to reply to the last one (thread)
  const tweet = await continueThread(article, diff, snapshot);
  if (tweet.errors) {
    logger.error("Error publishing diff %s", diff.createdAt);
    logger.error(tweet.errors);
    return null;
  }

  return tweet.data.id;
}
