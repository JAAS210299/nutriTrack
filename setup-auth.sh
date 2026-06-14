#!/bin/bash
# NutriTrack — Módulo de Auth completo
set -e

mkdir -p backend/src/auth
mkdir -p backend/src/mail

# ── 1. DTOs ───────────────────────────────────────────────────────────────────
cat > backend/src/auth/dto/register.dto.ts << 'ENDOFFILE'
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
ENDOFFILE

cat > backend/src/auth/dto/login.dto.ts << 'ENDOFFILE'
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
ENDOFFILE

cat > backend/src/auth/dto/reset-password.dto.ts << 'ENDOFFILE'
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
ENDOFFILE

# ── 2. JWT Strategy ───────────────────────────────────────────────────────────
cat > backend/src/auth/jwt.strategy.ts << 'ENDOFFILE'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'supersecret',
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
ENDOFFILE

# ── 3. Roles decorator y guard ────────────────────────────────────────────────
cat > backend/src/auth/roles.decorator.ts << 'ENDOFFILE'
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
ENDOFFILE

cat > backend/src/auth/roles.guard.ts << 'ENDOFFILE'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
ENDOFFILE

cat > backend/src/auth/jwt-auth.guard.ts << 'ENDOFFILE'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
ENDOFFILE

# ── 4. Mail service ───────────────────────────────────────────────────────────
cat > backend/src/mail/mail.service.ts << 'ENDOFFILE'
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST ?? 'mailhog',
    port: parseInt(process.env.MAIL_PORT ?? '1025'),
    auth: process.env.MAIL_USER
      ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
      : undefined,
  });

  async sendVerification(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@nutritrack.local',
      to: email,
      subject: 'Verifica tu cuenta — NutriTrack',
      html: `
        <h2>Bienvenido a NutriTrack</h2>
        <p>Haz clic en el enlace para verificar tu cuenta:</p>
        <a href="${url}" style="background:#1A56B0;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Verificar cuenta
        </a>
        <p>El enlace caduca en 24 horas.</p>
      `,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@nutritrack.local',
      to: email,
      subject: 'Recuperar contraseña — NutriTrack',
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Haz clic en el enlace para restablecer tu contraseña:</p>
        <a href="${url}" style="background:#1A56B0;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Restablecer contraseña
        </a>
        <p>El enlace caduca en 1 hora.</p>
      `,
    });
  }
}
ENDOFFILE

cat > backend/src/mail/mail.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
ENDOFFILE

# ── 5. Auth Service ───────────────────────────────────────────────────────────
cat > backend/src/auth/auth.service.ts << 'ENDOFFILE'
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
    user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora
    await this.userRepository.save(user);
    await this.mailService.sendPasswordReset(email, token);

    return { message: 'Email de recuperación enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { resetToken: token } });
    if (!user || user.resetTokenExpires < new Date()) {
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
ENDOFFILE

# ── 6. Auth Controller ────────────────────────────────────────────────────────
cat > backend/src/auth/auth.controller.ts << 'ENDOFFILE'
import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }
}
ENDOFFILE

# ── 7. Auth Module ────────────────────────────────────────────────────────────
cat > backend/src/auth/auth.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { User } from '../users/entities/user.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'supersecret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
ENDOFFILE

# ── 8. Actualizar app.module.ts ───────────────────────────────────────────────
cat > backend/src/app.module.ts << 'ENDOFFILE'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/entities/user.entity';
import { UserProfile } from './users/entities/user-profile.entity';
import { Food } from './foods/entities/food.entity';
import { DailyLog } from './nutrition/entities/daily-log.entity';
import { LogEntry } from './nutrition/entities/log-entry.entity';
import { Goal } from './goals/entities/goal.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, UserProfile, Food, DailyLog, LogEntry, Goal],
      synchronize: true,
      charset: 'utf8mb4',
    }),
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
ENDOFFILE

# ── 9. Habilitar validación global en main.ts ─────────────────────────────────
cat > backend/src/main.ts << 'ENDOFFILE'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
ENDOFFILE

echo ""
echo "✅ Módulo Auth creado:"
find backend/src/auth -name "*.ts" | sort
find backend/src/mail -name "*.ts" | sort
echo ""
echo "✅ app.module.ts y main.ts actualizados"
echo ""
echo "Endpoints disponibles:"
echo "  POST /api/auth/register"
echo "  GET  /api/auth/verify?token=..."
echo "  POST /api/auth/login"
echo "  POST /api/auth/forgot-password"
echo "  POST /api/auth/reset-password"
echo "  GET  /api/auth/me  (requiere JWT)"
