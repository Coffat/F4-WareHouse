/**
 * SEED SCRIPT - Tạo dữ liệu mẫu cho hệ thống
 * =============================================
 * Chạy: npx ts-node src/utils/seed.ts
 *
 * Tạo:
 * - 3 Roles: Owner, Manager, Warehouse Staff
 * - 3 Warehouses
 * - 3 Users mẫu (1 mỗi role)
 * - Phân công Manager và Staff vào các kho
 */

import { prisma } from "../config/database";
import bcrypt from "bcryptjs";
import DatabaseClient from "../config/database";

async function seed() {
  console.log("🌱 Bắt đầu seed dữ liệu...\n");

  // =============================================
  // Xóa dữ liệu cũ (theo thứ tự để tránh FK constraint)
  // =============================================
  await prisma.userWarehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.warehouse.deleteMany();
  console.log("🗑️  Đã xóa dữ liệu cũ.");

  // =============================================
  // Tạo Roles
  // =============================================
  const [ownerRole, managerRole, staffRole] = await Promise.all([
    prisma.role.create({ data: { name: "Owner", description: "Chủ sở hữu, có toàn quyền hệ thống." } }),
    prisma.role.create({ data: { name: "Manager", description: "Quản lý kho được phân công." } }),
    prisma.role.create({ data: { name: "Warehouse Staff", description: "Nhân viên kho được phân công." } }),
  ]);
  console.log("✅ Tạo Roles:", { ownerRole, managerRole, staffRole });

  // =============================================
  // Tạo Warehouses
  // =============================================
  const [warehouseA, warehouseB, warehouseC] = await Promise.all([
    prisma.warehouse.create({ data: { name: "Kho Hà Nội", address: "123 Phố Huế, Hai Bà Trưng, HN", capacity: 1000 } }),
    prisma.warehouse.create({ data: { name: "Kho Hồ Chí Minh", address: "456 Nguyễn Trãi, Q5, HCM", capacity: 2000 } }),
    prisma.warehouse.create({ data: { name: "Kho Đà Nẵng", address: "789 Lê Duẩn, Hải Châu, ĐN", capacity: 500 } }),
  ]);
  console.log("✅ Tạo Warehouses:", { warehouseA, warehouseB, warehouseC });

  // =============================================
  // Tạo Users (mật khẩu mặc định: "password123")
  // =============================================
  const hashedPassword = await bcrypt.hash("password123", 12);

  const [ownerUser, managerUser, staffUser] = await Promise.all([
    prisma.user.create({
      data: {
        full_name: "Nguyễn Văn Owner",
        username: "owner",
        email: "owner@wms.com",
        password_hash: hashedPassword,
        role_id: ownerRole.id,
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        full_name: "Trần Thị Manager",
        username: "manager",
        email: "manager@wms.com",
        password_hash: hashedPassword,
        role_id: managerRole.id,
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        full_name: "Lê Văn Staff",
        username: "staff",
        email: "staff@wms.com",
        password_hash: hashedPassword,
        role_id: staffRole.id,
        status: "ACTIVE",
      },
    }),
  ]);
  console.log("✅ Tạo Users:", { ownerUser, managerUser, staffUser });

  // =============================================
  // Phân công Kho (Manager → KhoA + KhoB, Staff → KhoA)
  // =============================================
  await Promise.all([
    prisma.userWarehouse.create({ data: { user_id: managerUser.id, warehouse_id: warehouseA.id } }),
    prisma.userWarehouse.create({ data: { user_id: managerUser.id, warehouse_id: warehouseB.id } }),
    prisma.userWarehouse.create({ data: { user_id: staffUser.id, warehouse_id: warehouseA.id } }),
  ]);
  console.log("✅ Phân công kho cho Manager và Staff.");

  console.log("\n🎉 Seed hoàn tất! Thông tin đăng nhập:");
  console.log("   👑 Owner   → username: owner   | password: password123");
  console.log("   📋 Manager → username: manager | password: password123 | Kho: Hà Nội, HCM");
  console.log("   👷 Staff   → username: staff   | password: password123 | Kho: Hà Nội");
}

seed()
  .catch((e) => {
    console.error("❌ Seed thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await DatabaseClient.disconnect();
  });
