import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private usersRepository;
    private profileRepository;
    constructor(usersRepository: Repository<User>, profileRepository: Repository<UserProfile>);
    getProfile(userId: number): Promise<UserProfile>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserProfile>;
    findAllUsers(): Promise<User[]>;
    updateUserRole(userId: number, role: UserRole): Promise<{
        id: number;
        email: string;
        role: UserRole;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        verifiedUsers: number;
        adminUsers: number;
    }>;
}
