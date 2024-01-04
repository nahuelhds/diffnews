import "dotenv/config";
import { FeedConfig, ArticleDiff, DiffType } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir
} from "../services/diffService.js";
import fs from "fs";
import { logger } from "../services/loggerService.js";

/**
 * Traverses every diff file and generates the related screenshot
 */
export function publishDiffs() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    fs.readdirSync(diffsDir)
      .map((file) => {
        const snapshot = `${snapshotsDir}/${file}.jpeg`;
        if (!fs.existsSync(snapshot)) {
          logger.debug("Diff is not ready for publishing");
          return null;
        }

        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        publishOnTwitter(diff, snapshot);

        // removeFile(diffPath);
        // removeFile(snapshot);
      });
  });
}

function publishOnTwitter(diff: ArticleDiff, snapshot: string) {
  // If it's the first twit to be published in reply to the original twit
  if (diff.lastTwitterStatusId !== undefined) {
    // If it's not, then need to reply to the last one (thread)
    continueThread(diff.lastTwitterStatusId, diff, snapshot);
    return;
  }

  createThread(diff, snapshot);
  logger.info("Published %s diff on %s Twitter for snapshot %s", DiffType[diff.type], diff.feedConfigId, snapshot);
  return;
}

function createThread(diff: ArticleDiff, snapshot: string) {
  logger.debug("Starting thread with a %s diff for %s and snapshot %s", DiffType[diff.type], diff.feedConfigId, snapshot);
}

function continueThread(statusId: string, diff: ArticleDiff, snapshot: string) {
  logger.debug("Continuing thread with a %s diff for %s and snapshot %s", statusId, diff.feedConfigId, snapshot);
}
