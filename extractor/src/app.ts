import "dotenv/config";

import { feedConfigs } from "./config.js";
import { checkArticlesDiff } from "./controller/articles.js";
import { createDiffsSnapshots } from "./controller/diffs.js";
import { fetchNewArticles } from "./controller/feeds.js";
import { logger } from "./services/loggerService.js";

export async function app() {
  await Promise.all([
    ...fetchNewArticles(feedConfigs),
    ...checkArticlesDiff(),
    ...createDiffsSnapshots(),
  ]);

  logger.info("All fine");
}
