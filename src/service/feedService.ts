import { extract as feedExtractor } from "@extractus/feed-extractor";

const feedFetchOptions = {
  signal: AbortSignal.timeout(5000)
};

export async function fetchFeed(url: string) {
  return await feedExtractor(url, undefined, feedFetchOptions);
}
