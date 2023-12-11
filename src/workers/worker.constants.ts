export const WORKER_BATCH_SIZE = +(process.env.WORKER_BATCH_SIZE || 1000);
export const WORKER_BATCH_UPDATE_SIZE = +(
  process.env.WORKER_BATCH_UPDATE_SIZE || 100
);
