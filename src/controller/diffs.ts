import "dotenv/config";
import { FeedConfig } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir
} from "../services/diffService.js";
import fs from "fs";
import { createChangesSnapshot } from "../services/snapshotService.js";

/**
 * Traverses every diff file and generates the related screenshot
 */
export function prepareDiffsForPublishing() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    const changesToProcessSync = fs.readdirSync(diffsDir)
      .map((file) => {
        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        const snapshotPath = `${snapshotsDir}/${file}`;
        return { changes: diff.changes, path: `${snapshotPath}.jpeg` };
      });
    for (const keyValue of changesToProcessSync) {
      await createChangesSnapshot(keyValue.changes, keyValue.path);
    }
    return;
  });
}
