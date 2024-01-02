import { put } from "../utils/http-utils.js";
import { saveToFile, removeFile } from "../utils/fs-utils.js";
import { Change, diffWords } from "diff";
import puppeteer from "puppeteer";
import { randomUUID } from "node:crypto";
import { STATIC_FOLDER } from "../constants.js";
import sharp from "sharp";

type CreateDiffResponse = { _sharedDiff: { id: string } };
type ApiError = { error: string };

function isCreateDiffResponse(obj: unknown): obj is CreateDiffResponse {
  return (obj as CreateDiffResponse)._sharedDiff.id !== undefined;
}

function isApiError(obj: unknown): obj is ApiError {
  return (obj as ApiError).error !== undefined;
}

// Taken from https://github.com/rtfpessoa/diff2html-cli/blob/b638c9f7d5493026861b0afd2fbd5e350100744f/src/cli.ts#L149
export async function postToDiffy(diff: string): Promise<string> {
  const response = await put("https://diffy.org/api/diff/", { diff: diff });

  if (!isCreateDiffResponse(response)) {
    if (isApiError(response)) {
      throw new Error(response.error);
    } else {
      throw new Error(
        `Could not find 'id' of created diff in the response json.\nBody:\n\n${JSON.stringify(response, null, 2)}`
      );
    }
  }

  return `https://diffy.org/diff/${response._sharedDiff.id}`;
}

export async function createDiffSnapshot(previous: string, current: string) {
  const diff = diffWords(previous, current);
  const html = createHtmlFromChanges(diff);
  const snapshotFilename = await takeSnapshot(html);
}

function createHtmlFromChanges(changes: Change[]) {
  const htmlString = changes.map((part) => {
    if (part.removed) {
      return `<del style="background-color: #fee8e9;">${part.value}</del>`;
    }

    if (part.added) {
      return `<ins style="background-color: #dfd;">${part.value}</ins>`;
    }
    return part.value;
  });

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="../assets/styles.css">
      </head>
      <body>
      <p>
      ${htmlString.join("")}
      </p>
      </body>
    </html>
  `;
}

export async function takeSnapshot(html: string) {

  // Save the file
  const filename = `${STATIC_FOLDER}/${randomUUID()}.html`;
  saveToFile(filename, html);

  // Open the file with the browser
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1600 });
  await page.goto(`file://${process.cwd()}/${filename}`);

  // Take the size of the text
  const diffElement = await page.$("p");
  const { x, y, width, height } = await diffElement.boundingBox();

  // Take the snapshot and then crop just the text
  const tempSnapshotFilename = `${filename}-tmp.png`;
  const snapshotFilename = filename.replace("html", "jpeg");
  await page.screenshot({ path: tempSnapshotFilename });

  await sharp(tempSnapshotFilename)
    .extract({
      left: Math.floor(x),
      top: Math.floor(y),
      width: Math.ceil(width),
      height: Math.ceil(height)
    })
    .toFile(snapshotFilename);

  // Delete the temporary files
  removeFile(tempSnapshotFilename);
  removeFile(filename);

  // Return the filename of the snapshot
  return snapshotFilename;
}
