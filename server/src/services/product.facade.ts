/**
 * PRODUCT FACADE - FACADE PATTERN
 * =================================
 * Facade Pattern: Cung cấp một interface đơn giản để tạo sản phẩm mới,
 * che giấu sự phức tạp của nhiều bước bên trong:
 *
 * 1. Validate category_id → lấy tên category (+ tra cứu parent nếu là subcategory)
 * 2. Dùng ProductFactory tạo template + validate cấu trúc spec (Strategy)
 * 3. Kiểm tra SKU duplicate
 * 4. Lưu sản phẩm vào bảng `products`
 * 5. Khởi tạo bản ghi `inventory` ban đầu tại kho được chọn (quantity = 0)
 *
 * Client chỉ cần gọi: `productFacade.createProduct(dto)` — không cần biết gì thêm.
 */

import { prisma } from '../config/database';
import { productRepository } from '../repositories/product.repository';
import { ProductFactory } from './product.factory';
import { SpecificationValidatorContext } from './product.validator';
import { CreateProductDto, ProductWithInventory } from '../types/product.types';

// =============================================
// Custom Errors dành riêng cho Product module
// =============================================
export class DuplicateSkuError extends Error {
  constructor(sku: string) {
    super(`Mã SKU "${sku}" đã tồn tại trong hệ thống. Vui lòng chọn mã SKU khác.`);
    this.name = 'DuplicateSkuError';
  }
}

export class InvalidCategoryError extends Error {
  constructor(categoryId: number) {
    super(`Danh mục với ID #${categoryId} không tồn tại.`);
    this.name = 'InvalidCategoryError';
  }
}

export class InvalidWarehouseError extends Error {
  constructor(warehouseId: number) {
    super(`Kho với ID #${warehouseId} không tồn tại.`);
    this.name = 'InvalidWarehouseError';
  }
}

export class SpecificationValidationError extends Error {
  public readonly validationErrors: string[];
  constructor(errors: string[]) {
    super(`Thông số kỹ thuật không hợp lệ: ${errors.join('; ')}`);
    this.name = 'SpecificationValidationError';
    this.validationErrors = errors;
  }
}

// =============================================
// Product Facade
// =============================================
class ProductFacade {
  /**
   * ⭐ Hàm FACADE chính: Tạo sản phẩm hoàn chỉnh
   *
   * Orchestrates:
   * - Factory Method → xác định loại sản phẩm (tự tra cứu parent nếu là subcategory)
   * - Strategy Pattern → validate spec theo category
   * - Repository → lưu Product + Inventory
   */
  async createProduct(dto: CreateProductDto): Promise<ProductWithInventory> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏗️ [Facade] createProduct() initiated for SKU: ${dto.sku}`);
    }

    // ── Bước 1: Validate category tồn tại trong DB ──
    const category = await prisma.category.findUnique({
      where: { id: dto.category_id },
      select: { id: true, name: true, parent_id: true },
    });

    if (!category) {
      throw new InvalidCategoryError(dto.category_id);
    }

    // ── Bước 2: Validate warehouse tồn tại ──
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: dto.warehouse_id },
      select: { id: true, name: true },
    });

    if (!warehouse) {
      throw new InvalidWarehouseError(dto.warehouse_id);
    }

    // ── Bước 3: H1 Fix — Dùng Factory để lấy required fields ──
    // Nếu category không có trong Factory (là subcategory), tra cứu parent_id để tìm Strategy cha
    let effectiveCategoryName = category.name;
    const supportedCategories = ProductFactory.getSupportedCategories();

    if (!supportedCategories.includes(category.name) && category.parent_id !== null) {
      // Đây là subcategory → tra cứu category cha
      const parentCategory = await prisma.category.findUnique({
        where: { id: category.parent_id },
        select: { id: true, name: true },
      });

      if (parentCategory && supportedCategories.includes(parentCategory.name)) {
        effectiveCategoryName = parentCategory.name;
        if (process.env.NODE_ENV === 'development') {
          console.log(`   🔍 Step 3: Subcategory "${category.name}" → resolved to parent Strategy "${parentCategory.name}"`);
        }
      } else {
        // Không tìm thấy Strategy cho cả category con lẫn cha → lỗi rõ ràng
        throw new InvalidCategoryError(dto.category_id);
      }
    }

    // Tạo Factory template với effectiveCategoryName
    let _template;
    try {
      _template = ProductFactory.createByName(effectiveCategoryName);
    } catch (_err) {
      // Category chưa có trong Factory (cả parent cũng không hỗ trợ)
      if (process.env.NODE_ENV === 'development') {
        console.log(`   ⚠️ Step 3: No Factory template for "${effectiveCategoryName}", skipping spec validation`);
      }
    }

    // ── Bước 4: Dùng Strategy để validate specifications JSON ──
    try {
      const validator = new SpecificationValidatorContext(effectiveCategoryName);
      const validationResult = validator.validate(dto.specifications);

      if (!validationResult.isValid) {
        throw new SpecificationValidationError(validationResult.errors);
      }
    } catch (err) {
      if (err instanceof SpecificationValidationError) throw err;
      // Không có strategy → bỏ qua validation (category chưa được định nghĩa)
    }

    // ── Bước 5: Kiểm tra SKU duplicate ──
    const existingProduct = await productRepository.findBySku(dto.sku);
    if (existingProduct) {
      throw new DuplicateSkuError(dto.sku);
    }

    // ── Bước 6: Lưu sản phẩm vào DB ──
    const newProduct = await productRepository.create({
      name: dto.name,
      sku: dto.sku,
      category_id: dto.category_id,
      supplier_id: dto.supplier_id,
      image_url: dto.image_url,
      specifications: dto.specifications,
    });

    // ── Bước 7: Khởi tạo bản ghi Inventory ban đầu ──
    await productRepository.createInitialInventory(newProduct.id, dto.warehouse_id);

    // ── Bước 8: Lấy sản phẩm hoàn chỉnh để trả về ──
    const created = await productRepository.findById(newProduct.id);

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎉 [Facade] createProduct() DONE: "${newProduct.name}"`);
    }

    return created!;
  }
}

// Export singleton instance của Facade
export const productFacade = new ProductFacade();
