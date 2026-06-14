import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { DailyLog } from './entities/daily-log.entity';
import { LogEntry } from './entities/log-entry.entity';
import { Food } from '../foods/entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyLog, LogEntry, Food])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
