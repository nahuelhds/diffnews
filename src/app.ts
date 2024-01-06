import "dotenv/config";
import { logger } from "./services/loggerService.js";
import { fetchNewArticles } from "./controller/feeds.js";
import { checkArticlesDiff } from "./controller/articles.js";
import { createDiffsSnapshots } from "./controller/diffs.js";

export async function app() {
  await Promise.all([
    ...fetchNewArticles(),
    ...checkArticlesDiff(),
    ...createDiffsSnapshots()
  ]);

  logger.info("All fine");
}
