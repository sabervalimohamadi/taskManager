import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ description: 'User ID to assign the task to' })
  @IsMongoId()
  @IsNotEmpty()
  assigneeId: string;

  @ApiProperty({ description: 'Current task version for optimistic concurrency check' })
  @IsInt()
  @Min(0)
  @IsDefined()
  expectedVersion: number;
}
