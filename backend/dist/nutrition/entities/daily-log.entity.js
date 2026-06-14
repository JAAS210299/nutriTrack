"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const log_entry_entity_1 = require("./log-entry.entity");
let DailyLog = class DailyLog {
    id;
    user;
    logDate;
    totalCalories;
    totalProteinG;
    totalCarbsG;
    totalFatG;
    entries;
    createdAt;
};
exports.DailyLog = DailyLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DailyLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.dailyLogs),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], DailyLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], DailyLog.prototype, "logDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], DailyLog.prototype, "totalCalories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], DailyLog.prototype, "totalProteinG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], DailyLog.prototype, "totalCarbsG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], DailyLog.prototype, "totalFatG", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => log_entry_entity_1.LogEntry, entry => entry.dailyLog, { cascade: true }),
    __metadata("design:type", Array)
], DailyLog.prototype, "entries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DailyLog.prototype, "createdAt", void 0);
exports.DailyLog = DailyLog = __decorate([
    (0, typeorm_1.Entity)('daily_logs')
], DailyLog);
//# sourceMappingURL=daily-log.entity.js.map