import { ArticleData } from "@extractus/article-extractor";
import { Change } from "diff";

export type FeedConfig = {
  id: string;
  name: string;
  url: string;
  twitter: string;
};

export type ArticleDiff = {
  articleId: string;
  articleUrl: string;
  changes: Change[];
  createdAt: string; // Date ISO
  feedConfigId: string;
  publishedAt?: string; // Date ISO
  type: DiffType;
  tweetId?: string; // url to the last twitter post
};

export type Article = ArticleData & {
  entryId?: string;
  feedConfigId?: string;
  contentText: string;
  lastTweetId?: string;
};

export enum DiffType {
  TITLE,
  DESCRIPTION,
  CONTENT,
}
