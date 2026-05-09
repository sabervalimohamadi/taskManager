import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty({ example: 102400, description: 'File size in bytes' })
  @IsNumber()
  @Min(1)
  size: number;
}
