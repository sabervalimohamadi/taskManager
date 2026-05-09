import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('tasks/:taskId/attachments')
  @ApiOperation({ summary: 'Add an attachment record to a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({ status: 201, description: 'Attachment metadata saved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  addAttachment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.addAttachment(taskId, user.userId, dto);
  }

  @Get('tasks/:taskId/attachments')
  @ApiOperation({ summary: 'List attachments for a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({ status: 200, description: 'List of attachment records' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAttachments(@Param('taskId') taskId: string) {
    return this.attachmentsService.getAttachments(taskId);
  }

  @Delete('tasks/:taskId/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete an attachment record (uploader only)' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment ObjectId' })
  @ApiResponse({ status: 200, description: 'Attachment deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the uploader' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  deleteAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.attachmentsService.deleteAttachment(attachmentId, user.userId);
  }
}
