import "dotenv/config";
import { FeedConfig, DiffType, ArticleDiff } from "./types.js";
import { extract as feedExtractor, FeedEntry } from "@extractus/feed-extractor";
import dayjs from "dayjs";
import { feedConfigs } from "./config.js";

import {
  articleExists,
  storeArticle,
  createArticle,
  retrievePreviousArticleVersion,
  createArticleDiff
} from "./services/articleService.js";

import { STATIC_FOLDER } from "./constants.js";
import { saveToJsonFile } from "./utils/fs-utils.js";
import { diffWords } from "diff";

const oneDayAgo = dayjs().subtract(1, "day");

await Promise.all(feedConfigs.map(async (feedConfig: FeedConfig) => {
  const feedData = await feedExtractor(feedConfig.url);
  const destFile = `${STATIC_FOLDER}/${feedConfig.id}.json`;
  saveToJsonFile(destFile, feedData);

  return Promise.all(feedData.entries.map((feedEntry) => parseFeedEntry(feedEntry, feedConfig)));
}));

process.exit();

async function parseFeedEntry(feedEntry: FeedEntry, feedConfig: FeedConfig) {
  try {
    const published = dayjs(feedEntry.published);
    if (published < oneDayAgo) {
      // Don't want to process entries longer that one week
      return;
    }

    const article = await createArticle(feedEntry, feedConfig);

    // If file does not exist yet, then it's brand new
    // we just need to store it
    if (!articleExists(article)) {
      void storeArticle(article);
      // TODO: post about this on the original twit (searched by url)
      //  which will be thread where the changes will be tracked
      console.log(`[NEW]: ${article.id}`);
      return;
    }

    const previous = retrievePreviousArticleVersion(article);
    const newDiffs: ArticleDiff[] = [];
    if (previous.title !== article.title) {
      const diff = diffWords(previous.title, article.title);
      newDiffs.push(createArticleDiff(DiffType.TITLE, diff));
    }

    if (previous.description !== article.description) {
      const diff = diffWords(previous.description, article.description);
      newDiffs.push(createArticleDiff(DiffType.DESCRIPTION, diff));
    }

    if (previous.contentText !== article.contentText) {
      const diff = diffWords(previous.contentText, article.contentText);
      newDiffs.push(createArticleDiff(DiffType.CONTENT, diff));
    }

    if (newDiffs.length === 0) {
      return console.log(`[NOT CHANGED]: ${article.id}`);
    }

    const changedArticle = {
      ...article,
      diffs: [
        ...article.diffs,
        ...newDiffs
      ]
    };
    void storeArticle(changedArticle);
    console.log(`[CHANGED]: ${article.id}`);
  } catch (err) {
    console.error("[ERROR]", feedEntry.id, err);
  }
}

// function postChanges() {
//   // Twitter process
// const diffyUrl = await postToDiffy(titlePatch);
//   const snapshotFilename = await createDiffSnapshot(diff);
// }
