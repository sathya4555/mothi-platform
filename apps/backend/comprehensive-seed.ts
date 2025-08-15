import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './src/entities/user.entity';
import { Party } from './src/entities/party.entity';
import { Product, ProductCategory } from './src/entities/product.entity';
import {
  Subcategory,
  SubcategoryCategory,
} from './src/entities/subcategory.entity';
import {
  Purchase,
  PurchaseStatus,
  SalesType,
} from './src/entities/purchase.entity';
import { PurchaseItem } from './src/entities/purchase-item.entity';
import { QuantityType } from './src/entities/quantity-type.enum';
import * as bcrypt from 'bcrypt';

// Realistic data generators
const companyNames = [
  'TechCorp Solutions',
  'Global Industries Ltd',
  'Metro Trading Co',
  'Prime Enterprises',
  'Elite Business Group',
  'Innovation Systems',
  'Peak Performance Inc',
  'Strategic Partners',
  'Advanced Technologies',
  'Premium Services Co',
  'Dynamic Solutions',
  'Excellence Corp',
  'Future Forward Ltd',
  'Quality First Industries',
  'Smart Business Solutions',
];

const businessTypes = [
  'Manufacturing',
  'Trading',
  'Services',
  'Retail',
  'Wholesale',
  'Import/Export',
  'Technology',
  'Healthcare',
  'Construction',
  'Automotive',
  'Food & Beverage',
  'Textiles',
  'Electronics',
  'Pharmaceuticals',
  'Real Estate',
];

const productCategories = {
  [ProductCategory.SMALL]: {
    names: [
      'Small Widget',
      'Mini Component',
      'Compact Unit',
      'Lightweight Item',
      'Portable Device',
    ],
    sizes: ['100g', '250g', '500g', '1kg', '2kg'],
    basePrices: [150, 280, 450, 750, 1200],
  },
  [ProductCategory.BIG]: {
    names: [
      'Standard Unit',
      'Regular Component',
      'Standard Device',
      'Normal Item',
      'Standard Product',
    ],
    sizes: ['5kg', '10kg', '15kg', '20kg', '25kg'],
    basePrices: [2500, 4500, 6500, 8500, 12000],
  },
  [ProductCategory.KING]: {
    names: [
      'Premium Unit',
      'Deluxe Component',
      'Premium Device',
      'Luxury Item',
      'Premium Product',
    ],
    sizes: ['50kg', '75kg', '100kg', '125kg', '150kg'],
    basePrices: [25000, 35000, 45000, 55000, 75000],
  },
};

const subcategoryOptions = {
  [SubcategoryCategory.SMALL]: ['10g', '25g', '50g', '100g', '200g'],
  [SubcategoryCategory.BIG]: ['1kg', '2kg', '3kg', '5kg', '7kg'],
  [SubcategoryCategory.KING]: ['10kg', '15kg', '20kg', '25kg', '30kg'],
};

const indianCities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
  'Vadodara',
  'Ghaziabad',
  'Ludhiana',
  'Agra',
  'Nashik',
  'Faridabad',
  'Meerut',
  'Rajkot',
  'Kalyan-Dombivali',
  'Vasai-Virar',
  'Varanasi',
  'Srinagar',
  'Aurangabad',
  'Dhanbad',
  'Amritsar',
  'Allahabad',
  'Ranchi',
];

const transportModes = [
  'Road Transport',
  'Railway Freight',
  'Air Cargo',
  'Sea Freight',
  'Express Delivery',
  'Local Transport',
  'Inter-state Transport',
  'Multi-modal Transport',
];

const destinations = [
  'Mumbai Warehouse',
  'Delhi Distribution Center',
  'Bangalore Hub',
  'Chennai Storage',
  'Kolkata Facility',
  'Hyderabad Depot',
  'Pune Center',
  'Ahmedabad Warehouse',
  'Jaipur Storage',
  'Surat Hub',
  'Lucknow Facility',
  'Kanpur Depot',
];

const remarks = [
  'Urgent delivery required',
  'Handle with care',
  'Fragile items included',
  'Temperature controlled storage needed',
  'High priority order',
  'Standard delivery timeline',
  'Bulk order - special handling',
  'Express delivery requested',
  'Regular processing',
  'Quality check required',
];

// Helper functions
function generateGSTNumber(): string {
  const states = [
    '27',
    '29',
    '33',
    '36',
    '37',
    '07',
    '09',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '28',
    '30',
    '31',
    '32',
    '34',
    '35',
  ];
  const stateCode = states[Math.floor(Math.random() * states.length)];
  const panNumber = Math.random().toString(36).substring(2, 12).toUpperCase();
  const entityCode = Math.floor(Math.random() * 10);
  const checkSum = Math.floor(Math.random() * 10);
  return `${stateCode}${panNumber}${entityCode}${checkSum}Z`;
}

