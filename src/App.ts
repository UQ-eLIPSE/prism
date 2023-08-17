// Library imports
import * as express from 'express';
import * as Sentry from '@sentry/node';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import { ServeStaticOptions } from 'serve-static';

// Project imports
import { Routes } from './routes';
import { Configuration } from './Conf';
import { ConsoleUtil } from './utils/ConsoleUtil';
import { MantaService } from './service/MantaService';

export class App {
  private express: express.Application;
  private configuration: Configuration;
  private router: express.Router;
  readonly databaseUrl: string;

  private clientPath = `${__dirname}/../../client`;
  private expressStaticOptions: ServeStaticOptions = {};

  public routes: Routes = new Routes();

  // For the application to spawn, we simply create the DB, express and the env file
  constructor(databaseUrl: string, config: Configuration) {
    this.databaseUrl = databaseUrl;
    this.configuration = config;
    this.express = express();
    this.router = express.Router();
  }

  private async setUpDatabase() {
    await mongoose.connect(this.databaseUrl);
    ConsoleUtil.log('Done setting up database functions');
  }

  private async setUpManta() {
    try {
      const manta = new MantaService();
      await manta.setupManta();
      ConsoleUtil.log('Done initializing Manta ...');
    } catch (e) {
      ConsoleUtil.error(e);
    }
  }

  private setUpExpress(): void {
    this.express.listen(this.configuration.PORT_NUM);
    this.express.use(
      express.static(this.clientPath, this.expressStaticOptions),
    );
    this.express.use(cookieParser());
    this.express.use(
      cors({
        origin: [
          this.configuration.CLIENT_ORIGIN,
          'http://localhost',
          /\.uqcloud\.net$/,
        ],
        credentials: true,
      }),
    );

    this.express.use(bodyParser.json({ limit: '50mb' }));
    this.routes.routes(this.express, this.router);
    ConsoleUtil.log('Done setting up express routes...');
  }

  private setupSentry(): void {
    if (this.configuration.USE_SENTRY || this.configuration.USE_SSO) {
      ConsoleUtil.log('Setting up Sentry...');
      ConsoleUtil.log('Using SSO...');
      Sentry.init({ dsn: this.configuration.SENTRY_DSN });
    } else {
      ConsoleUtil.log('Not using Sentry...');
      ConsoleUtil.log('Not using SSO...');
    }
  }

  public async run() {
    try {
      await this.setUpDatabase();
      //   await this.setupMailer();
      //   await this.setUpManta();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Database connection error: ', e);
    }

    this.setUpExpress();
    this.setupSentry();
  }
}
