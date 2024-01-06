import "dotenv/config";
import { FeedConfig, ArticleDiff, Article } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir,
  getArticlesDirForDiff
} from "../services/diffService.js";
import fs from "fs";
import { logger } from "../services/loggerService.js";
import {
  startThread,
  getTwitUrl,
  continueThread
} from "../services/twitter/apiService.js";
import {
  parseArticleFromFile,
  getArticlesDir
} from "../services/articleService.js";
import { saveToJsonFile } from "../utils/fs-utils.js";
import filenamify from "filenamify";

/**
 * Traverses every article and starts what will be the thread of it
 */
export function publishArticles() {
  return feedConfigs.map((feedConfig: FeedConfig) => {
    const articlesDir = getArticlesDir(feedConfig);
    return fs.readdirSync(articlesDir).map(async (file) => {
      const articlePath = `${articlesDir}/${file}`;
      const article = parseArticleFromFile(articlePath);

      if (!article.url.match("https://www.elpais.com.uy/informacion/politica/")) {
        return;
      }

      if (article.lastTweetId !== undefined) {
        logger.info("Article %s already published at %s", await getTwitUrl(article));
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
export function publishDiffs() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    fs.readdirSync(diffsDir)
      .map(async (file) => {
        const snapshot = `${snapshotsDir}/${file}.jpeg`;
        if (!fs.existsSync(snapshot)) {
          logger.debug("Diff is not ready for publishing");
          return null;
        }

        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        const articlesDir = getArticlesDirForDiff(diff);
        const articlePath = `${articlesDir}/${filenamify(diff.articleId)}.json`;
        const article = parseArticleFromFile(articlePath);

        article.lastTweetId = await publishOnTwitter(article, diff, snapshot);
        logger.info("Diff published: %s", await getTwitUrl(article));
        saveToJsonFile(articlePath, article);

        // removeFile(diffPath);
        // removeFile(snapshot);
      });
  });
}

async function publishOnTwitter(article: Article, diff: ArticleDiff, snapshot: string) {
  // If it's the first twit to be published in reply to the original twit
  if (article.lastTweetId === undefined) {
    logger.error("Article %s has not been tweeted yet. Cannot proceed", article.url);
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
