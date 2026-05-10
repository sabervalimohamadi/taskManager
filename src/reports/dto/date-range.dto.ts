import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({ example: '2026-01-01', description: 'Start date (ISO 8601)' })
  @IsDateString()
  from: string;

  @ApiProperty({ example: '2026-12-31', description: 'End date (ISO 8601)' })
  @IsDateString()
  to: string;
}
