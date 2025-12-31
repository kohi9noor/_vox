import chalk from "chalk";

const log = console.log;

export const logger = {
  info: (message: string) => {
    log(chalk.blue(`[INFO]`), `${message}`);
  },
  warn: (message: string) => {
    log(chalk.yellow(`[WARN]`), `${message}`);
  },
  error: (message: string) => {
    log(chalk.red(`[ERROR]`), `${message}`);
  },
  debug: (message: string) => {
    log(chalk.green(`[DEBUG] `), `${message}`);
  },
};
