import { FeedConfig, ArticleDiff, DiffType, Article } from "../types.js";
import dayjs from "dayjs";
import {
  storeArticle,
  getArticlesDir,
  parseArticleFromFile,
  createNextArticle
} from "../services/articleService.js";
import { diffWords } from "diff";
import { feedConfigs } from "../config.js";
import fs from "fs";
import { storeDiff, createArticleDiff } from "../services/diffService.js";
import { logger } from "../services/loggerService.js";


const oneDayAgo = dayjs().subtract(1, "day");

/**
 * Fetches every article and compare it with its current version.
 * It registers every diff and saves them in a separate folder
 */
export function parseArticles() {
  return feedConfigs.map((feedConfig: FeedConfig) => {
    const articlesDir = getArticlesDir(feedConfig);
    return fs.readdirSync(articlesDir)
      .map(async (file) => {
        const articlePath = `${articlesDir}/${file}`;
        const article = parseArticleFromFile(articlePath);
        const next = await createNextArticle(article);
        const diffs = getDifferences(article, next);

        if (diffs === null) {
          logger.debug(`[TOO OLD]: ${file}`);
          return articlePath;
        }

        if (diffs.length === 0) {
          logger.debug(`[NO DIFFS]: ${file}`);
          return articlePath;
        }

        // There are diffs
        logger.info(`[DIFFS FOUND]: ${file}`);
        // Store the diffs first
        diffs.map(storeDiff);

        // Then update the article state
        return storeArticle(next);
      });
  });
}

function getDifferences(current: Article, next: Article) {
  // TODO: make this configurable by feed
  const published = dayjs(current.published);
  if (published < oneDayAgo) {
    // Don't want to process entries longer than one day
    return null;
  }

  // Check if article has changed
  const newDiffs: ArticleDiff[] = [];
  if (current.title !== next.title) {
    const diff = diffWords(current.title, next.title);
    newDiffs.push(createArticleDiff(next, DiffType.TITLE, diff));
  }

  if (current.description !== next.description) {
    const diff = diffWords(current.description, next.description);
    newDiffs.push(createArticleDiff(next, DiffType.DESCRIPTION, diff));
  }

  // if (current.contentText !== next.contentText) {
  //   const diff = diffWords(current.contentText, next.contentText);
  //   newDiffs.push(createArticleDiff(next, DiffType.CONTENT, diff));
  // }

  return newDiffs;
}
