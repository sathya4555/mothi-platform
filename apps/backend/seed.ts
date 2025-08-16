import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './src/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));

  console.log('🌱 Starting database seeding...');

  // Check if users already exist
  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    console.log('✅ Users already exist, skipping seed...');
    await app.close();
    return;
  }

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@mothi.com',
      phone: '1234567890',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
    {
      name: 'Coordinator User',
      email: 'coordinator@mothi.com',
      phone: '1234567891',
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      isActive: true,
    },
    {
      name: 'Agent User',
      email: 'agent@mothi.com',
      phone: '1234567892',
      password: hashedPassword,
      role: UserRole.AGENT,
      isActive: true,
    },
  ];

  try {
    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Users:');
    console.log('Admin: admin@mothi.com / password123');
    console.log('Coordinator: coordinator@mothi.com / password123');
    console.log('Agent: agent@mothi.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }

  await app.close();
}

bootstrap();
