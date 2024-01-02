import { STATIC_FOLDER } from "../constants.js";
import { ArticleDiff, Article, DiffType } from "../types.js";
import { saveToJsonFile } from "../utils/fs-utils.js";
import { Change } from "diff";
import filenamify from "filenamify";

export function getDiffFilename(diff: ArticleDiff) {
  return `${STATIC_FOLDER}/${diff.feedConfigId}/diffs/${filenamify(diff.createdAt)}.json`;
}

export async function storeDiff(diff: ArticleDiff) {
  return saveToJsonFile(getDiffFilename(diff), diff);
}

export function createArticleDiff(article: Article, diffType: DiffType, diff: Change[]): ArticleDiff {
  return {
    feedConfigId: article.feedConfigId,
    articleId: article.entryId,
    articleUrl: article.url,
    createdAt: new Date().toISOString(),
    publishedAt: undefined,
    type: diffType,
    diff: diff
  };
}
