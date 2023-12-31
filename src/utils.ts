import path from "node:path";
import fs from "fs";

export function saveToJsonFile(destFile: string, feedData: object) {
  // Check if directory exists; if not, create it
  const dir = path.dirname(destFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the parsed data to the file
  const jsonFeedData = JSON.stringify(feedData, null, 2);
  fs.writeFileSync(destFile, jsonFeedData);
  return destFile;
}
