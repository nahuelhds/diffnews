import { FeedEntry } from "@extractus/feed-extractor";
import { extract as articleExtractor } from "@extractus/article-extractor";
import filenamify from "filenamify";
import { STATIC_FOLDER } from "../constants.js";
import { FeedConfig, Article, DiffType } from "../types.js";
import fs from "fs";
import { saveToJsonFile } from "../utils/fs-utils.js";
import { compile } from "html-to-text";
import { Change } from "diff";

const htmlToText = compile({ wordwrap: 130 });

export async function createArticle(entry: FeedEntry, feedConfig: FeedConfig): Promise<Article> {
  const articleData = await articleExtractor(entry.link);
  return {
    ...articleData,
    id: entry.id,
    feedConfigId: feedConfig.id,
    contentText: htmlToText(articleData.content),
    diffs: []
  };
}

export function getArticleFilename(article: Article) {
  return `${STATIC_FOLDER}/${article.feedConfigId}/${filenamify(article.id)}.json`;
}

export function articleExists(article: Article) {
  return fs.existsSync(getArticleFilename(article));
}

export async function storeArticle(article: Article) {
  return saveToJsonFile(getArticleFilename(article), article);
}

export function retrievePreviousArticleVersion(article: Article): Article {
  const fileContent = fs.readFileSync(getArticleFilename(article), { encoding: "utf8" });
  return JSON.parse(fileContent) as Article;
}

export function articleHasChanged(article: Article, previous: Article): boolean {
  if (previous.title !== article.title) {
    return true;
  }

  if (previous.description !== article.description) {
    return true;
  }

  return previous.contentText !== article.contentText;
}

export function pushDiffToArticle(article: Article, diffType: DiffType, diff: Change[]) {
  return {
    ...article,
    diffs: [
      ...article.diffs,
      {
        createdAt: new Date().toISOString(),
        published: false,
        type: diffType,
        diff: diff
      }
    ]
  };
}
