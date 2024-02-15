import { validateURLResponse } from "./utils";

export interface LinkFile {
  name: string;
  url: string;
}

export const testFilesLinks = async (fileCollection: LinkFile[]) => {
  const fileLinkVerification = fileCollection.map(async (file: LinkFile) => {
    return await validateURLResponse(file.url);
  });

  const results = await Promise.all(fileLinkVerification);
  return results.every((result) => result === true);
};
