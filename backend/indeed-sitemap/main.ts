import { getConfig, setupLogging } from './config';
import * as winston from 'winston';
import { handler } from './handler';

export const main = async (): Promise<void> => {
    const config = getConfig();
    setupLogging(config.logLevel);
    winston.info(`Handling indeed sitemap`);
    await handler(config);
    winston.info('Done');
};
