import path from "node:path";

import fs from "fs";

export function saveToJsonFile(destFile: string, jsonObject: object) {
  createFolderIfNotExists(destFile);

  // Write the parsed data to the file
  const jsonFeedData = JSON.stringify(jsonObject, null, 2);
  fs.writeFileSync(destFile, jsonFeedData, { encoding: "utf8" });
  return destFile;
}

export function saveToFile(destFile: string, htmlData: string) {
  createFolderIfNotExists(destFile);

  // Write the parsed data to the file
  fs.writeFileSync(destFile, htmlData,{ encoding: "utf8" });
  return destFile;
}


export function removeFile(filename: string) {
  // Write the parsed data to the file
  fs.unlinkSync(filename);
}

function createFolderIfNotExists(destFile: string) {
  // Check if directory exists; if not, create it
  const dir = path.dirname(destFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
