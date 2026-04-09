import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({ credentials: true, origin: true });
	app.use(cookieParser());
	
	const port = process.env.PORT || 3000;
	await app.listen(port);
	console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
