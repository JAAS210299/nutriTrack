import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private usersRepository;
    private profileRepository;
    constructor(usersRepository: Repository<User>, profileRepository: Repository<UserProfile>);
    getProfile(userId: number): Promise<UserProfile>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserProfile>;
}
