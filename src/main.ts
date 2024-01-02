import "dotenv/config";
import { parseFeeds } from "./controller/feeds.js";
import { parseArticles } from "./controller/articles.js";
import { prepareDiffsForPublishing } from "./controller/diffs.js";

Promise.all(parseFeeds()).then(() => {
  console.log("Feeds parsed");
});

Promise.all(parseArticles()).then(() => {
  console.log("Articles parsed");
});

Promise.all(prepareDiffsForPublishing()).then(() => {
  console.log("Diffs parsed");
});
