import mongoose from 'mongoose';
import { dispatchError } from '../utils/errors/errorDispatcher';

export const dbState = { ready: false }; // shared flag

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');

  await mongoose.connect(uri, { autoIndex: false }); // may throw – caught in index.ts
  // after `await mongoose.connect(...)`
  const admin = mongoose?.connection?.db?.admin();
  if (!admin) throw new Error('MongoDB admin not found');
  const info = await admin.buildInfo();
  console.log('MongoDB version:', info.version);
  // e.g. “4.2.8”

  const status = await admin.serverStatus();
  console.log('Is replica set:', !!status.repl && !!status.repl.setName, '— setName:', status.repl?.setName);
  dbState.ready = true;
  console.log('[DB] connected :', uri);

  const conn = mongoose.connection;

  // 🔔 runtime listeners
  conn.on('disconnected', () => {
    dbState.ready = false;
    dispatchError(new Error('Mongo disconnected'), { subsystem: 'MONGOOSE' });
  });
  conn.on('reconnected', () => {
    dbState.ready = true;
    console.log('[DB] reconnected – serving traffic');
  });
  conn.on('error', (err) => {
    // covers index build errors & network blips
    dispatchError(err, { subsystem: 'MONGOOSE' });
  });
}
