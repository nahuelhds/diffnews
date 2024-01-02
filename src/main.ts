import "dotenv/config";
import { parseFeeds } from "./controller/feeds.js";
import { parseArticles } from "./controller/articles.js";
import { prepareDiffsForPublishing } from "./controller/diffs.js";

await Promise.all(parseFeeds());
await Promise.all(parseArticles());
await Promise.all(prepareDiffsForPublishing());
