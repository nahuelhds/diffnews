import { FeedEntry } from "@extractus/feed-extractor";
import { extract as articleExtractor } from "@extractus/article-extractor";
import filenamify from "filenamify";
import { PUBLIC_FOLDER } from "../constants.js";
import { FeedConfig, Article } from "../types.js";
import fs from "fs";
import { saveToJsonFile } from "../utils/fs-utils.js";
import { compile } from "html-to-text";

const htmlToText = compile({ wordwrap: 130 });

export async function createArticle(entry: FeedEntry, feedConfig: FeedConfig): Promise<Article> {
  const articleData = await articleExtractor(entry.link);
  return {
    ...articleData,
    entryId: entry.id,
    feedConfigId: feedConfig.id,
    contentText: htmlToText(articleData.content),
  };
}

export async function createNextArticle(current: Article): Promise<Article> {
  const articleData = await articleExtractor(current.url);
  return {
    ...current,
    ...articleData,
    contentText: htmlToText(articleData.content),
  };
}

export function getArticlesDir(feedConfig: FeedConfig) {
  return `${PUBLIC_FOLDER}/${feedConfig.id}/articles`;
}

export function parseArticleFromFile(filepath: string): Article {
  const fileContent = fs.readFileSync(filepath, { encoding: "utf8" });
  return JSON.parse(fileContent) as Article;
}

export function getArticleFilename(article: Article) {
  return `${PUBLIC_FOLDER}/${article.feedConfigId}/articles/${filenamify(article.entryId)}.json`;
}

export function articleExists(article: Article) {
  return fs.existsSync(getArticleFilename(article));
}

export async function storeArticle(article: Article) {
  return saveToJsonFile(getArticleFilename(article), article);
}
