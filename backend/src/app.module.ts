import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { FoodsModule } from './foods/foods.module';
import { NutritionModule } from './nutrition/nutrition.module';
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
    UsersModule,
    FoodsModule,
    NutritionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
