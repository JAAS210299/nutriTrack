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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST ?? 'mailhog',
        port: parseInt(process.env.MAIL_PORT ?? '1025'),
        auth: process.env.MAIL_USER
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
            : undefined,
    });
    async sendVerification(email, token) {
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
    async sendPasswordReset(email, token) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)()
], MailService);
//# sourceMappingURL=mail.service.js.map