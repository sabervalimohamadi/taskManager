import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ description: 'Current version for optimistic concurrency check', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsDefined()
  version: number;
}
