import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(dto: RegisterDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    return user.save();
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserDocument | null> {
    const update: Record<string, boolean> = {};
    if (dto.deadlineReminders !== undefined) {
      update['notificationPreferences.deadlineReminders'] =
        dto.deadlineReminders;
    }
    if (dto.taskAssigned !== undefined) {
      update['notificationPreferences.taskAssigned'] = dto.taskAssigned;
    }
    if (dto.taskUpdated !== undefined) {
      update['notificationPreferences.taskUpdated'] = dto.taskUpdated;
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();

    await this.cacheManager.del(`prefs:${userId}`);

    return updated;
  }
}
