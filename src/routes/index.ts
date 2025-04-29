import { Hono } from 'hono';

import { ApiResponse } from '@/utils/ApiResponse';
import { utilsRouter } from './utils/urls';

const app = new Hono();

export const routes = app
  .get('/health-check', (c) => {
    console.log('health check');
    return c.json(
      new ApiResponse(200, {
        status: 'api working, live and kicking!',
      })
    );
  })
  .route('/utils', utilsRouter);

export type AppType = typeof routes;
