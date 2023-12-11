import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index('logTextIndex', ['logText'], { fulltext: true })
@Index('idx_bulkActionId', ['bulkActionId'])
export class BulkActionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bulkActionId: number;

  @Column('text')
  logText: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
