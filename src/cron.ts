import { app } from "./app.js";

while (true) {
  await app();
  // every five minutes, run everything again
  await sleep(1000 * 60 * 5);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
