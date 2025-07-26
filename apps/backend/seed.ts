import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './src/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create NestJS application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the User repository
    const userRepository = app.get(getRepositoryToken(User));

    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: 'superadmin@mothi.com' },
    });

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      await app.close();
      return;
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superAdmin = userRepository.create({
      name: 'Super Administrator',
      email: 'superadmin@mothi.com',
      phone: '1234567890',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const savedSuperAdmin = await userRepository.save(superAdmin);

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', savedSuperAdmin.email);
    console.log('🔑 Password: superadmin123');
    console.log('👤 Role:', savedSuperAdmin.role);
    console.log('🆔 ID:', savedSuperAdmin.id);

    // Create a regular admin user as well
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@mothi.com' },
    });

    if (!existingAdmin) {
      const adminHashedPassword = await bcrypt.hash('admin123', 10);

      const admin = userRepository.create({
        name: 'System Administrator',
        email: 'admin@mothi.com',
        phone: '1234567891',
        password: adminHashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });

      const savedAdmin = await userRepository.save(admin);

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', savedAdmin.email);
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin user already exists:', existingAdmin.email);
    }

    // Create a test agent user
    const existingAgent = await userRepository.findOne({
      where: { email: 'agent@mothi.com' },
    });

    if (!existingAgent) {
      const agentHashedPassword = await bcrypt.hash('agent123', 10);

      const agent = userRepository.create({
        name: 'Test Agent',
        email: 'agent@mothi.com',
        phone: '1234567892',
        password: agentHashedPassword,
        role: UserRole.AGENT,
        isActive: true,
      });

      const savedAgent = await userRepository.save(agent);

      console.log('✅ Agent user created successfully!');
      console.log('📧 Email:', savedAgent.email);
      console.log('🔑 Password: agent123');
    } else {
      console.log('✅ Agent user already exists:', existingAgent.email);
    }

    // Create a test coordinator user
    const existingCoordinator = await userRepository.findOne({
      where: { email: 'coordinator@mothi.com' },
    });

    if (!existingCoordinator) {
      const coordinatorHashedPassword = await bcrypt.hash('coordinator123', 10);

      const coordinator = userRepository.create({
        name: 'Test Coordinator',
        email: 'coordinator@mothi.com',
        phone: '1234567893',
        password: coordinatorHashedPassword,
        role: UserRole.COORDINATOR,
        isActive: true,
      });

      const savedCoordinator = await userRepository.save(coordinator);

      console.log('✅ Coordinator user created successfully!');
      console.log('📧 Email:', savedCoordinator.email);
      console.log('🔑 Password: coordinator123');
    } else {
      console.log(
        '✅ Coordinator user already exists:',
        existingCoordinator.email,
      );
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Users Created:');
    console.log(
      '┌─────────────────┬─────────────────────┬─────────────┬──────────┐',
    );
    console.log(
      '│ Role            │ Email               │ Password    │ Status   │',
    );
    console.log(
      '├─────────────────┼─────────────────────┼─────────────┼──────────┤',
    );
    console.log(
      '│ Super Admin     │ superadmin@mothi.com│ superadmin123│ Active   │',
    );
    console.log(
      '│ Admin           │ admin@mothi.com     │ admin123     │ Active   │',
    );
    console.log(
      '│ Agent           │ agent@mothi.com     │ agent123     │ Active   │',
    );
    console.log(
      '│ Coordinator     │ coordinator@mothi.com│ coordinator123│ Active   │',
    );
    console.log(
      '└─────────────────┴─────────────────────┴─────────────┴──────────┘',
    );

    await app.close();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
