import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { AddEntryDto } from './dto/add-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private nutritionService: NutritionService) {}

  @Get('today')
  getToday(@Request() req: any) {
    return this.nutritionService.getTodays(req.user.id);
  }

  @Get('date/:date')
  getByDate(@Param('date') date: string, @Request() req: any) {
    return this.nutritionService.getByDate(req.user.id, date);
  }

  @Post('entries')
  addEntry(@Body() dto: AddEntryDto, @Request() req: any) {
    return this.nutritionService.addEntry(req.user.id, dto);
  }

  @Put('entries/:id')
  updateEntry(@Param('id') id: string, @Body() dto: UpdateEntryDto, @Request() req: any) {
    return this.nutritionService.updateEntry(req.user.id, +id, dto);
  }

  @Delete('entries/:id')
  removeEntry(@Param('id') id: string, @Request() req: any) {
    return this.nutritionService.removeEntry(req.user.id, +id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.nutritionService.getWeekHistory(req.user.id);
  }
}
