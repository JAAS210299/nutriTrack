"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
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
//# sourceMappingURL=main.js.map