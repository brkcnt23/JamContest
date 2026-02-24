import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	// Remove global prefix - Vite proxy handles /api routing
	await app.listen(3000);
	console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
