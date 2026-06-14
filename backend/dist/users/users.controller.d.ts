import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<import("./entities/user-profile.entity").UserProfile>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<import("./entities/user-profile.entity").UserProfile>;
}
