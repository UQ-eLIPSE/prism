// Project imports
import { loadConfiguration, Configuration, TEMPLATE } from './Conf';
import { ConsoleUtil } from './utils/ConsoleUtil';
import { App } from './App';

ConsoleUtil.log('Loading configuration...');

let configuration: Configuration = TEMPLATE;
try {
  // Check the the environment variable and its validity
  configuration = loadConfiguration();
  ConsoleUtil.log(`Configuration loaded`);
} catch (e) {
  ConsoleUtil.error(e);
  process.exit(1);
}

ConsoleUtil.log('Checking DB connection...');

const app = new App(configuration.DATABASE_URL, configuration);
app
  .run()
  .then(() => ConsoleUtil.log(`App listens to port ${configuration.PORT_NUM}`));
