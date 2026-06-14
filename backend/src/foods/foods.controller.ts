import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { SearchFoodDto } from './dto/search-food.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('foods')
@UseGuards(JwtAuthGuard)
export class FoodsController {
  constructor(private foodsService: FoodsService) {}

  @Get()
  findAll(@Query() dto: SearchFoodDto, @Request() req: any) {
    return this.foodsService.findAll(dto, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateFoodDto, @Request() req: any) {
    return this.foodsService.create(dto, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFoodDto, @Request() req: any) {
    return this.foodsService.update(+id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.foodsService.remove(+id, req.user);
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  seed() {
    return this.foodsService.seedFoods();
  }
}
