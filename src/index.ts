import { prometheus } from '@hono/prometheus';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import connectDB from './db/connect';
import { errorHandler, notFound } from './middlewares';
import { routes } from './routes';
import { parsedEnv } from '../env';
import { createAdminService } from './services/admin';

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'None',
  secure: true,
} as const;
const app = new Hono();
// app.basePath('/api/v1');
parsedEnv();
await connectDB();

const { printMetrics, registerMetrics } = prometheus();
const origins = process.env.ORIGINS ? process.env.ORIGINS.split(',') : [];
app.use(poweredBy());
app.use(logger());
app.use('*', registerMetrics);
app.get('/metrics', printMetrics);
app.use(secureHeaders());
app.use(prettyJSON());
app.use(
  cors({
    origin: origins,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(csrf());
app.use('/assets/*', serveStatic({ path: './assets' }));

app.route('/', routes);
app.onError((err, c) => {
  const error = errorHandler(c);
  return error;
});

app.notFound((c) => {
  const error = notFound(c);
  return error;
});

export default {
  port: +(Bun.env.PORT || 4500),
  fetch: app.fetch,
};

export type { AppType } from './routes';
