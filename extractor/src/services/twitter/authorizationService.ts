import "dotenv/config";

import inquirer from "inquirer";
import { TwitterApi } from "twitter-api-v2";

import { twitterConfig } from "../../config.js";
import { logger } from "../loggerService.js";

export async function authorizeNewApp() {
  const authClient = new TwitterApi({
    appKey: twitterConfig.consumerKey,
    appSecret: twitterConfig.consumerSecret,
  });

  const authLink = await authClient.generateAuthLink();

  const steps = [
    {
      type: "input",
      name: "login",
      message:
        "Log in to https://twitter.com as the user you want to tweet as and hit enter.",
    },
    {
      type: "input",
      name: "goToAuthLink",
      message: `Visit ${authLink.url} in your browser and hit enter`,
    },
    {
      type: "input",
      name: "pin",
      message: `What is your PIN?`,
      validate: (value) => {
        if (isNaN(value)) {
          return "Please enter a valid PIN number";
        }
        return true;
      },
    },
  ];

  const { pin } = await inquirer.prompt(steps);

  const client = new TwitterApi({
    appKey: twitterConfig.consumerKey,
    appSecret: twitterConfig.consumerSecret,
    accessToken: authLink.oauth_token,
    accessSecret: authLink.oauth_token_secret,
  });
  const { accessToken, accessSecret } = await client.login(pin);

  logger.info(
    "You have successfully log. Store this credentials on the environment configuration.",
  );
  logger.info("ACCESS_TOKEN=%s", accessToken);
  logger.info("ACCESS_TOKEN_SECRET=%s", accessSecret);
}
