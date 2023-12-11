import { Rule } from 'json-rules-engine';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BulkActionStatus {
  pending = 'pending',
  workInProgress = 'work-in-progress',
  failed = 'failed',
  completed = 'completed',
}

export enum BulkActionEntity {
  contact = 'contact',
  company = 'company',
  lead = 'lead',
  opportunity = 'opportunity',
  task = 'task',
}

@Entity()
@Index(['accountId', 'actionType', 'status'])
export class BulkAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountId: number;

  @Column()
  entity: BulkActionEntity; // e.g., 'contact', 'lead'

  @Column()
  actionType: string; // e.g., 'update'

  @Column('jsonb')
  rules: Rule; // Rules for selecting records

  @Column('jsonb')
  updateData: Record<string, any>; // Data to update in the selected records

  @Column({ default: BulkActionStatus.pending })
  status: BulkActionStatus;

  @Column({ default: 0 })
  totalRecords: number; // Total number of records to process

  @Column({ default: 0 })
  processedRecords: number; // Number of records processed

  @Column({ default: 0 })
  successCount: number; // Number of successfully processed records

  @Column({ default: 0 })
  failureCount: number; // Number of records failed to process

  @Column({ default: 0 })
  skippedCount: number; // Number of records skipped

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
