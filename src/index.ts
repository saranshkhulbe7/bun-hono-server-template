process.on('uncaughtException', (err) => {
  dispatchError(err, { subsystem: 'UNCAUGHT_EXCEPTION' });
});
process.on('unhandledRejection', (reason) => {
  dispatchError(reason, { subsystem: 'UNHANDLED_REJECTION' });
});

import { parsedEnv } from '../env';
import { createApp } from './app';
import connectDB from './db/connect';
import { dispatchError } from './utils/errors/errorDispatcher';

try {
  parsedEnv();
  await connectDB();
} catch (bootErr) {
  dispatchError(bootErr, { subsystem: 'BOOT' });
  console.error('[BOOT] unrecoverable error – shutting down:', bootErr);
  process.exit(1);
}

const app = createApp();

export default {
  port: +(process.env.PORT || 4500),
  fetch: app.fetch,
};

export type { AppType } from './routes';
