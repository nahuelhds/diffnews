import { ArticleData } from "@extractus/article-extractor";

export type FeedConfig = {
  id: string;
  name: string;
  url: string;
  twitter: string;
};

export type ArticleDiff = ArticleData & {
  current: Article;
  first: Article;
};

export type Article = ArticleData & {
  contentText: string;
};
