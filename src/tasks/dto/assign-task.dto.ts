import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ description: 'User ID to assign the task to' })
  @IsMongoId()
  @IsNotEmpty()
  assigneeId: string;
}
