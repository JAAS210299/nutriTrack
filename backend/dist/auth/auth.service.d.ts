import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private mailService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
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
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    getMe(userId: number): Promise<{
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
