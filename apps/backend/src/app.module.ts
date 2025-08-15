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
      url:
        process.env.DATABASE_URL ||
        '',
      entities: [
        User,
        Party,
        Product,
        Subcategory,
        Purchase,
        PurchaseItem,
        Document,
      ],
      synchronize: false, // Only in development
      logging: process.env.TYPEORM_LOGGING === 'true',
      ssl: {
        rejectUnauthorized: false,
      },
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
