/**
 * Fetches a URL with a timeout.
 * If the request takes longer than the specified timeout period, it gets rejected with a timeout error.
 *
 * @param {string} input - The URL to fetch.
 * @returns {Promise<Response>} - A promise that resolves to the response of the fetch request.
 */
const timeOutMillis = 120 * 1000;
async function fetchWithTimeout(input: string): Promise<Response> {
  return (await Promise.race([
    fetch(input, { method: "HEAD" }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out.")), timeOutMillis),
    ),
  ])) as Response;
}

// ValidateURL
/**
 * Validates the HTTP response status of a given URL. It checks if the URL
 * returns any unacceptable error statuses (e.g., 404) or network errors
 * If the URL encounters any of these issues, the function returns false,
 * indicating an invalid or problematic URL. Otherwise, it returns true.
 *
 * @param {string} input - The URL to be validated.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the URL
 * response is acceptable, or `false` if the URL encounters unacceptable
 * errors or statuses.
 */
export const validateURLResponse = async (input: string) => {
  try {
    const response = await fetchWithTimeout(input);
    const status = response.status;
    const unacceptableErrors = [404];

    if (unacceptableErrors.includes(status)) {
      console.error("Invalid url - Unexpected response: ", input);
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
      return false;
    }
    return true;
  }
};
