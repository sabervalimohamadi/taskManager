import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ description: 'Current version for optimistic concurrency check' })
  @IsInt()
  @IsDefined()
  version: number;
}
