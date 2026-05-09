import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export class NotificationPreferences {
  deadlineReminders!: boolean;
  taskAssigned!: boolean;
  taskUpdated!: boolean;
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({
    type: {
      deadlineReminders: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskUpdated: { type: Boolean, default: true },
    },
    default: () => ({ deadlineReminders: true, taskAssigned: true, taskUpdated: true }),
  })
  notificationPreferences!: NotificationPreferences;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
