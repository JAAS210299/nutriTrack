"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200' });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('NutriTrack API')
        .setDescription('API REST para la aplicación de seguimiento nutricional NutriTrack')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/swagger', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log('🚀 Application running on http://localhost:3000');
    console.log('📚 Swagger disponible en http://localhost:3000/api/swagger');
}
bootstrap();
//# sourceMappingURL=main.js.map