import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
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

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      profile = this.profileRepository.create({
        user: { id: userId },
        ...updateProfileDto,
      });
    } else {
      Object.assign(profile, updateProfileDto);
    }

    return this.profileRepository.save(profile);
  }
}
