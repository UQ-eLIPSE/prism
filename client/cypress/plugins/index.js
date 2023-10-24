import cypressTypeScriptPreprocessor from "./cy-ts-preprocessor";
import { readFileSync } from "fs";

function getEnvs() {
  const file = readFileSync(".env").toString().split("\n");
  const envs = {};

  file.forEach((line) => {
    line = line.trim();
    if (line.length == 0 || line.charAt(0) == "#") {
      return;
    }
    envs[line.split("=")[0]] = line.split("=")[1];
  });
  return envs;
}

export default (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);

  config.env = getEnvs();
  return config;
};
