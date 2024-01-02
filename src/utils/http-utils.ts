import fetch from "node-fetch";

export async function put(url: string, payload: object): Promise<unknown> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const bodyText = await response.text();
  try {
    return JSON.parse(bodyText);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse response json.\nBody:\n\n${bodyText}`);
    } else {
      throw error;
    }
  }
}
