import "dotenv/config";
import { FeedConfig } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir,
} from "../services/diffService.js";
import fs from "fs";
import { createChangesSnapshot } from "../services/snapshotService.js";
import { Change } from "diff";
import { logger } from "../services/loggerService.js";

type ChangePathTouple = [Change[], string];

/**
 * Traverses every diff file and generates the related screenshot
 */
export function createDiffsSnapshots() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    const changesToProcessSync = fs
      .readdirSync(diffsDir)
      .map((file): ChangePathTouple | null => {
        const snapshotPath = `${snapshotsDir}/${file}`;
        if (fs.existsSync(snapshotPath)) {
          return null;
        }

        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        return [diff.changes, `${snapshotPath}.jpeg`];
      })
      // Filter null values
      .filter((x) => x);

    if (changesToProcessSync.length === 0) {
      logger.debug("No diffs to publish");
      return;
    }

    for (const [changes, path] of changesToProcessSync) {
      logger.debug("Creating snapshot for path %s", path);
      await createChangesSnapshot(changes, path);
    }
    return;
  });
}
