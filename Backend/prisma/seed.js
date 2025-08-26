const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create super admin user
    const adminPassword = await bcrypt.hash('Admin123!@#', 12);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@restaurantdashboard.com' },
      update: {},
      create: {
        email: 'admin@restaurantdashboard.com',
        username: 'superadmin',
        password: adminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1-555-0001',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });
    console.log('✅ Super admin user created');

    // Create demo restaurant
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: 'aura-restaurant' },
      update: {},
      create: {
        name: 'Aura Restaurant',
        slug: 'aura-restaurant',
        description: 'Fine dining experience in downtown Seattle',
        address: '1234 Pine Street',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'US',
        phone: '+1-206-555-0100',
        email: 'info@aura-restaurant.com',
        website: 'https://aura-restaurant.com',
        capacity: 120,
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        isActive: true,
      },
    });
    console.log('✅ Demo restaurant created');

    // Create restaurant manager
    const managerPassword = await bcrypt.hash('Manager123!', 12);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@aura-restaurant.com' },
      update: {},
      create: {
        email: 'manager@aura-restaurant.com',
        username: 'manager',
        password: managerPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-206-555-0101',
        role: 'MANAGER',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

    // Create restaurant staff relationship
    await prisma.restaurantStaff.upsert({
      where: { userId_restaurantId: { userId: manager.id, restaurantId: restaurant.id } },
      update: {},
      create: {
        userId: manager.id,
        restaurantId: restaurant.id,
        role: 'GENERAL_MANAGER',
        position: 'General Manager',
        department: 'Management',
        hourlyRate: 25.00,
        isActive: true,
        hiredAt: new Date('2023-01-01'),
      },
    });

    // Create staff users
    const staffData = [
      {
        email: 'chef@aura-restaurant.com',
        username: 'headchef',
        firstName: 'Marco',
        lastName: 'Rossi',
        phone: '+1-206-555-0102',
        role: 'STAFF',
        staffRole: 'HEAD_CHEF',
        position: 'Head Chef',
        department: 'Kitchen',
        hourlyRate: 28.00,
      },
      {
        email: 'souschef@aura-restaurant.com',
        username: 'souschef',
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1-206-555-0103',
        role: 'STAFF',
        staffRole: 'SOUS_CHEF',
        position: 'Sous Chef',
        department: 'Kitchen',
        hourlyRate: 22.00,
      },
      {
        email: 'server1@aura-restaurant.com',
        username: 'emma_server',
        firstName: 'Emma',
        lastName: 'Davis',
        phone: '+1-206-555-0104',
        role: 'STAFF',
        staffRole: 'SERVER',
        position: 'Senior Server',
        department: 'Service',
        hourlyRate: 18.00,
      },
      {
        email: 'bartender@aura-restaurant.com',
        username: 'tom_bartender',
        firstName: 'Tom',
        lastName: 'Wilson',
        phone: '+1-206-555-0105',
        role: 'STAFF',
        staffRole: 'BARTENDER',
        position: 'Head Bartender',
        department: 'Bar',
        hourlyRate: 20.00,
      },
    ];

    const staffPassword = await bcrypt.hash('Staff123!', 12);
    for (const staff of staffData) {
      const user = await prisma.user.upsert({
        where: { email: staff.email },
        update: {},
        create: {
          email: staff.email,
          username: staff.username,
          password: staffPassword,
          firstName: staff.firstName,
          lastName: staff.lastName,
          phone: staff.phone,
          role: staff.role,
          status: 'ACTIVE',
          isEmailVerified: true,
        },
      });

      await prisma.restaurantStaff.upsert({
        where: { userId_restaurantId: { userId: user.id, restaurantId: restaurant.id } },
        update: {},
        create: {
          userId: user.id,
          restaurantId: restaurant.id,
          role: staff.staffRole,
          position: staff.position,
          department: staff.department,
          hourlyRate: staff.hourlyRate,
          isActive: true,
          hiredAt: new Date('2023-01-15'),
        },
      });
    }
    console.log('✅ Staff users created');

    // Create tables
    const tableData = [
      { number: 1, seats: 2, section: 'Window', x: 50, y: 50, width: 80, height: 80 },
      { number: 2, seats: 4, section: 'Main', x: 150, y: 50, width: 100, height: 80 },
      { number: 3, seats: 4, section: 'Main', x: 270, y: 50, width: 100, height: 80 },
      { number: 4, seats: 6, section: 'Main', x: 50, y: 150, width: 120, height: 80 },
      { number: 5, seats: 2, section: 'Bar', x: 150, y: 150, width: 80, height: 80 },
      { number: 6, seats: 8, section: 'Private', x: 270, y: 150, width: 140, height: 100 },
      { number: 7, seats: 4, section: 'Patio', x: 50, y: 250, width: 100, height: 80 },
      { number: 8, seats: 2, section: 'Patio', x: 170, y: 250, width: 80, height: 80 },
      { number: 9, seats: 6, section: 'Main', x: 270, y: 250, width: 120, height: 80 },
      { number: 10, seats: 4, section: 'Window', x: 50, y: 350, width: 100, height: 80 },
    ];

    for (const table of tableData) {
      await prisma.table.upsert({
        where: { restaurantId_number: { restaurantId: restaurant.id, number: table.number } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          number: table.number,
          seats: table.seats,
          section: table.section,
          shape: 'SQUARE',
          status: 'AVAILABLE',
          x: table.x,
          y: table.y,
          width: table.width,
          height: table.height,
          isActive: true,
        },
      });
    }
    console.log('✅ Tables created');

    // Create menu categories
    const categories = [
      { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', sortOrder: 1 },
      { name: 'Entrees', description: 'Main course selections', sortOrder: 2 },
      { name: 'Desserts', description: 'Sweet endings to your meal', sortOrder: 3 },
      { name: 'Beverages', description: 'Drinks and cocktails', sortOrder: 4 },
    ];

    const createdCategories = {};
    for (const category of categories) {
      const cat = await prisma.category.upsert({
        where: { restaurantId_name: { restaurantId: restaurant.id, name: category.name } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true,
        },
      });
      createdCategories[category.name] = cat;
    }
    console.log('✅ Menu categories created');

    // Create menu items
    const menuItems = [
      {
        categoryName: 'Appetizers',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan and house-made croutons',
        price: 18.99,
        cost: 4.20,
        calories: 250,
        preparationTime: 10,
        popularity: 95,
        tags: ['vegetarian', 'popular'],
        allergens: ['gluten', 'dairy'],
        dietaryInfo: ['vegetarian'],
      },
      {
        categoryName: 'Appetizers',
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls with truffle oil and parmesan',
        price: 24.99,
        cost: 6.80,
        calories: 420,
        preparationTime: 15,
        popularity: 78,
        tags: ['truffle', 'italian'],
        allergens: ['gluten', 'dairy'],
        dietaryInfo: ['vegetarian'],
      },
      {
        categoryName: 'Entrees',
        name: 'Wagyu Steak',
        description: 'Premium A5 Wagyu beef with seasonal vegetables',
        price: 89.99,
        cost: 35.20,
        calories: 680,
        preparationTime: 25,
        popularity: 85,
        tags: ['premium', 'wagyu', 'beef'],
        allergens: [],
        dietaryInfo: ['gluten-free'],
      },
      {
        categoryName: 'Entrees',
        name: 'Lobster Thermidor',
        description: 'Fresh lobster in a creamy cognac sauce',
        price: 76.99,
        cost: 28.40,
        calories: 520,
        preparationTime: 30,
        popularity: 72,
        tags: ['seafood', 'premium'],
        allergens: ['shellfish', 'dairy'],
        dietaryInfo: ['gluten-free'],
      },
      {
        categoryName: 'Entrees',
        name: 'Truffle Pasta',
        description: 'House-made pasta with black truffle and wild mushrooms',
        price: 42.99,
        cost: 12.80,
        calories: 580,
        preparationTime: 20,
        popularity: 88,
        tags: ['pasta', 'truffle', 'vegetarian'],
        allergens: ['gluten', 'dairy', 'eggs'],
        dietaryInfo: ['vegetarian'],
      },
      {
        categoryName: 'Desserts',
        name: 'Chocolate Soufflé',
        description: 'Classic French chocolate soufflé with vanilla ice cream',
        price: 16.99,
        cost: 3.80,
        calories: 420,
        preparationTime: 25,
        popularity: 82,
        tags: ['chocolate', 'french', 'dessert'],
        allergens: ['dairy', 'eggs', 'gluten'],
        dietaryInfo: ['vegetarian'],
      },
    ];

    for (const item of menuItems) {
      await prisma.menuItem.upsert({
        where: { restaurantId_name: { restaurantId: restaurant.id, name: item.name } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          categoryId: createdCategories[item.categoryName].id,
          name: item.name,
          description: item.description,
          price: item.price,
          cost: item.cost,
          calories: item.calories,
          preparationTime: item.preparationTime,
          popularity: item.popularity,
          isActive: true,
          isAvailable: true,
          tags: item.tags,
          allergens: item.allergens,
          dietaryInfo: item.dietaryInfo,
        },
      });
    }
    console.log('✅ Menu items created');

    // Create sample customers
    const customers = [
      {
        email: 'robert.anderson@email.com',
        firstName: 'Robert',
        lastName: 'Anderson',
        phone: '+1-555-123-4567',
        loyaltyTier: 'GOLD',
        totalVisits: 12,
        totalSpent: 2400.00,
        averageCheck: 200.00,
        lastVisitAt: new Date('2024-01-15'),
      },
      {
        email: 'maria.garcia@email.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1-555-234-5678',
        loyaltyTier: 'SILVER',
        totalVisits: 8,
        totalSpent: 1600.00,
        averageCheck: 200.00,
        lastVisitAt: new Date('2024-01-10'),
      },
      {
        email: 'david.smith@email.com',
        firstName: 'David',
        lastName: 'Smith',
        phone: '+1-555-345-6789',
        loyaltyTier: 'PLATINUM',
        totalVisits: 25,
        totalSpent: 5250.00,
        averageCheck: 210.00,
        lastVisitAt: new Date('2024-01-20'),
        dateOfBirth: new Date('1980-06-15'),
        anniversary: new Date('2010-09-20'),
        dietaryRestrictions: ['vegetarian'],
      },
    ];

    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { email: customer.email },
        update: {},
        create: customer,
      });
    }
    console.log('✅ Sample customers created');

    // Create suppliers
    const suppliers = [
      {
        name: 'Premium Food Suppliers',
        contactName: 'John Smith',
        email: 'john@premiumfood.com',
        phone: '+1-206-555-0200',
        address: '789 Supply St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98102',
        paymentTerms: 'Net 30',
      },
      {
        name: 'Organic Produce Co.',
        contactName: 'Lisa Johnson',
        email: 'lisa@organicproduce.com',
        phone: '+1-206-555-0201',
        address: '456 Organic Ave',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98103',
        paymentTerms: 'Net 15',
      },
    ];
    const createdSuppliers = {};
    for (const supplier of suppliers) {
      const sup = await prisma.supplier.upsert({
        where: { restaurantId_name: { restaurantId: restaurant.id, name: supplier.name } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          ...supplier,
          isActive: true,
        },
      });
      createdSuppliers[supplier.name] = sup;
    }
    console.log('✅ Suppliers created');

    // Create inventory items
    const inventoryItems = [
      {
        supplierName: 'Premium Food Suppliers',
        name: 'Prime Beef',
        category: 'Meat',
        unit: 'lbs',
        currentStock: 85.0,
        minimumStock: 20.0,
        maximumStock: 100.0,
        unitCost: 12.50,
      },
      {
        supplierName: 'Premium Food Suppliers',
        name: 'Fresh Salmon',
        category: 'Seafood',
        unit: 'lbs',
        currentStock: 45.0,
        minimumStock: 15.0,
        maximumStock: 60.0,
        unitCost: 8.75,
      },
      {
        supplierName: 'Organic Produce Co.',
        name: 'Organic Tomatoes',
        category: 'Produce',
        unit: 'lbs',
        currentStock: 25.0,
        minimumStock: 10.0,
        maximumStock: 40.0,
        unitCost: 3.20,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        supplierName: 'Premium Food Suppliers',
        name: 'Truffle Oil',
        category: 'Condiments',
        unit: 'bottles',
        currentStock: 8.0,
        minimumStock: 3.0,
        maximumStock: 12.0,
        unitCost: 45.00,
        location: 'Pantry A-3',
      },
    ];

    for (const item of inventoryItems) {
      await prisma.inventoryItem.upsert({
        where: { restaurantId_name: { restaurantId: restaurant.id, name: item.name } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          supplierId: createdSuppliers[item.supplierName].id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          currentStock: item.currentStock,
          minimumStock: item.minimumStock,
          maximumStock: item.maximumStock,
          unitCost: item.unitCost,
          expirationDate: item.expirationDate || null,
          location: item.location || null,
          isActive: true,
        },
      });
    }
    console.log('✅ Inventory items created');

    // Create sample analytics data for the past week
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const baseRevenue = 4000 + Math.random() * 2000;
      const orders = Math.floor(baseRevenue / 85) + Math.floor(Math.random() * 20);

      await prisma.restaurantAnalytics.upsert({
        where: { restaurantId_date: { restaurantId: restaurant.id, date } },
        update: {},
        create: {
          restaurantId: restaurant.id,
          date,
          totalRevenue: baseRevenue,
          totalOrders: orders,
          totalCustomers: Math.floor(orders * 0.8),
          averageOrderValue: baseRevenue / orders,
          tableOccupancyRate: 65 + Math.random() * 25,
          averageWaitTime: 15 + Math.floor(Math.random() * 20),
          customerSatisfaction: 4.2 + Math.random() * 0.6,
        },
      });
    }
    console.log('✅ Analytics data created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Super Admin: admin@restaurantdashboard.com / Admin123!@#');
    console.log('Manager: manager@aura-restaurant.com / Manager123!');
    console.log('Chef: chef@aura-restaurant.com / Staff123!');
    console.log('Server: server1@aura-restaurant.com / Staff123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });