import "dotenv/config";
import { FeedConfig } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir
} from "../services/diffService.js";
import fs from "fs";
import { createChangesSnapshot } from "../services/diff.js";

/**
 * Traverses every diff file and generates the related screenshot
 */
export function prepareDiffsForPublishing() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    return fs.readdirSync(diffsDir)
      .map(async (file) => {
        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        const snapshotPath = `${snapshotsDir}/${file}`;
        return createChangesSnapshot(diff.changes, `${snapshotPath}.jpeg`);
      });
  });
}
