import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true, maxlength: 255 })
  filename: string;

  @Prop({ required: true, maxlength: 100 })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
