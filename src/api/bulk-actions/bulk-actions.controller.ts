import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BulkAction } from '../../core/database/entities/bulk-action.entity';
import { CreateBulkActionDto } from './bulk-actions.dto';
import { BulkActionsService } from './bulk-actions.service';

@ApiTags('bulk-actions')
@Controller('bulk-actions')
export class BulkActionsController {
  constructor(private readonly bulkActionsService: BulkActionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bulk actions' })
  @ApiResponse({ status: 200, description: 'List of bulk actions' })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 25 })
  async getAllBulkActions(
    @Query('page')
    page: number,
    @Query('limit') limit: number,
  ) {
    return this.bulkActionsService.getAllBulkActions(page, limit);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bulk action' })
  @ApiResponse({
    status: 201,
    description: 'The bulk action has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createBulkActionDto: CreateBulkActionDto,
  ): Promise<BulkAction> {
    return this.bulkActionsService.createBulkAction(createBulkActionDto);
  }

  @Get(':actionId')
  @ApiOperation({ summary: 'Get bulk action status' })
  @ApiParam({ name: 'actionId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Bulk action status' })
  async getBulkActionStatus(@Param('actionId') actionId: number) {
    return this.bulkActionsService.getBulkActionStatus(actionId);
  }

  @Get(':actionId/stats')
  @ApiOperation({ summary: 'Get bulk action statistics' })
  @ApiParam({ name: 'actionId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Bulk action statistics' })
  async getBulkActionStats(@Param('actionId') actionId: number) {
    return this.bulkActionsService.getBulkActionStats(actionId);
  }

  @Get(':actionId/logs')
  @ApiOperation({ summary: 'Get logs related to a bulk action' })
  @ApiQuery({ name: 'page', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, example: 25 })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiParam({ name: 'actionId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Logs related to the bulk action' })
  async getBulkActionLogs(
    @Param('actionId') actionId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return this.bulkActionsService.getBulkActionLogs(
      actionId,
      page,
      limit,
      search,
    );
  }
}
