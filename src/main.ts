import "dotenv/config";
import { FeedConfig } from "./types.js";
import { extract as feedExtractor, FeedEntry } from "@extractus/feed-extractor";
import dayjs from "dayjs";
import { feedConfigs } from "./config.js";

import { articleExists, storeArticle, createArticle } from "./services/articleService.js";
import { STATIC_FOLDER } from "./constants.js";
import { saveToJsonFile } from "./utils.js";

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
      console.log(`[NEW] ARTICLE: ${article.url}`);
      return;
    }

    // if (!entryHasChanged(entry)) {
    //   return;
    // }
    console.log(`[UPDATE] ARTICLE: ${article.url}`);
  } catch (err) {
    console.warn("Could not parse entry: ", feedEntry.link, err);
    console.table(feedEntry);
  }
}
