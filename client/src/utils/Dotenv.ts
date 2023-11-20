export interface IConfiguration {
  BASE_URL: string;
}

/**
 * Maps `Configuration` interface types to `_expectedConfig`.
 * Makes sure that static types provided by Typescript and runtime
 * types defined in `_expectedConfig` are consistent with each other.
 */
type MappedConfigType<I, K extends keyof I> = {
  type: I[K] extends number
    ? "number"
    : I[K] extends string
      ? "string"
      : I[K] extends Date
        ? "Date"
        : I[K] extends boolean
          ? "boolean"
          : never;
};

/**
 * Contains the .env variables are expected in the .env file and their respective types
 * Used for runtime configuration type checking
 * E.g. If PORT is set as `abc`, this will help identify that error
 */
const _expectedConfig: {
  [key in keyof IConfiguration]: MappedConfigType<IConfiguration, key>;
} = {
  BASE_URL: { type: "string" },
};

/**
 *
 * @param key name of the config variable
 * @param actualValue value parsed from the .env file / custom
 */
function testIfConfigTypeMatches(
  key: keyof IConfiguration,
  actualValue: string | undefined,
): boolean {
  if (
    !_expectedConfig ||
    !_expectedConfig[key] ||
    !_expectedConfig[key].type ||
    !key ||
    !actualValue
  )
    return false;

  switch (_expectedConfig[key].type) {
    case "string":
      return typeof actualValue === _expectedConfig[key].type;
    default:
      return false;
  }
}

/**
 * Returns true if config is valid
 * @param parsedConfig Configuration object parsed by dotenv
 * @throws If config is invalid
 */
const isConfigValid = (): boolean => {
  return (Object.keys(_expectedConfig) as Array<keyof IConfiguration>).every(
    (config) => {
      if (
        !testIfConfigTypeMatches(config, process.env["REACT_APP_" + config])
      ) {
        console.log(process.env["REACT_APP_" + config]);
        console.error(
          `Config error: ${config} does not match expected type ${_expectedConfig[config].type}`,
        );
        return false;
      }

      return true;
    },
  );
};

const generateConfigObject = (): IConfiguration => {
  return Object.keys(_expectedConfig).reduce((compiledConfig, configKey) => {
    const _expectedConfigObject =
      _expectedConfig[configKey as keyof IConfiguration];
    if (!_expectedConfigObject || !_expectedConfigObject.type)
      return compiledConfig;

    const value = process.env["REACT_APP_" + configKey];
    if (!value)
      throw new Error(`${configKey} variable does not exist in environment`);

    switch (_expectedConfigObject.type) {
      case "string":
        return Object.assign(compiledConfig, { [configKey]: value });
      default:
        return compiledConfig;
    }
  }, {} as IConfiguration);
};

/**
 * Return the configuration object as loaded from the `.env` file
 * @throws Will throw an error if .env file could not be loaded / contains errors / missing values
 */
export const loadConfiguration = (): IConfiguration => {
  if (!isConfigValid()) throw new Error("Configuration error => .env file");
  return generateConfigObject();
};

const config = loadConfiguration();

export default config;
