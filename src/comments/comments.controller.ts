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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  addComment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(taskId, user.userId, dto.content);
  }

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found or access denied' })
  getComments(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commentsService.getComments(taskId, user.userId);
  }

  @Delete('tasks/:taskId/comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment (author only)' })
  @ApiParam({ name: 'taskId', description: 'Task ObjectId' })
  @ApiParam({ name: 'commentId', description: 'Comment ObjectId' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the comment author' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commentsService.deleteComment(commentId, user.userId);
  }
}
