// import { Collection } from "mongodb";
import { validateURLResponse } from "./utils";

export interface LinkResource {
  manta_link: string;
  tiles_id: string;
}

/**
 * Tests the links contained within a collection of resources, which retrieves from the given MongoDB collection,
 * constructs a URL from its `manta_link` and `tiles_id` fields,
 * validates this URL using the `validateURLResponse` function.
 * @param {Collection} resourceCollection - The MongoDB collection containing
 *   the resource documents to be tested. Each document should have `manta_link`
 *   and `tiles_id` fields.
 */
export const testResourcesLinks = async (
  resourceCollection: LinkResource[],
) => {
  const resourceLinkVerification = resourceCollection.map(async (resource) => {
    const concatenatedLink = `${resource.manta_link}${resource.tiles_id}`;
    return await validateURLResponse(concatenatedLink);
  });

  const results = await Promise.all(resourceLinkVerification);
  return results.every((result) => result === true);
};
