export enum RABBITMQ_EXCHANGES {
  BulkUpdates = 'direct-bulk-updates',
  BulkUpdatesBatchWorker = 'direct-bulk-updates-batch-worker',
}

export enum RABBITMQ_QUEUES {
  BulkUpdates = 'bulk-updates',
  BulkUpdatesBatchWorker = 'bulk-updates-batch-worker',
}
