import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:4200'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Application running on http://localhost:${PORT}`);
}
bootstrap();
