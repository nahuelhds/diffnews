import { ArticleData } from "@extractus/article-extractor";
import { compile } from "html-to-text";
import { Article } from "@/app/types";

export function createArticle(articleData: ArticleData): Article {
  const htmlToText = compile({ wordwrap: 130 });
  return {
    ...articleData,
    contentText: htmlToText(articleData.content ?? ""),
  };
}
