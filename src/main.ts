import "dotenv/config";
import { FeedConfig } from "./types.js";
import { extract as feedExtractor, FeedEntry } from "@extractus/feed-extractor";
import dayjs from "dayjs";
import { feedConfigs } from "./config.js";
import { createPatch } from "diff";


import {
  articleExists,
  storeArticle,
  createArticle,
  articleHasChanged,
  retrievePreviousArticleVersion
} from "./services/articleService.js";
import { STATIC_FOLDER } from "./constants.js";
import { saveToJsonFile, saveToFile } from "./utils/fs-utils.js";
import { html as diff2html } from "diff2html";
import filenamify from "filenamify";
import { buildHTMLForScreenShot } from "./services/diff.js";

const oneDayAgo = dayjs().subtract(1, "day");
feedConfigs.forEach(async (feedConfig: FeedConfig) => {
  const feedData = await feedExtractor(feedConfig.url);
  const destFile = `${STATIC_FOLDER}/${feedConfig.id}.json`;
  saveToJsonFile(destFile, feedData);

  void feedData.entries.forEach((feedEntry) => parseFeedEntry(feedEntry, feedConfig));
});

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
    if (!articleHasChanged(article, previous)) {
      console.log(`[NOT CHANGED]: ${article.id}`);
      return;
    }

    if (previous.title !== article.title) {
      const diff = createPatch(article.id, previous.title, article.title);
      const html = diff2html(diff, {
        drawFileList: false
      });

      saveToFile(filenamify(article.id) + ".html", buildHTMLForScreenShot(html));

      // const diffyUrl = await postToDiffy(titlePatch);
      console.log(`[DIFF TITLE]: ${article.id}`);
    }


  } catch (err) {
    console.error("[ERROR]", feedEntry.id, err);
  }
}
