import { ArticleData } from "@extractus/article-extractor";

export type FeedConfig = {
  id: string;
  name: string;
  url: string;
}

export type Article = ArticleData & { feedConfigId: string; contentText: string; }
