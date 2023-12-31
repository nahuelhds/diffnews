import { Change } from "diff";
import filenamify from "filenamify";
import fs from "fs";

import { STATIC_FOLDER } from "../constants.js";
import { Article, ArticleDiff, DiffType, FeedConfig } from "../types.js";
import { saveToJsonFile } from "../utils/fs-utils.js";

export function getDiffFilename(diff: ArticleDiff) {
  return `${STATIC_FOLDER}/${diff.feedConfigId}/diffs/${filenamify(
    diff.createdAt,
  )}.json`;
}

export async function storeDiff(diff: ArticleDiff) {
  return saveToJsonFile(getDiffFilename(diff), diff);
}

export function getDiffsDir(feedConfig: FeedConfig) {
  return `${STATIC_FOLDER}/${feedConfig.id}/diffs`;
}

export function getSnapshotsDir(feedConfig: FeedConfig) {
  return `${STATIC_FOLDER}/${feedConfig.id}/snapshots`;
}

export function getArticlesDirForDiff(diff: ArticleDiff) {
  return `${STATIC_FOLDER}/${diff.feedConfigId}/articles`;
}

export function createArticleDiff(
  article: Article,
  diffType: DiffType,
  diff: Change[],
): ArticleDiff {
  return {
    feedConfigId: article.feedConfigId,
    articleId: article.entryId,
    articleUrl: article.url,
    createdAt: new Date().toISOString(),
    publishedAt: undefined,
    type: diffType,
    changes: diff,
  };
}

export function parseDiffFromFile(filepath: string): ArticleDiff {
  const fileContent = fs.readFileSync(filepath, { encoding: "utf8" });
  return JSON.parse(fileContent) as ArticleDiff;
}
