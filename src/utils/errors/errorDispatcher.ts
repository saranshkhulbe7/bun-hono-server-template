// src/utils/errorDispatcher.ts

/**
 * Central place to handle/log all errors.
 * All subsystems should call dispatchError().
 */
export function dispatchError(err: unknown, context: { subsystem?: string; meta?: Record<string, any> } = {}) {
  const e = err instanceof Error ? err : new Error(String(err));
  const tag = context.subsystem ? `[${context.subsystem}]` : '[ERROR]';
  const meta = context.meta ? `META=${JSON.stringify(context.meta)}` : '';
  console.error(`${tag}`, e, meta);
}
