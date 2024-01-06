import "dotenv/config";
import { logger } from "./services/loggerService.js";
import { fetchNewArticles } from "./controller/feeds.js";
import { checkArticlesDiff } from "./controller/articles.js";
import { createDiffsSnapshots } from "./controller/diffs.js";
import {
  publishDiffsOnTwitter,
  publishArticlesOnTwitter
} from "./controller/publish.js";

export async function app() {
  await Promise.all(fetchNewArticles()).then(() => {
    logger.info("fetchNewArticles");
  });
  await Promise.all(publishArticlesOnTwitter()).then(() => {
    logger.info("publishArticlesOnTwitter");
  });
  await Promise.all(checkArticlesDiff()).then(() => {
    logger.info("checkArticlesDiff");
  });
  await Promise.all(createDiffsSnapshots()).then(() => {
    logger.info("createDiffsSnapshots");
  });
  await Promise.all(publishDiffsOnTwitter()).then(() => {
    logger.info("publishDiffsOnTwitter");
  });
}
