import "dotenv/config";
import feeds from "./config/feeds.json" assert { type: "json" };

type Feed = {
  name: string;
  skip_pattern: string;
  url: string;
}

feeds.forEach((feed: Feed) => {
  console.log(feed.name);
  console.log(feed.skip_pattern);
  console.log(feed.url);
});
