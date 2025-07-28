import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  User,
  Party,
  Product,
  Subcategory,
  Purchase,
  PurchaseItem,
  Document,
} from './entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PartiesModule } from './parties/parties.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_HOST || 'localhost',
      port: parseInt(process.env.TYPEORM_PORT) || 5432,
      username: process.env.TYPEORM_USERNAME || 'postgres',
      password: process.env.TYPEORM_PASSWORD || 'postgres',
      database: process.env.TYPEORM_DATABASE || 'mothi',
      entities: [
        User,
        Party,
        Product,
        Subcategory,
        Purchase,
        PurchaseItem,
        Document,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Only in development
      logging: process.env.TYPEORM_LOGGING === 'true',
    }),
    AuthModule,
    UsersModule,
    PartiesModule,
    ProductsModule,
    PurchasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
