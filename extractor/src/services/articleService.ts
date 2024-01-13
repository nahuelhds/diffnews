import { extract as articleExtractor } from "@extractus/article-extractor";
import { FeedEntry } from "@extractus/feed-extractor";
import * as crypto from "crypto";
import fs from "fs";
import { compile } from "html-to-text";

import { ARCHIVE_FOLDER, STATIC_FOLDER } from "../constants.js";
import { Article, FeedConfig } from "../types.js";
import { saveToJsonFile } from "../utils/fs-utils.js";

const htmlToText = compile({ wordwrap: 130 });

export async function createArticle(entry: FeedEntry): Promise<Article> {
  const articleData = await articleExtractor(entry.link);
  return {
    ...articleData,
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
  return `${STATIC_FOLDER}/${feedConfig.id}/articles`;
}

export function parseArticleFromFile(filepath: string): Article {
  const fileContent = fs.readFileSync(filepath, { encoding: "utf8" });
  return JSON.parse(fileContent) as Article;
}

function buildFilename(url: string, outputLength = 40) {
  return crypto
    .createHash("shake256", { outputLength })
    .update(url)
    .digest("hex");
}
export function articleExists(article: Article) {
  return fs.existsSync(getArticleFilename(article));
}

export function getArticleFilename(article: Article) {
  const hashedUrl = buildFilename(article.url);
  return `${ARCHIVE_FOLDER}/${hashedUrl}.json`;
}

export async function storeArticle(article: Article) {
  return saveToJsonFile(getArticleFilename(article), article);
}
