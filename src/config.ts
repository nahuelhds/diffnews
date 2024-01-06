import { FeedConfig } from "./types.js";

export const feedConfigs: FeedConfig[] = [
  {
    "id": "el-pais",
    "name": "El País",
    "url": "https://www.elpais.com.uy/rss/",
    "twitter": "elpaisuy"
  }
  // {
  //   "id": "la-diaria",
  //   "name": "La Diaria",
  //   "url": "https://ladiaria.com.uy/feeds/articulos/"
  // },
  // {
  //   "id": "el-observador",
  //   "name": "El Observador",
  //   "url": "https://www.elobservador.com.uy/rss/elobservador.xml"
  // },
  // {
  //   "id": "semanario-brecha",
  //   "name": "Semanario Brecha",
  //   "url": "http://brecha.com.uy/feed/"
  // },
  // {
  //   "id": "montevideo-portal",
  //   "name": "Montevideo Portal",
  //   "url": "https://www.montevideo.com.uy/anxml.aspx?58"
  // }
];

export const twitterConfig = {
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET
}
