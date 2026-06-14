"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const user_entity_1 = require("../users/entities/user.entity");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    mailService;
    constructor(userRepository, jwtService, mailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async register(dto) {
        const exists = await this.userRepository.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('El email ya está registrado');
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
    async verifyEmail(token) {
        const user = await this.userRepository.findOne({ where: { verificationToken: token } });
        if (!user)
            throw new common_1.BadRequestException('Token inválido o expirado');
        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepository.save(user);
        return { message: 'Cuenta verificada correctamente' };
    }
    async login(dto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        if (!user.isVerified)
            throw new common_1.UnauthorizedException('Debes verificar tu email antes de iniciar sesión');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: { id: user.id, email: user.email, role: user.role },
        };
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('No existe una cuenta con ese email');
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpires = new Date(Date.now() + 3600000);
        await this.userRepository.save(user);
        await this.mailService.sendPasswordReset(email, token);
        return { message: 'Email de recuperación enviado' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({ where: { resetToken: token } });
        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpires = null;
        await this.userRepository.save(user);
        return { message: 'Contraseña actualizada correctamente' };
    }
    async getMe(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const { password, verificationToken, resetToken, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map