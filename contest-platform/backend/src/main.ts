import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.use(cookieParser());
	// Remove global prefix - Vite proxy handles /api routing
	await app.listen(3000);
	console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
