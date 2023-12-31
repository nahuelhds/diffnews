import "dotenv/config";

import { fetchFeed } from "./service/feedService.js";
import { saveToJsonFile } from "./service/fs.js";
import { FeedConfig } from "./types.js";
import { feedConfigs } from "./config.js";
import filenamify from "filenamify";

const STATIC_FOLDER = "./static";

feedConfigs.forEach(async (feedConfig: FeedConfig) => {
  const feedData = await fetchFeed(feedConfig.url);
  const destFile = `${STATIC_FOLDER}/${feedConfig.id}.json`;
  const feedDestFile = saveToJsonFile(destFile, feedData);
  console.log(`RSS feed saved to ${feedDestFile} successfully!`);

  feedData.entries.forEach(entry => {
    const entryFilename = filenamify(entry.id);
    const entryDestFile = `${STATIC_FOLDER}/${feedConfig.id}/${entryFilename}.json`;
    saveToJsonFile(entryDestFile, entry);
    console.log(`RSS feed saved to ${entryDestFile} successfully!`);
  });
});

