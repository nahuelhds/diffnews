import { FeedConfig } from "../types.js";
import { fetchNewArticles } from "./feeds.js";
import { extract } from "@extractus/feed-extractor";
import { saveToJsonFile } from "../utils/fs-utils.js";
import { MOCKED_FEED_DATA } from "./__mocks__/feedData.js";
import { PUBLIC_FOLDER } from "../constants.js";
import MockedFunction = jest.MockedFunction;

jest.mock("@extractus/feed-extractor");
jest.mock("../utils/fs-utils.js");
jest.mock("../services/articleService.js");
describe("fetchNewArticles", () => {

  const extractMock = extract as MockedFunction<typeof extract>;
  const saveToJsonFileMock = saveToJsonFile as MockedFunction<typeof saveToJsonFile>;

  it("should return a promise", () => {
    extractMock.mockResolvedValue(MOCKED_FEED_DATA);

    const expectedId = "test-id";
    const expectedPath = `${PUBLIC_FOLDER}/${expectedId}.json`;

    const feedConfigs: FeedConfig[] = [{
      id: expectedId,
      name: "Test Feed",
      url: "some-url",
      twitter: "twitter-account"
    }];

    fetchNewArticles(feedConfigs);

    expect(saveToJsonFileMock).toHaveBeenCalledWith(expectedPath, MOCKED_FEED_DATA);
  });
});
