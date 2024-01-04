import "dotenv/config";
import { FeedConfig } from "../types.js";
import { feedConfigs } from "../config.js";
import {
  getDiffsDir,
  parseDiffFromFile,
  getSnapshotsDir
} from "../services/diffService.js";
import fs from "fs";
import {
  createChangesSnapshot,
  getBrowserInstance
} from "../services/snapshotService.js";
import { Change } from "diff";

type ChangePathTouple = [Change[], string]

/**
 * Traverses every diff file and generates the related screenshot
 */
export function prepareDiffsForPublishing() {
  return feedConfigs.map(async (feedConfig: FeedConfig) => {
    const diffsDir = getDiffsDir(feedConfig);
    const snapshotsDir = getSnapshotsDir(feedConfig);
    const changesToProcessSync = fs.readdirSync(diffsDir)
      .map((file): (ChangePathTouple | null) => {
        const snapshotPath = `${snapshotsDir}/${file}`;
        if (fs.existsSync(snapshotPath)) {
          return null;
        }

        const diffPath = `${diffsDir}/${file}`;
        const diff = parseDiffFromFile(diffPath);

        return [diff.changes, `${snapshotPath}.jpeg`];
      })
      // Filter null values
      .filter(x => x);

    for (const [changes, path] of changesToProcessSync) {
      await createChangesSnapshot(changes, path);
    }

    // Close puppeteer
    const browser = await getBrowserInstance();
    await browser.close();
    return;
  });
}
