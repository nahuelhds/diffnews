import { TwitterApi } from "twitter-api-v2";
import { twitterConfig } from "../../config.js";
import { Article, ArticleDiff, DiffType } from "../../types.js";

const client = new TwitterApi({
  appKey: twitterConfig.consumerKey,
  appSecret: twitterConfig.consumerSecret,
  accessToken: twitterConfig.accessToken,
  accessSecret: twitterConfig.accessTokenSecret
});
// This method is cached after the first time
const user = await client.currentUserV2();

export async function getTwitUrl(tweetId: string) {
  return `https://twitter.com/${user.data.username}/status/${tweetId}`;
}

export async function startThread(article: Article) {
  return await client.v2.tweet(`👉 Seguí la edición de esta nota en este hilo.\n\n"${article.title}"\n\n🔗 ${article.url} ${article.url}`);
}

export async function continueThread(article: Article, diff: ArticleDiff, snapshot: string) {
  const mediaId = await client.v1.uploadMedia(snapshot);
  const status = getStatusText(diff);
  return await client.v2.reply(status, article.lastTweetId, { media: { media_ids: [mediaId] } });
}

function getStatusText(diff: ArticleDiff) {
  switch (diff.type) {
    case DiffType.TITLE:
      return "Cambio en el título";
    case DiffType.DESCRIPTION:
      return "Cambio en la descripción";
    case DiffType.CONTENT:
      return "Cambio en el contenido";
    default:
      throw new Error("Unknown diff type: %s", diff.type);
  }
}
