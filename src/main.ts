import "dotenv/config";
import { extract as feedExtractor } from "@extractus/feed-extractor";
import { extract as articleExtractor } from "@extractus/article-extractor";

import feedConfigs from "./config/feeds.json" assert { type: "json" };

type FeedConfig = {
  name: string;
  skip_pattern: string;
  url: string;
}

const feedFetchOptions = {
  signal: AbortSignal.timeout(5000)
};

const articleFetchOptions = {
  signal: AbortSignal.timeout(5000)
};

feedConfigs.forEach(async (feedConfig: FeedConfig) => {
  const feed = await feedExtractor(feedConfig.url, undefined, feedFetchOptions);
  console.log(feed);
  feed.entries.forEach(async (entry) => {
    const article = await articleExtractor(entry.link, undefined, articleFetchOptions);
    console.log(article);
  });
});

