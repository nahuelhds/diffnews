import "dotenv/config";
import { logger } from "./services/loggerService.js";
import { parseFeeds } from "./controller/feeds.js";
import { parseArticles } from "./controller/articles.js";
import { prepareDiffsForPublishing } from "./controller/diffs.js";
import { publishDiffs, publishArticles } from "./controller/publish.js";

export async function app() {
  await Promise.all(parseFeeds()).then(() => {
    logger.info("Feeds parsed");
  });
  await Promise.all(parseArticles()).then(() => {
    logger.info("Articles parsed");
  });
  await Promise.all(prepareDiffsForPublishing()).then(() => {
    logger.info("Diff preparation finished");
  });
  await Promise.all(publishArticles()).then(() => {
    logger.info("Diffs publishing finished");
  });
  await Promise.all(publishDiffs()).then(() => {
    logger.info("Diffs publishing finished");
  });
}
