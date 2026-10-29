import { setupWorker } from 'msw/browser';
import { handlers, startSettlement } from './handlers';
import { db, reset } from './db';
export async function startMocks() {
  if (!db.users.length) await reset();
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  startSettlement();
}
