import mongoose, { type ClientSession } from 'mongoose';

type TransactionCallback<T = void> = (session: ClientSession) => Promise<T>;

export const runInTransaction = async <T>(cb: TransactionCallback<T>): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await cb(session); // ← all reads/writes in txn ctx
    });
    return result!; // only reachable on COMMIT
  } catch (err) {
    // Mongo automatically ABORTS if any throw occurs inside withTransaction
    console.error('Transaction aborted:', err);
    throw err; // ← “bubble up”
  } finally {
    await session.endSession();
  }
};
