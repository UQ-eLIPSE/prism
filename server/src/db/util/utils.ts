import * as fs from "fs/promises";
import * as path from "path";

// This Section is config log files
const parentDir = path.dirname(__dirname);
const resourcesLinksLogs = `${parentDir}/broken-links-logs.csv`;
const headers = "brokenLink,errorCode\n";
// Utility function to write headers to CSV
async function writeCsvHeaders(
  filePath: string,
  headers: string,
): Promise<void> {
  await fs.writeFile(filePath, headers);
}
// LogError
async function logError(errorLog: string, message: string): Promise<void> {
  await fs.appendFile(errorLog, message + "\n");
}
//Set Timeout
async function fetchWithTimeout(input: string): Promise<Response> {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    const timeOutMillis = 120 * 1000;
    timeoutId = setTimeout(() => {
      reject(new Error("Request timed out."));
    }, timeOutMillis);
  });

  try {
    return (await Promise.race([
      fetch(input, { method: "HEAD" }),
      timeoutPromise,
    ])) as Response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates the HTTP response of a given URL. This function uses the
 * `fetchWithTimeout` function to send a request to the URL and then checks
 * the response status. If the status is within the unacceptable range (e.g., 404),
 * or if network-related errors occur (e.g., ENOTFOUND, UNABLE_TO_VERIFY_LEAF_SIGNATURE,
 * or a timeout), it logs the error and records it in a CSV file.
 *
 * @param {string} input - The URL to be validated.
 * @returns {Promise<boolean>} - A promise that resolves to `false` if the URL
 *   encounters unacceptable errors or statuses, and `true` otherwise.
 */
export const validateURLResponse = async (input: string) => {
  try {
    const response = await fetchWithTimeout(input);
    const status = response.status;
    const unacceptableErrors = [404];

    if (unacceptableErrors.includes(status)) {
      const errorMessage = `Invalid url - Unexpected status code: "${input}",Status code:${status}`;
      console.error("Invalid url - Unexpected response: ", input);
      await writeCsvHeaders(resourcesLinksLogs, headers);
      await logError(resourcesLinksLogs, errorMessage);
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
      await writeCsvHeaders(resourcesLinksLogs, headers);
      await logError(resourcesLinksLogs, errorMessage);
      return false;
    }
    return true;
  }
};
