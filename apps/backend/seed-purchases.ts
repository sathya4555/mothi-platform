import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './src/entities/user.entity';
import { Purchase, PurchaseStatus } from './src/entities/purchase.entity';
import { Party } from './src/entities/party.entity';
import { Product } from './src/entities/product.entity';
import { Subcategory } from './src/entities/subcategory.entity';
import { PurchaseItem } from './src/entities/purchase-item.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const purchaseRepository = app.get(getRepositoryToken(Purchase));
  const partyRepository = app.get(getRepositoryToken(Party));
  const productRepository = app.get(getRepositoryToken(Product));
  const subcategoryRepository = app.get(getRepositoryToken(Subcategory));
  const purchaseItemRepository = app.get(getRepositoryToken(PurchaseItem));

  console.log('🌱 Starting purchase data seeding...');

  // Check if purchases already exist
  const existingPurchases = await purchaseRepository.find();
  if (existingPurchases.length > 0) {
    console.log('✅ Purchases already exist, skipping seed...');
    await app.close();
    return;
  }

  try {
    // Get or create a test agent
    let agent = await userRepository.findOne({
      where: { role: UserRole.AGENT },
    });
    if (!agent) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      agent = userRepository.create({
        name: 'Test Agent',
        email: 'agent@mothi.com',
        phone: '1234567892',
        password: hashedPassword,
        role: UserRole.AGENT,
        isActive: true,
      });
      await userRepository.save(agent);
    }

    // Create test party
    const party = partyRepository.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '9876543210',
      address: '123 Test Street, Test City',
    });
    await partyRepository.save(party);

    // Create test subcategory
    const subcategory = subcategoryRepository.create({
      name: 'Test Subcategory',
      description: 'Test subcategory for seeding',
    });
    await subcategoryRepository.save(subcategory);

    // Create test product
    const product = productRepository.create({
      name: 'Test Product',
      description: 'Test product for seeding',
      subcategoryId: subcategory.id,
      pieceValue: 1000,
      baleValue: 50000,
    });
    await productRepository.save(product);

    // Create test purchases for the last 30 days
    const statuses = [
      PurchaseStatus.COMPLETED,
      PurchaseStatus.PROCESSING,
      PurchaseStatus.CONFIRMATION_PENDING,
    ];
    const salesTypes = ['small', 'big', 'king'];

    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const salesType =
        salesTypes[Math.floor(Math.random() * salesTypes.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 500;

      const purchase = purchaseRepository.create({
        uniqueId: `TEST-${Date.now()}-${i}`,
        partyId: party.id,
        agentId: agent.id,
        salesType: salesType as any,
        status: status,
        finalAmount: quantity * unitPrice * 1.05, // Including GST
        createdAt: createdAt,
        updatedAt: createdAt,
      });

      const savedPurchase = await purchaseRepository.save(purchase);

      // Create purchase item
      const purchaseItem = purchaseItemRepository.create({
        purchaseId: savedPurchase.id,
        productId: product.id,
        subcategoryId: subcategory.id,
        quantity: quantity,
        quantityType: 'piece',
        unitPrice: unitPrice,
        totalPrice: quantity * unitPrice,
      });

      await purchaseItemRepository.save(purchaseItem);
    }

    console.log('✅ Created 20 test purchases with various statuses and dates');
    console.log('🎉 Purchase data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding purchase data:', error);
  }

  await app.close();
}

bootstrap();
