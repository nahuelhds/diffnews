import "dotenv/config";
import { FeedConfig } from "./types.js";
import { feedConfigs } from "./config.js";
import filenamify from "filenamify";
import { extract as feedExtractor } from "@extractus/feed-extractor";
import { extract as articleExtractor } from "@extractus/article-extractor";
import { saveToJsonFile } from "./utils.js";
import dayjs from "dayjs";

const STATIC_FOLDER = "./static";

const fetchOptions = {
  // signal: AbortSignal.timeout(5000)
};

const oneDayAgo = dayjs().subtract(1, "day");
feedConfigs.forEach(async (feedConfig: FeedConfig) => {
  const feedData = await feedExtractor(feedConfig.url, undefined, fetchOptions);
  const destFile = `${STATIC_FOLDER}/${feedConfig.id}.json`;
  saveToJsonFile(destFile, feedData);

  for (const entry of feedData.entries) {
    try {
      const published = dayjs(entry.published);
      if (published < oneDayAgo) {
        // Don't want to process entries longer that one week
        return;
      }
      const entryData = await articleExtractor(entry.link, undefined, fetchOptions);
      const entryFilename = filenamify(entry.id);
      const entryDestFile = `${STATIC_FOLDER}/${feedConfig.id}/${entryFilename}.json`;
      saveToJsonFile(entryDestFile, entryData);
      console.log(`ENTRY: ${entry.link}`);
    } catch (err) {
      console.warn("Could not parse entry: ", entry.link, err);
      console.table(entry);
    }
  }
});

