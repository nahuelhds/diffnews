import { ArticleData } from "@extractus/article-extractor";
import { Article } from "../types.js";
import { compile } from "html-to-text";

const htmlToText = compile({ wordwrap: 130 });

export function createArticle(articleData: ArticleData): Article {
  return {
    ...articleData,
    contentText: htmlToText(articleData.content)
  };
}
