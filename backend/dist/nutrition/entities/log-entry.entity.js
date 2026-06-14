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
exports.LogEntry = exports.MealType = void 0;
const typeorm_1 = require("typeorm");
const daily_log_entity_1 = require("./daily-log.entity");
const food_entity_1 = require("../../foods/entities/food.entity");
var MealType;
(function (MealType) {
    MealType["BREAKFAST"] = "breakfast";
    MealType["LUNCH"] = "lunch";
    MealType["DINNER"] = "dinner";
    MealType["SNACK"] = "snack";
})(MealType || (exports.MealType = MealType = {}));
let LogEntry = class LogEntry {
    id;
    dailyLog;
    food;
    mealType;
    quantityG;
    calories;
    proteinG;
    carbsG;
    fatG;
};
exports.LogEntry = LogEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LogEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => daily_log_entity_1.DailyLog, log => log.entries),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", daily_log_entity_1.DailyLog)
], LogEntry.prototype, "dailyLog", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => food_entity_1.Food, food => food.logEntries),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", food_entity_1.Food)
], LogEntry.prototype, "food", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MealType }),
    __metadata("design:type", String)
], LogEntry.prototype, "mealType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LogEntry.prototype, "quantityG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LogEntry.prototype, "calories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LogEntry.prototype, "proteinG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LogEntry.prototype, "carbsG", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], LogEntry.prototype, "fatG", void 0);
exports.LogEntry = LogEntry = __decorate([
    (0, typeorm_1.Entity)('log_entries')
], LogEntry);
//# sourceMappingURL=log-entry.entity.js.map