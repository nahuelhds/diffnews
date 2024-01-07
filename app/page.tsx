import { Article } from "@/app/types";
import { promises as fs } from "fs";
import { Suspense } from "react";

async function getArticle(url: string): Promise<Article | null> {
  "use server";
  const hashedUrl = btoa(url);

  try {
    const dataString = await fs.readFile(
      process.cwd() + `/archive/${hashedUrl}.json`,
      "utf8"
    );
    return JSON.parse(dataString) as Article;
  } catch (err) {
    return null;
  }
}

export default async function ArticlePage({
  searchParams,
}: {
  searchParams: { url: string };
}) {
  if (!searchParams?.url) {
    return <p>Debes proveer una URL para ver si historial de edición</p>;
  }

  // Wait for the artist
  const articleData: Article = getArticle(searchParams.url as string);
  const diffsData:Article = getArticle(searchParams.url as string);

  const [article, diffs] = await Promise.all([articleData, diffsData])

  if (!article) {
    return (
      <p>
        No existe el articulo con url <pre>{searchParams.url}</pre>
      </p>
    );
  }
  // const diffs = await getDiffs(username);

  return (
    <>
      <Suspense fallback={<div>Loading article...</div>}>
        <h1>{article.title}</h1>
      </Suspense>
      <Suspense fallback={<div>Loading diffs...</div>}>
        <h1>{diffs.url}</h1>
      </Suspense>
    </>
  );
}
