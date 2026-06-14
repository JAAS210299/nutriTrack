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
exports.UserProfile = exports.Objective = exports.ActivityLevel = exports.Sex = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var Sex;
(function (Sex) {
    Sex["MALE"] = "male";
    Sex["FEMALE"] = "female";
})(Sex || (exports.Sex = Sex = {}));
var ActivityLevel;
(function (ActivityLevel) {
    ActivityLevel["SEDENTARY"] = "sedentary";
    ActivityLevel["LIGHT"] = "light";
    ActivityLevel["MODERATE"] = "moderate";
    ActivityLevel["ACTIVE"] = "active";
    ActivityLevel["VERY_ACTIVE"] = "very_active";
})(ActivityLevel || (exports.ActivityLevel = ActivityLevel = {}));
var Objective;
(function (Objective) {
    Objective["DEFICIT"] = "deficit";
    Objective["MAINTENANCE"] = "maintenance";
    Objective["SURPLUS"] = "surplus";
})(Objective || (exports.Objective = Objective = {}));
let UserProfile = class UserProfile {
    id;
    user;
    weightKg;
    heightCm;
    age;
    sex;
    activityLevel;
    objective;
    bmr;
    tdee;
    targetCalories;
    targetProteinG;
    updatedAt;
};
exports.UserProfile = UserProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.profile),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], UserProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "weightKg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "heightCm", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Sex, nullable: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ActivityLevel, default: ActivityLevel.SEDENTARY }),
    __metadata("design:type", String)
], UserProfile.prototype, "activityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Objective, default: Objective.MAINTENANCE }),
    __metadata("design:type", String)
], UserProfile.prototype, "objective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "bmr", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "tdee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "targetCalories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], UserProfile.prototype, "targetProteinG", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserProfile.prototype, "updatedAt", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, typeorm_1.Entity)('user_profiles')
], UserProfile);
//# sourceMappingURL=user-profile.entity.js.map