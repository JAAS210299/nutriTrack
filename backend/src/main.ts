import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200' });

  const config = new DocumentBuilder()
    .setTitle('NutriTrack API')
    .setDescription('API REST para la aplicación de seguimiento nutricional NutriTrack')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Application running on http://localhost:3000');
  console.log('📚 Swagger disponible en http://localhost:3000/api/swagger');
}
bootstrap();
