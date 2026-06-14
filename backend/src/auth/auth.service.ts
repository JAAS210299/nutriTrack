import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('El email ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
      verificationToken: token,
    });
    await this.userRepository.save(user);
    await this.mailService.sendVerification(dto.email, token);

    return { message: 'Registro exitoso. Revisa tu email para verificar la cuenta.' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Token inválido o expirado');

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Cuenta verificada correctamente' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    if (!user.isVerified) throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('No existe una cuenta con ese email');

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await this.userRepository.save(user);
    await this.mailService.sendPasswordReset(email, token);

    return { message: 'Email de recuperación enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password, verificationToken, resetToken, ...result } = user;
    return result;
  }
}