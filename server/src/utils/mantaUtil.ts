import { execSync } from "child_process";

/**
 * uploadZipManta
 * Uploads the zip file to Manta using Manta-sync
 * @param extractedFolder - Zip extracted folder
 * @param tag - Folder tag
 * @returns Boolean response whether the sync was successful or not
 */
/** */
export const uploadZipManta = (extractedFolder: string, tag: string) => {
  /**
   * All env variables needed for Manta access.
   */
  const {
    TMP_FOLDER,
    MANTA_KEY_ID,
    MANTA_ROOT_FOLDER,
    MANTA_USER,
    MANTA_SUB_USER,
    MANTA_ROLES,
    MANTA_HOST_NAME,
  } = process.env;

  const upload = execSync(
    // eslint-disable-next-line max-len
    `manta-sync ${TMP_FOLDER}/${extractedFolder}/app-files/tiles /${MANTA_ROOT_FOLDER}/${tag} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`,
    { encoding: "utf-8", maxBuffer: 200 * 1024 * 1024 },
  );
  if (!upload) return false;

  return true;
};

/**
 * Used for uploading documentation files to Manta
 *
 * @param extractedFolder - Zip extracted folder
 * @param siteTag - Folder tag
 * @param env - Environment variables
 * @returns {Boolean} - Whether the sync was successful or not
 */
export const uploadFilesToManta = (
  extractedFolder: string,
  siteTag: string,
  env: NodeJS.ProcessEnv,
) => {
  const {
    TMP_FOLDER,
    MANTA_ROOT_FOLDER,
    MANTA_USER,
    MANTA_SUB_USER,
    MANTA_ROLES,
    MANTA_KEY_ID,
    MANTA_HOST_NAME,
  } = env;

  return execSync(
    `manta-sync ${TMP_FOLDER}/${extractedFolder} /${MANTA_ROOT_FOLDER}/${siteTag}/Documents/ --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`,
    { encoding: "utf-8", maxBuffer: 200 * 1024 * 1024 },
  );
};
