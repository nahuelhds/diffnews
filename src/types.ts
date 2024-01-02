import { ArticleData } from "@extractus/article-extractor";
import { Change } from "diff";

export type FeedConfig = {
  id: string;
  name: string;
  url: string;
}

export type ArticleDiff = {
  createdAt: string; // Date ISO
  type: DiffType;
  published: boolean;
  diff: Change[];
}

export type Article = ArticleData & {
  id: string,
  feedConfigId: string;
  contentText: string;
  diffs: ArticleDiff[]
}

export enum DiffType {
  TITLE,
  DESCRIPTION,
  CONTENT
}


