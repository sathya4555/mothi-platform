import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081', // Your frontend URL
      'http://localhost:5173', // Vite dev server
      'http://localhost:4173', // Vite preview
      'https://mothi-platform.railway.app',
      'https://mothi-platform-production.up.railway.app', // Production backend
      'https://mothi-platform-web.railway.app', // Production frontend (Railway)
      'https://mothi-platform-web.vercel.app', // Production frontend (Vercel)
      process.env.FRONTEND_URL, // Allow environment variable override
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Mothi Platform Backend running on port ${port}`);
}
bootstrap();
