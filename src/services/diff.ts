import { put } from "../utils/http-utils.js";
import fs from "fs";

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

const diffCss = fs.readFileSync("node_modules/diff2html/bundles/css/diff2html.min.css", { encoding: "utf8" });

export function buildHTMLForScreenShot(html: string) {
  return `<html><head><meta charset="UTF-8" /><style>${diffCss}</style></head><body>${html}</body></html>`;
}
