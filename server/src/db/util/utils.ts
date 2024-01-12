import * as fs from "fs/promises";

// Maximum Connection Time for Request
const timeOutMillis = 120 * 1000;
async function fetchWithTimeout(input: string): Promise<Response> {
  return (await Promise.race([
    fetch(input, { method: "HEAD" }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out.")), timeOutMillis),
    ),
  ])) as Response;
}

// LogError
async function logError(errorLog: string, message: string): Promise<void> {
  await fs.appendFile(errorLog, message + "\n");
}

// ValidateURL
export const validateURLResponse = async (errorLog: string, input: string) => {
  try {
    const response = await fetchWithTimeout(input);
    const status = response.status;
    const unacceptableErrors = [404];

    if (unacceptableErrors.includes(status)) {
      const errorMessage = `Invalid url - Unexpected status code: "${input}",Status code:${status}`;
      console.error("Invalid url - Unexpected response: ", input);
      await logError(errorLog, errorMessage);
      return false;
    }
    return true;
  } catch (error) {
    const unacceptableErrors = ["ENOTFOUND", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"];
    const isUnacceptableError =
      unacceptableErrors.includes(error.code) ||
      error.message.includes("timed out");
    if (isUnacceptableError) {
      const errorMessage = `Invalid url - Unexpected response: "${input}", Error: ${error.message}`;
      console.error(errorMessage);
      await logError(errorLog, errorMessage);
      return false;
    }
    return true;
  }
};
