import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    verify(token: string): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
        id: number;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        isVerified: boolean;
        resetTokenExpires: Date | null;
        createdAt: Date;
        profile: import("../users/entities/user-profile.entity").UserProfile;
        dailyLogs: import("../nutrition/entities/daily-log.entity").DailyLog[];
        goals: import("../goals/entities/goal.entity").Goal[];
        foods: import("../foods/entities/food.entity").Food[];
    }>;
}
