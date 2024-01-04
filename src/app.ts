import "dotenv/config";
import { parseFeeds } from "./controller/feeds.js";
import { parseArticles } from "./controller/articles.js";
import { prepareDiffsForPublishing } from "./controller/diffs.js";
import { logger } from "./services/loggerService.js";

export async function app() {
  await Promise.all([
    Promise.all(parseFeeds()).then(() => {
      logger.info("Feeds parsed");
    }),
    Promise.all(parseArticles()).then(() => {
      logger.info("Articles parsed");
    }),
    Promise.all(prepareDiffsForPublishing()).then(() => {
      logger.info("Diffs parsed");
    })
  ]);
}
