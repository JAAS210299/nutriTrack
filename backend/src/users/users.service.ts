import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async getProfile(userId: number): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      profile = this.profileRepository.create({ user: { id: userId } });
      profile = await this.profileRepository.save(profile);
    }
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      profile = this.profileRepository.create({ user: { id: userId }, ...dto });
    } else {
      Object.assign(profile, dto);
    }
    return this.profileRepository.save(profile);
  }

  // ── Admin endpoints ────────────────────────────────────────────────────────
  async findAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'email', 'role', 'isVerified', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async updateUserRole(userId: number, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.role = role;
    await this.usersRepository.save(user);
    return { id: user.id, email: user.email, role: user.role };
  }

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const verifiedUsers = await this.usersRepository.count({ where: { isVerified: true } });
    const adminUsers = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    return { totalUsers, verifiedUsers, adminUsers };
  }
}
