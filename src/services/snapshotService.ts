import { put } from "../utils/http-utils.js";
import { saveToFile, removeFile } from "../utils/fs-utils.js";
import { Change } from "diff";
import puppeteer, { BoundingBox, Browser } from "puppeteer";
import sharp from "sharp";
import { STATIC_FOLDER } from "../constants.js";
import { randomUUID } from "node:crypto";

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

// Algorithm strongly inspired on https://github.com/j-e-d/NYTdiff/blob/master/nytdiff.py#L186-L240
export async function createChangesSnapshot(diff: Change[], destinationFile: string) {
  const htmlContent = createHtmlFromChanges(diff);
  return await takeSnapshot(htmlContent, destinationFile);
}

export async function takeSnapshot(html: string, destinationFile: string) {
  // Create the HTML
  const filename = `${STATIC_FOLDER}/${randomUUID()}.html`;
  saveToFile(filename, html);

  // Take the snapshot
  const browserSnapshot = destinationFile.replace("jpeg", "tmp.png");
  const boundingBox = await takeBrowserSnapshot(filename, browserSnapshot);

  // Crop the text
  const finalSnapshot = destinationFile;
  await cropTextFromImage(browserSnapshot, boundingBox, finalSnapshot);

  // Delete the temporary files
  removeFile(browserSnapshot);
  removeFile(filename);

  // Return the filename of the snapshot
  return finalSnapshot;
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

async function cropTextFromImage(sourceFile: string, boundingBox: BoundingBox, destinationFile: string) {
  const { x, y, width, height } = boundingBox;
  try {
    await sharp(sourceFile)
      .extract({
        left: Math.floor(x),
        top: Math.floor(y),
        width: Math.ceil(width),
        height: Math.ceil(height)
      })
      .toFile(destinationFile);
  } catch (err) {
    // Error happen because of the excessive height
    // TODO: scroll when is too long based on <del> and <ins> tags and not just <p>
    console.error(sourceFile, boundingBox, err);
    return;
  }
}

let browserSingleton: Browser;

export async function getBrowserInstance() {
  if (browserSingleton !== undefined) {
    return browserSingleton;
  }
  browserSingleton = await puppeteer.launch({ headless: "new" });
  return browserSingleton;
}

async function takeBrowserSnapshot(htmlFile: string, screenshotDestinationPath: string) {
  // Open the file with the browser
  const browser = await getBrowserInstance();
  const page = await browser.newPage();
  ;
  await page.setViewport({ width: 800, height: 1600 });
  await page.goto(`file://${process.cwd()}/${htmlFile}`);

  // Take the size of the text
  const diffElement = await page.$("p");
  const boundingBox = await diffElement.boundingBox();
  await page.screenshot({ path: screenshotDestinationPath });
  return boundingBox;
}
