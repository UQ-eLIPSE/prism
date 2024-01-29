import { Collection } from "mongodb";
import { validateURLResponse } from "./utils";

interface LinkResource {
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
export const testResourcesLinks = async (resourceCollection: Collection) => {
  const resources = (
    await resourceCollection
      .find({}, { projection: { _id: 0, manta_link: 1, tiles_id: 1 } })
      .toArray()
  ).map((doc) => ({
    manta_link: doc.manta_link,
    tiles_id: doc.tiles_id,
  })) as LinkResource[];

  const resourceLinkVerification = resources.map(async (resource) => {
    const concatenatedLink = `${resource.manta_link}${resource.tiles_id}`;
    return await validateURLResponse(concatenatedLink);
  });

  const results = await Promise.all(resourceLinkVerification);
  return results.every((result) => result === true);
};
