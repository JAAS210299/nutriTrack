import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { SearchFoodDto } from './dto/search-food.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  async create(dto: CreateFoodDto, user: User): Promise<Food> {
    const food = this.foodRepository.create({
      ...dto,
      isCustom: user.role !== UserRole.ADMIN,
      createdBy: user,
    });
    return this.foodRepository.save(food);
  }

  async findAll(dto: SearchFoodDto, user: User) {
    const { query, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const where: any[] = [
      { isCustom: false },
      { isCustom: true, createdBy: { id: user.id } },
    ];

    if (query) {
      where[0] = { ...where[0], name: Like(`%${query}%`) };
      where[1] = { ...where[1], name: Like(`%${query}%`) };
    }

    const [items, total] = await this.foodRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<Food> {
    const food = await this.foodRepository.findOne({ where: { id } });
    if (!food) throw new NotFoundException('Alimento no encontrado');
    return food;
  }

  async update(id: number, dto: UpdateFoodDto, user: User): Promise<Food> {
    const food = await this.findOne(id);
    if (food.isCustom && food.createdBy?.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar este alimento');
    }
    Object.assign(food, dto);
    return this.foodRepository.save(food);
  }

  async remove(id: number, user: User): Promise<void> {
    const food = await this.findOne(id);
    if (food.isCustom && food.createdBy?.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar este alimento');
    }
    await this.foodRepository.remove(food);
  }

  async searchOpenFoodFacts(query: string): Promise<any[]> {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=true&page_size=10&fields=product_name,nutriments,brands`;
      const response = await fetch(url);
      const data: any = await response.json();

      if (!data.products) return [];

      return data.products
        .filter((p: any) =>
          p.product_name &&
          p.nutriments &&
          p.nutriments['energy-kcal_100g'] != null
        )
        .map((p: any) => ({
          name: p.product_name + (p.brands ? ` (${p.brands.split(',')[0].trim()})` : ''),
          caloriesPer100g: Math.round(p.nutriments['energy-kcal_100g'] || 0),
          proteinG: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
          carbsG: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
          fatG: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
          source: 'openfoodfacts',
        }))
        .slice(0, 8);
    } catch {
      return [];
    }
  }

  async importFromOpenFoodFacts(data: any, user: User): Promise<Food> {
    // Check if already exists
    const existing = await this.foodRepository.findOne({
      where: { name: data.name }
    });
    if (existing) return existing;

    const food = this.foodRepository.create({
      name: data.name,
      caloriesPer100g: data.caloriesPer100g,
      proteinG: data.proteinG,
      carbsG: data.carbsG,
      fatG: data.fatG,
      isCustom: false,
    });
    return this.foodRepository.save(food);
  }

  async seedFoods(): Promise<void> {
    const count = await this.foodRepository.count();
    if (count > 0) return;

    const foods = [
      { name: 'Pechuga de pollo', caloriesPer100g: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
      { name: 'Arroz blanco cocido', caloriesPer100g: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 },
      { name: 'Arroz integral cocido', caloriesPer100g: 111, proteinG: 2.6, carbsG: 23, fatG: 0.9 },
      { name: 'Huevo entero', caloriesPer100g: 155, proteinG: 13, carbsG: 1.1, fatG: 11 },
      { name: 'Clara de huevo', caloriesPer100g: 52, proteinG: 11, carbsG: 0.7, fatG: 0.2 },
      { name: 'Leche entera', caloriesPer100g: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3 },
      { name: 'Leche desnatada', caloriesPer100g: 35, proteinG: 3.4, carbsG: 5, fatG: 0.1 },
      { name: 'Yogur natural', caloriesPer100g: 59, proteinG: 3.5, carbsG: 4.7, fatG: 3.3 },
      { name: 'Queso fresco', caloriesPer100g: 98, proteinG: 11, carbsG: 3.5, fatG: 4.3 },
      { name: 'Atún en agua', caloriesPer100g: 116, proteinG: 26, carbsG: 0, fatG: 1 },
      { name: 'Salmón', caloriesPer100g: 208, proteinG: 20, carbsG: 0, fatG: 13 },
      { name: 'Ternera magra', caloriesPer100g: 150, proteinG: 26, carbsG: 0, fatG: 5 },
      { name: 'Lomo de cerdo', caloriesPer100g: 143, proteinG: 22, carbsG: 0, fatG: 6 },
      { name: 'Pan integral', caloriesPer100g: 247, proteinG: 9, carbsG: 44, fatG: 3.4 },
      { name: 'Pan blanco', caloriesPer100g: 265, proteinG: 8, carbsG: 51, fatG: 2.9 },
      { name: 'Pasta cocida', caloriesPer100g: 158, proteinG: 5.8, carbsG: 31, fatG: 0.9 },
      { name: 'Patata cocida', caloriesPer100g: 87, proteinG: 1.9, carbsG: 20, fatG: 0.1 },
      { name: 'Batata cocida', caloriesPer100g: 90, proteinG: 2, carbsG: 21, fatG: 0.1 },
      { name: 'Avena', caloriesPer100g: 389, proteinG: 17, carbsG: 66, fatG: 7 },
      { name: 'Plátano', caloriesPer100g: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 },
      { name: 'Manzana', caloriesPer100g: 52, proteinG: 0.3, carbsG: 14, fatG: 0.2 },
      { name: 'Naranja', caloriesPer100g: 47, proteinG: 0.9, carbsG: 12, fatG: 0.1 },
      { name: 'Fresas', caloriesPer100g: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 },
      { name: 'Aceite de oliva', caloriesPer100g: 884, proteinG: 0, carbsG: 0, fatG: 100 },
      { name: 'Almendras', caloriesPer100g: 579, proteinG: 21, carbsG: 22, fatG: 50 },
      { name: 'Lentejas cocidas', caloriesPer100g: 116, proteinG: 9, carbsG: 20, fatG: 0.4 },
      { name: 'Garbanzos cocidos', caloriesPer100g: 164, proteinG: 8.9, carbsG: 27, fatG: 2.6 },
      { name: 'Brócoli', caloriesPer100g: 34, proteinG: 2.8, carbsG: 7, fatG: 0.4 },
      { name: 'Espinacas', caloriesPer100g: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
      { name: 'Tomate', caloriesPer100g: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2 },
    ];

    for (const f of foods) {
      await this.foodRepository.save(this.foodRepository.create({ ...f, isCustom: false }));
    }
    console.log('✅ Base de datos de alimentos inicializada con 30 alimentos');
  }
}
