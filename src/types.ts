import { ArticleData } from "@extractus/article-extractor";

export type FeedConfig = {
  id: string;
  name: string;
  url: string;
}

export type Article = ArticleData & { id: string, feedConfigId: string; contentText: string; }