function generatePhoneNumber(): string {
  const prefixes = ['6', '7', '8', '9'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return `${prefix}${number}`;
}

function generateEmail(name: string): string {
  const domains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'company.com',
    'business.in',
    'corp.com',
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 1000);
  return `${cleanName}${randomNum}@${domain}`;
}

function generateAddress(city: string): string {
  const areas = [
    'Industrial Area',
    'Business Park',
    'Commercial Zone',
    'Trade Center',
    'Market Area',
  ];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const street = Math.floor(Math.random() * 100) + 1;
  const building = Math.floor(Math.random() * 50) + 1;
  return `${building}, Street ${street}, ${area}, ${city}, India`;
}

function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PO-${timestamp}-${random}`.toUpperCase();
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${year}${month}-${number}`;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function calculateTotals(items: any[]): {
  total: number;
  gst: number;
  final: number;
} {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const gst = total * 0.05; // 5% GST
  const final = total + gst;
  return { total, gst, final };
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get(getRepositoryToken(User));
  const partyRepository = app.get(getRepositoryToken(Party));
  const productRepository = app.get(getRepositoryToken(Product));
  const subcategoryRepository = app.get(getRepositoryToken(Subcategory));
  const purchaseRepository = app.get(getRepositoryToken(Purchase));
  const purchaseItemRepository = app.get(getRepositoryToken(PurchaseItem));

  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // console.log('🧹 Clearing existing data...');
    // // Clear in order: child tables first, then parent tables
    // await purchaseItemRepository.clear();
    // await purchaseRepository.clear();
    // await subcategoryRepository.clear();
    // await productRepository.clear();
    // await partyRepository.clear();
    // await userRepository.clear();

    // 1. Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@mothi.com',
        phone: '9876543210',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@mothi.com',
        phone: '9876543211',
        password: hashedPassword,
        role: UserRole.COORDINATOR,
        isActive: true,
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@mothi.com',
        phone: '9876543212',
        password: hashedPassword,
        role: UserRole.AGENT,
        isActive: true,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@mothi.com',
        phone: '9876543213',
        password: hashedPassword,
        role: UserRole.AGENT,
        isActive: true,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@mothi.com',
        phone: '9876543214',
        password: hashedPassword,
        role: UserRole.AGENT,
        isActive: true,
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    // 2. Create Parties
    console.log('🏢 Creating parties...');
    const agents = createdUsers.filter((u) => u.role === UserRole.AGENT);
    const parties = [];

    for (let i = 0; i < 25; i++) {
      const companyName =
        companyNames[Math.floor(Math.random() * companyNames.length)];
      const businessType =
        businessTypes[Math.floor(Math.random() * businessTypes.length)];
      const city =
        indianCities[Math.floor(Math.random() * indianCities.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];

      const party = {
        name: `${companyName} - ${businessType}`,
        address: generateAddress(city),
        gstNumber: generateGSTNumber(),
        email: generateEmail(companyName),
        phone: generatePhoneNumber(),
        createdBy: agent.id,
      };

      const createdParty = partyRepository.create(party);
      const savedParty = await partyRepository.save(createdParty);
      parties.push(savedParty);
      console.log(`✅ Created party: ${party.name}`);
    }

    // 3. Create Products
    console.log('📦 Creating products...');
    const products = [];

    for (const category of Object.values(ProductCategory)) {
      const categoryData = productCategories[category];
      for (let i = 0; i < 8; i++) {
        const name =
          categoryData.names[
            Math.floor(Math.random() * categoryData.names.length)
          ];
        const size =
          categoryData.sizes[
            Math.floor(Math.random() * categoryData.sizes.length)
          ];
        const basePrice =
          categoryData.basePrices[
            Math.floor(Math.random() * categoryData.basePrices.length)
          ];

        const product = {
          name: `${name} ${i + 1}`,
          price: basePrice,
          size: size,
          category: category,
          isActive: true,
        };

        const createdProduct = productRepository.create(product);
        const savedProduct = await productRepository.save(createdProduct);
        products.push(savedProduct);
        console.log(`✅ Created product: ${product.name} (${product.size})`);
      }
    }

    // 4. Create Subcategories
    console.log('🏷️ Creating subcategories...');
    const subcategories = [];

    for (const product of products) {
      const categoryOptions = subcategoryOptions[product.category];
      const numSubcategories = Math.floor(Math.random() * 3) + 2; // 2-4 subcategories per product

      for (let i = 0; i < numSubcategories; i++) {
        const value =
          categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
        const basePrice = product.price;
        const pieceValue = basePrice * (0.8 + Math.random() * 0.4); // 80-120% of base price

        const subcategory = {
          productId: product.id,
          value: `${value} ${product.name}`,
          pieceValue: Math.round(pieceValue * 100) / 100,
          category: product.category,
          isActive: true,
          activationDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        };

        const createdSubcategory = subcategoryRepository.create(subcategory);
        const savedSubcategory =
          await subcategoryRepository.save(createdSubcategory);
        subcategories.push(savedSubcategory);
        console.log(
          `✅ Created subcategory: ${subcategory.value} (₹${subcategory.pieceValue})`,
        );
      }
    }

    // 5. Create Purchases
    console.log('🛒 Creating purchases...');
    const purchaseStatuses = Object.values(PurchaseStatus);
    const salesTypes = Object.values(SalesType);

    for (let i = 0; i < 50; i++) {
      const party = parties[Math.floor(Math.random() * parties.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const status =
        purchaseStatuses[Math.floor(Math.random() * purchaseStatuses.length)];
      const salesType =
        salesTypes[Math.floor(Math.random() * salesTypes.length)];

      // Generate realistic dates
      const orderDate = getRandomDate(new Date(2024, 0, 1), new Date());
      const approvalDate = new Date(
        orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      ); // 0-7 days later
      const invoiceDate = new Date(
        approvalDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000,
      ); // 0-3 days later

      const purchase = {
        agentId: agent.id,
        partyId: party.id,
        salesType: salesType,
        uniqueId: generateUniqueId(),
        destination:
          destinations[Math.floor(Math.random() * destinations.length)],
        transport:
          transportModes[Math.floor(Math.random() * transportModes.length)],
        invoiceDate: invoiceDate,
        orderPlacedDate: orderDate,
        orderApprovalDate: approvalDate,
        discount: Math.floor(Math.random() * 15), // 0-15% discount
        remarks: remarks[Math.floor(Math.random() * remarks.length)],
        status: status,
        invoiceNumber: generateInvoiceNumber(),
        totalAmount: 0, // Will be calculated
        gstAmount: 0, // Will be calculated
        finalAmount: 0, // Will be calculated
      };

      const createdPurchase = purchaseRepository.create(purchase);
      const savedPurchase = await purchaseRepository.save(createdPurchase);

      // 6. Create Purchase Items
      const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items per purchase
      const purchaseItems = [];

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const productSubcategories = subcategories.filter(
          (s) => s.productId === product.id,
        );
        const subcategory =
          productSubcategories.length > 0
            ? productSubcategories[
                Math.floor(Math.random() * productSubcategories.length)
              ]
            : null;

        const quantity = Math.floor(Math.random() * 20) + 1; // 1-20 quantity
        const quantityType =
          Math.random() > 0.7 ? QuantityType.BALE : QuantityType.PIECE;
        const unitPrice = subcategory ? subcategory.pieceValue : product.price;
        const totalPrice = quantity * unitPrice;

        const purchaseItem = {
          purchaseId: savedPurchase.id,
          productId: product.id,
          subcategoryId: subcategory?.id || null,
          quantity: quantity,
          quantityType: quantityType,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
        };

        const createdItem = purchaseItemRepository.create(purchaseItem);
        const savedItem = await purchaseItemRepository.save(createdItem);
        purchaseItems.push(savedItem);
      }

      // Update purchase totals
      const totals = calculateTotals(purchaseItems);
      await purchaseRepository.update(savedPurchase.id, {
        totalAmount: totals.total,
        gstAmount: totals.gst,
        finalAmount: totals.final,
      });

      console.log(
        `✅ Created purchase: ${savedPurchase.uniqueId} (${purchaseItems.length} items, ₹${totals.final.toFixed(2)})`,
      );
    }

    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🏢 Parties: ${parties.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`🏷️ Subcategories: ${subcategories.length}`);
    console.log(`🛒 Purchases: 50`);
    console.log('\n🔑 Test Users:');
    console.log('Admin: rajesh.kumar@mothi.com / password123');
    console.log('Coordinator: priya.sharma@mothi.com / password123');
    console.log('Agent: amit.patel@mothi.com / password123');
    console.log('Agent: sneha.reddy@mothi.com / password123');
    console.log('Agent: vikram.singh@mothi.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap();
