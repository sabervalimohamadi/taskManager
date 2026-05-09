import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    create(dto: RegisterDto): Promise<UserDocument>;
}
