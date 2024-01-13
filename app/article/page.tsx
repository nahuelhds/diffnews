import "./diff2html.min.css";
import "./page.css";

import {
  ArticleData,
  extract as articleExtractor,
} from "@extractus/article-extractor";
import crypto from "crypto";
import { createTwoFilesPatch } from "diff";
import { html } from "diff2html";
import { compile } from "html-to-text";
import { Suspense } from "react";

function buildFilename(url: string, outputLength = 40) {
  return crypto
    .createHash("shake256", { outputLength })
    .update(url)
    .digest("base64url");
}

const htmlToText = compile({ wordwrap: 130 });

async function tryFetchArticle(url: string) {
  const hashedUrl = buildFilename(url);
  const archived = (await import(
    `../archive/${hashedUrl}.json`
  )) as ArticleData;
  return archived;
}

async function getArticleWithHtmlDiff(
  url: string
): Promise<[ArticleData, string] | null> {
  "use server";

  try {
    const archived = await tryFetchArticle(url);
    const current = await articleExtractor(url);
    if (!current) {
      return null;
    }

    const diffs = [];
    if (current.title !== archived.title) {
      diffs.push(
        createTwoFilesPatch(
          "Title",
          "Title",
          archived.title ?? "",
          current.title ?? ""
        )
      );
    }
    if (current.description !== archived.description) {
      diffs.push(
        createTwoFilesPatch(
          "Description",
          "Description",
          archived.description ?? "",
          current.description ?? ""
        )
      );
    }
    if (current.content !== archived.content) {
      diffs.push(
        createTwoFilesPatch(
          "Content",
          "Content",
          htmlToText(archived.content ?? ""),
          htmlToText(current.content ?? "")
        )
      );
    }

    return [
      current,
      html(diffs.join(""), {
        diffStyle: "word",
        drawFileList: false,
        matching: "lines",
        outputFormat: "side-by-side",
      }),
    ];
  } catch (err) {
    return null;
  }
}

export default async function ArticlePage({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  if (!searchParams.url) {
    return <p>Debes proveer una URL para ver si hay historial de edición</p>;
  }
  const res = await getArticleWithHtmlDiff(searchParams.url);
  if (res === null) {
    return (
      <p>
        No existe el articulo con url{" "}
        <a href={searchParams.url}>{searchParams.url}</a>
      </p>
    );
  }

  const [current, htmlDiff] = res;
  return (
    <>
      <Suspense fallback={<div>Loading article...</div>}>
        {htmlDiff && (
          <>
            <a href={searchParams.url}>{current.title}</a>
            <span dangerouslySetInnerHTML={{ __html: htmlDiff }}></span>
          </>
        )}
      </Suspense>
    </>
  );
}
