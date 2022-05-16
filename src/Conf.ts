import * as dotenv from 'dotenv';
import { ConsoleUtil } from './utils/ConsoleUtil';

// Note that all values of the configuration should be strings
export interface Configuration {
  ENVIRONMENT: string;
  PROJECT_NAME: string;
  DATABASE_URL: string;
  PORT_NUM: number;
  USE_SENTRY: boolean;
  USE_SSO: boolean;
  SENTRY_DSN: string;
  AUTH_HOST: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_SECRET: string;
  JWT_Hash: string;
  MANTA_HOST_NAME: string;
  MANTA_KEY_ID: string;
  MANTA_KEY_FILE: string;
  MANTA_SUB_USER: string;
  MANTA_ROLES: string[];
  MANTA_USER: string;
  MANTA_ROOT_FOLDER: string;
  TMP_FOLDER: string;
}

export const TEMPLATE: Configuration = {
  ENVIRONMENT: '',
  PROJECT_NAME: '',
  DATABASE_URL: 'Initial_Value',
  PORT_NUM: 8000,
  USE_SENTRY: true,
  USE_SSO: false,
  SENTRY_DSN: '',
  AUTH_HOST: '',
  MAIL_HOST: '',
  MAIL_PORT: 25,
  MAIL_SECRET: '',
  JWT_Hash: '',
  MANTA_HOST_NAME: '',
  MANTA_KEY_ID: '',
  MANTA_KEY_FILE: '',
  MANTA_SUB_USER: '',
  MANTA_ROLES: [],
  MANTA_USER: '',
  MANTA_ROOT_FOLDER: '',
  TMP_FOLDER: '',
};

/**
 * Based on the .env file located in root, load it into a Configuration.
 * @error if dot-env cannot parse it
 * @error if the env file is empty
 * @error if a key is missing in the env file
 */
export function loadConfiguration(): Configuration {
  const dotEnvLoad = dotenv.config();

  if (dotEnvLoad.error) {
    throw Error(
      'Dot env failed to load the environment file. Check the environment file',
    );
  }

  if (
    !dotEnvLoad ||
    !dotEnvLoad.parsed ||
    Object.keys(dotEnvLoad.parsed).length === 0
  ) {
    throw Error('Empty environment file. Check the environment file.');
  }

  // Otherwise, load each part of the configuration and see if they can be assigned and not empty strings
  const output = Object.assign({}, TEMPLATE);

  Object.keys(TEMPLATE).forEach((key) => {
    if (!dotEnvLoad.parsed || !dotEnvLoad.parsed[key]) {
      throw Error(`Empty value for key ${key}. Check the environment file`);
    }

    // If we have things that should be numbers, then parse it appropiately
    switch (key) {
    case 'ENVIRONMENT':
      output.ENVIRONMENT = dotEnvLoad.parsed[key];
      break;

    case 'PROJECT_NAME':
      output.PROJECT_NAME = dotEnvLoad.parsed[key];
      break;

    case 'DATABASE_URL':
      output.DATABASE_URL = dotEnvLoad.parsed[key];
      break;

    case 'PORT_NUM':
      output.PORT_NUM = parseInt(dotEnvLoad.parsed[key]);
      break;
    case 'USE_SENTRY':
      output.USE_SENTRY = JSON.parse(dotEnvLoad.parsed[key]) as boolean;
      break;
    case 'SENTRY_DSN':
      output.SENTRY_DSN = dotEnvLoad.parsed[key];
      break;

    case 'USE_SSO':
      output.USE_SSO = JSON.parse(dotEnvLoad.parsed[key]) as boolean;
      break;

    case 'AUTH_HOST':
      output.AUTH_HOST = dotEnvLoad.parsed[key];
      break;

    case 'MAIL_HOST':
      output.MAIL_HOST = dotEnvLoad.parsed[key];
      break;

    case 'MAIL_PORT':
      output.MAIL_PORT = parseInt(dotEnvLoad.parsed[key]);
      break;

    case 'MAIL_SECRET':
      output.MAIL_SECRET = dotEnvLoad.parsed[key];
      break;

    case 'JWT_Hash':
      output.JWT_Hash = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_HOST_NAME':
      output.MANTA_HOST_NAME = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_KEY_ID':
      output.MANTA_KEY_ID = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_KEY_FILE':
      output.MANTA_KEY_FILE = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_SUB_USER':
      output.MANTA_SUB_USER = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_ROLES':
      output.MANTA_ROLES = [dotEnvLoad.parsed[key]] as unknown as string[];
      break;

    case 'MANTA_USER':
      output.MANTA_USER = dotEnvLoad.parsed[key];
      break;

    case 'MANTA_ROOT_FOLDER':
      output.MANTA_ROOT_FOLDER = dotEnvLoad.parsed[key];
      break;

    case 'TMP_FOLDER':
      output.TMP_FOLDER = dotEnvLoad.parsed[key];
      break;

    default:
      ConsoleUtil.error(`Unhandled key ${key}. Check configuration`);
      break;
    }
  });

  return output;
}
