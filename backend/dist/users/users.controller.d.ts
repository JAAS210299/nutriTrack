import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from './entities/user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("./entities/user-profile.entity").UserProfile>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<import("./entities/user-profile.entity").UserProfile>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    updateRole(id: string, role: UserRole): Promise<{
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
