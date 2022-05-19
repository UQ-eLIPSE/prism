/* eslint-disable no-console */
const LOG_COLOUR = '\x1b[33m';
const SUCCESS_COLOUR = '\x1b[32m';
const ERROR_COLOUR = '\x1b[31m';
const DEFAULT_COLOUR = '\x1b[0m';

export class ConsoleUtil {
  static log(message: string) {
    console.log(LOG_COLOUR, message, DEFAULT_COLOUR);
  }

  static error(message: string) {
    console.log(ERROR_COLOUR, message, DEFAULT_COLOUR);
  }

  static success(message: string) {
    console.log(SUCCESS_COLOUR, message, DEFAULT_COLOUR);
  }
}
