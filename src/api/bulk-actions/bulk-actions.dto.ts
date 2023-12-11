import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BulkActionEntity } from '../../core/database/entities/bulk-action.entity';
import { example1 } from './bulk-actions.dto.sample';

class Condition {
  @ApiProperty({ description: 'Fact to be evaluated' })
  @IsString()
  fact: string;

  @ApiProperty({
    description: 'Operator to be used for evaluation',
    example: 'equal',
  })
  @IsString()
  operator: string;

  @ApiProperty({ description: 'Value to compare against' })
  value: any;
}

// https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md
class Rule {
  @ApiProperty({ description: 'Conditions for the rule', type: Condition })
  @ValidateNested()
  @Type(() => Condition)
  conditions: Condition;
}

export class CreateBulkActionDto {
  @ApiProperty({
    enum: BulkActionEntity,
    description: 'Entity to apply the bulk action',
    example: example1.entity,
  })
  @IsEnum(BulkActionEntity)
  entity: BulkActionEntity;

  @ApiProperty({
    type: Rule,
    description: 'Rules for selecting records',
    example: example1.rules,
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Rule)
  rules: Rule;

  @ApiProperty({
    description:
      'Object with keys as fields to update and values as new values for those fields',
    example: example1.updateData,
  })
  @IsObject()
  updateData: Record<string, any>;
}
