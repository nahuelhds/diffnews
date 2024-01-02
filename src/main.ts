import "dotenv/config";
import { parseFeeds } from "./controller/feeds.js";
import { parseArticles } from "./controller/articles.js";

await Promise.all(parseFeeds());
await Promise.all(parseArticles());
