// server/src/utils/seed.ts
import { PrismaClient, TransactionType, TransactionStatus, InventoryStatus, ProductItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

// --- Creational Patterns: Factory Method for Products ---
interface ProductSpec {
  name: string;
  sku: string;
  category_id: number;
  supplier_id: number;
  image_url?: string;
  specifications: any;
}

abstract class ProductFactory {
  abstract createProduct(baseSku: string, index: number, categoryId: number, supplierId: number): ProductSpec;
}

class PhoneFactory extends ProductFactory {
  createProduct(baseSku: string, index: number, categoryId: number, supplierId: number): ProductSpec {
    return {
      name: `Smartphone Model ${index}`,
      sku: `${baseSku}-PHONE-${index}`,
      category_id: categoryId,
      supplier_id: supplierId,
      image_url: `https://example.com/phone${index}.jpg`,
      specifications: {
        ram: "8GB",
        storage: "256GB",
        screen: "6.5 inch OLED",
        battery: "4500mAh"
      }
    };
  }
}

class LaptopFactory extends ProductFactory {
  createProduct(baseSku: string, index: number, categoryId: number, supplierId: number): ProductSpec {
    return {
      name: `Pro Laptop ${index}`,
      sku: `${baseSku}-LAP-${index}`,
      category_id: categoryId,
      supplier_id: supplierId,
      image_url: `https://example.com/laptop${index}.jpg`,
      specifications: {
        cpu: "Intel Core i7",
        ram: "16GB",
        storage: "1TB SSD",
        screen: "15.6 inch IPS"
      }
    };
  }
}

class AccessoryFactory extends ProductFactory {
  createProduct(baseSku: string, index: number, categoryId: number, supplierId: number): ProductSpec {
    return {
      name: `Premium Headphone ${index}`,
      sku: `${baseSku}-ACC-${index}`,
      category_id: categoryId,
      supplier_id: supplierId,
      image_url: `https://example.com/acc${index}.jpg`,
      specifications: {
        type: "Wireless",
        batteryLife: "20 hours",
        noiseCancellation: true
      }
    };
  }
}

// --- Creational Patterns: Builder for Transactions ---
class TransactionBuilder {
  private transaction: any = {
    details: { create: [] }
  };

  constructor(code: string, type: TransactionType, createdBy: number) {
    this.transaction.code = code;
    this.transaction.type = type;
    this.transaction.created_by = createdBy;
    this.transaction.status = TransactionStatus.COMPLETED;
    this.transaction.total_amount = 0;
  }

  setSourceWarehouse(id: number) {
    this.transaction.source_warehouse_id = id;
    return this;
  }

  setDestWarehouse(id: number) {
    this.transaction.dest_warehouse_id = id;
    return this;
  }

  setCreatedAt(date: Date) {
    this.transaction.created_at = date;
    return this;
  }

  addDetail(productId: number, quantity: number, unitPrice: number, imeis: { product_item_id: number }[]) {
    this.transaction.details.create.push({
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      imeis: {
        create: imeis
      }
    });
    this.transaction.total_amount += quantity * unitPrice;
    return this;
  }

  build() {
    return this.transaction;
  }
}

import bcrypt from 'bcryptjs';

async function main() {
  console.log("Starting DB Seeding...");

  // 1. Clean existing data
  await prisma.transactionImei.deleteMany();
  await prisma.transactionDetail.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.productItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.userWarehouse.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 2. Setup Base Entities (Roles, Users)
  const roleAdmin = await prisma.role.create({ data: { name: 'Admin', description: 'System Administrator' } });
  const roleManager = await prisma.role.create({ data: { name: 'Manager', description: 'Warehouse Manager' } });

  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.create({
    data: {
      role_id: roleAdmin.id,
      full_name: 'Admin User',
      username: 'admin',
      email: 'admin@f4.com',
      password_hash: hashedPassword,
      status: 'ACTIVE'
    }
  });

  const manager = await prisma.user.create({
    data: {
      role_id: roleManager.id,
      full_name: 'Manager User',
      username: 'manager',
      email: 'manager@f4.com',
      password_hash: hashedPassword,
      status: 'ACTIVE'
    }
  });

  // 3. Create 5 Warehouses
  const warehouses = [];
  for (let i = 1; i <= 5; i++) {
    warehouses.push(
      await prisma.warehouse.create({
        data: { name: `Warehouse ${['North', 'South', 'East', 'West', 'Central'][i - 1]}`, address: `Address ${i}`, capacity: 1000 + i * 500 }
      })
    );
  }

  await prisma.userWarehouse.createMany({
    data: [
      { user_id: manager.id, warehouse_id: warehouses[0].id },
      { user_id: manager.id, warehouse_id: warehouses[1].id },
      { user_id: admin.id, warehouse_id: warehouses[0].id },
      { user_id: admin.id, warehouse_id: warehouses[1].id },
      { user_id: admin.id, warehouse_id: warehouses[2].id },
      { user_id: admin.id, warehouse_id: warehouses[3].id },
      { user_id: admin.id, warehouse_id: warehouses[4].id },
    ]
  });

  // 4. Create Categories & Suppliers
  const catPhone = await prisma.category.create({ data: { name: 'Điện thoại' } });
  const catLaptop = await prisma.category.create({ data: { name: 'Laptop' } });
  const catAccessory = await prisma.category.create({ data: { name: 'Phụ kiện' } });

  const supplier = await prisma.supplier.create({
    data: { company_name: 'Tech Corp', phone: '123456789', address: 'Tech Street', email: 'contact@techcorp.com' }
  });

  // 5. Create Products using Factories
  const products = [];
  const factories = [
    { factory: new PhoneFactory(), catId: catPhone.id },
    { factory: new LaptopFactory(), catId: catLaptop.id },
    { factory: new AccessoryFactory(), catId: catAccessory.id }
  ];

  for (let i = 1; i <= 30; i++) {
    const { factory, catId } = factories[i % 3];
    const spec = factory.createProduct('TECH', i, catId, supplier.id);
    products.push(await prisma.product.create({ data: spec }));
  }

  // 6. Create Inventories & Product Items
  let totalItemsCreated = 0;
  const productItemsMap = new Map<number, any[]>();

  for (const product of products) {
    productItemsMap.set(product.id, []);
    for (const warehouse of warehouses) {
      const statuses = [InventoryStatus.READY_TO_SELL, InventoryStatus.DEFECTIVE, InventoryStatus.IN_TRANSIT];
      
      for (const status of statuses) {
        const qty = status === InventoryStatus.READY_TO_SELL ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 5) + 1;
        
        await prisma.inventory.create({
          data: {
            warehouse_id: warehouse.id,
            product_id: product.id,
            quantity: qty,
            status: status
          }
        });

        if (status === InventoryStatus.READY_TO_SELL) {
          for (let k = 0; k < qty; k++) {
            totalItemsCreated++;
            const item = await prisma.productItem.create({
              data: {
                product_id: product.id,
                warehouse_id: warehouse.id,
                imei_serial: `IMEI-${product.id}-${warehouse.id}-${k}-${Date.now()}`,
                status: ProductItemStatus.IN_STOCK
              }
            });
            productItemsMap.get(product.id)!.push(item);
          }
        }
      }
    }
  }

  // 7. Temporal Data: Create Transactions (Inbound/Outbound) over the last 7 days
  console.log(`Creating Transactions for last 7 days... Total Items created: ${totalItemsCreated}`);
  
  for (let day = 0; day <= 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Inbound
    const inboundBuilder = new TransactionBuilder(`INB-${day}-${Date.now()}`, TransactionType.INBOUND, admin.id)
      .setDestWarehouse(warehouses[0].id)
      .setCreatedAt(date);
    
    const someProduct = products[0];
    const someItems = productItemsMap.get(someProduct.id)!.slice(0, 5);
    
    if (someItems.length > 0) {
      inboundBuilder.addDetail(
        someProduct.id, 
        someItems.length, 
        1500, 
        someItems.map(item => ({ product_item_id: item.id }))
      );
    }
    await prisma.transaction.create({ data: inboundBuilder.build() });

    // Outbound
    const outboundBuilder = new TransactionBuilder(`OUT-${day}-${Date.now()}`, TransactionType.OUTBOUND, admin.id)
      .setSourceWarehouse(warehouses[1].id)
      .setCreatedAt(date);
      
    const anotherProduct = products[1];
    const anotherItems = productItemsMap.get(anotherProduct.id)!.slice(0, 3);
    
    if (anotherItems.length > 0) {
      outboundBuilder.addDetail(
        anotherProduct.id, 
        anotherItems.length, 
        2000, 
        anotherItems.map(item => ({ product_item_id: item.id }))
      );
    }
    await prisma.transaction.create({ data: outboundBuilder.build() });
  }

  console.log("Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
