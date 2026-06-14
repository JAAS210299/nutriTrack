import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyLog } from './entities/daily-log.entity';
import { LogEntry } from './entities/log-entry.entity';
import { Food } from '../foods/entities/food.entity';
import { User } from '../users/entities/user.entity';
import { AddEntryDto } from './dto/add-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(DailyLog)
    private dailyLogRepository: Repository<DailyLog>,
    @InjectRepository(LogEntry)
    private logEntryRepository: Repository<LogEntry>,
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async getOrCreateLog(userId: number, date: string): Promise<DailyLog> {
    let log = await this.dailyLogRepository.findOne({
      where: { user: { id: userId }, logDate: date },
      relations: ['entries', 'entries.food'],
    });

    if (!log) {
      log = this.dailyLogRepository.create({
        user: { id: userId } as User,
        logDate: date,
        totalCalories: 0,
        totalProteinG: 0,
        totalCarbsG: 0,
        totalFatG: 0,
      });
      log = await this.dailyLogRepository.save(log);
      log.entries = [];
    }

    return log;
  }

  private async recalculateTotals(logId: number): Promise<void> {
    const entries = await this.logEntryRepository.find({
      where: { dailyLog: { id: logId } },
    });

    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.proteinG,
        carbs: acc.carbs + e.carbsG,
        fat: acc.fat + e.fatG,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    await this.dailyLogRepository.update(logId, {
      totalCalories: Math.round(totals.calories * 10) / 10,
      totalProteinG: Math.round(totals.protein * 10) / 10,
      totalCarbsG: Math.round(totals.carbs * 10) / 10,
      totalFatG: Math.round(totals.fat * 10) / 10,
    });
  }

  async getTodays(userId: number): Promise<DailyLog> {
    return this.getOrCreateLog(userId, this.getToday());
  }

  async getByDate(userId: number, date: string): Promise<DailyLog> {
    return this.getOrCreateLog(userId, date);
  }

  async addEntry(userId: number, dto: AddEntryDto): Promise<DailyLog> {
    const food = await this.foodRepository.findOne({ where: { id: dto.foodId } });
    if (!food) throw new NotFoundException('Alimento no encontrado');

    const log = await this.getOrCreateLog(userId, this.getToday());

    const ratio = dto.quantityG / 100;
    const entry = this.logEntryRepository.create({
      dailyLog: { id: log.id } as DailyLog,
      food,
      mealType: dto.mealType,
      quantityG: dto.quantityG,
      calories: Math.round(food.caloriesPer100g * ratio * 10) / 10,
      proteinG: Math.round(food.proteinG * ratio * 10) / 10,
      carbsG: Math.round(food.carbsG * ratio * 10) / 10,
      fatG: Math.round(food.fatG * ratio * 10) / 10,
    });

    await this.logEntryRepository.save(entry);
    await this.recalculateTotals(log.id);

    return this.getOrCreateLog(userId, this.getToday());
  }

  async updateEntry(userId: number, entryId: number, dto: UpdateEntryDto): Promise<DailyLog> {
    const entry = await this.logEntryRepository.findOne({
      where: { id: entryId },
      relations: ['food', 'dailyLog'],
    });
    if (!entry) throw new NotFoundException('Entrada no encontrada');

    if (dto.quantityG) {
      const ratio = dto.quantityG / 100;
      entry.quantityG = dto.quantityG;
      entry.calories = Math.round(entry.food.caloriesPer100g * ratio * 10) / 10;
      entry.proteinG = Math.round(entry.food.proteinG * ratio * 10) / 10;
      entry.carbsG = Math.round(entry.food.carbsG * ratio * 10) / 10;
      entry.fatG = Math.round(entry.food.fatG * ratio * 10) / 10;
    }
    if (dto.mealType) entry.mealType = dto.mealType;

    await this.logEntryRepository.save(entry);
    await this.recalculateTotals(entry.dailyLog.id);

    return this.getOrCreateLog(userId, this.getToday());
  }

  async removeEntry(userId: number, entryId: number): Promise<DailyLog> {
    const entry = await this.logEntryRepository.findOne({
      where: { id: entryId },
      relations: ['dailyLog'],
    });
    if (!entry) throw new NotFoundException('Entrada no encontrada');

    const logId = entry.dailyLog.id;
    const logDate = entry.dailyLog.logDate;

    await this.logEntryRepository.remove(entry);
    await this.recalculateTotals(logId);

    return this.getOrCreateLog(userId, logDate);
  }

  async getWeekHistory(userId: number): Promise<DailyLog[]> {
    const logs = await this.dailyLogRepository
      .createQueryBuilder('log')
      .where('log.user_id = :userId', { userId })
      .orderBy('log.log_date', 'DESC')
      .take(7)
      .getMany();
    return logs;
  }
}
