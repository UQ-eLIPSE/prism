import { exec, execSync } from 'child_process';
import { ConsoleUtil } from './ConsoleUtil';

/**
 * uploadZipManta
 * Uploads the zip file to Manta using Manta-sync
 * @param extractedFolder - Zip extracted folder
 * @param tag - Folder tag
 * @returns Boolean response whether the sync was successful or not
 */
/** */
export const uploadZipManta = async (extractedFolder: string, tag: string) => {
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
    `manta-sync ${TMP_FOLDER}/${extractedFolder}/app-files/tiles /${MANTA_ROOT_FOLDER}/${tag} --account=${MANTA_USER} --user=${MANTA_SUB_USER} --role=${MANTA_ROLES} --keyId=${MANTA_KEY_ID} --url=${MANTA_HOST_NAME}`,
    // Allow maximum amount of buffer as Manta sync will contain lines of upload
    { encoding: 'utf-8' },
  );
  console.log(upload);
  if (!upload) return false;

  return true;
};
