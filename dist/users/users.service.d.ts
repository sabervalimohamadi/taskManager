import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    create(dto: RegisterDto): Promise<UserDocument>;
    updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserDocument | null>;
}
