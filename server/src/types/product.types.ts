/**
 * PRODUCT TYPES
 * ==============
 * Định nghĩa tất cả TypeScript interfaces & types cho module Product.
 * Tuân thủ strict mode và Clean Code.
 */

// =============================================
// Enums
// =============================================
export enum ProductCategoryName {
  PHONE = 'Điện thoại',
  LAPTOP = 'Laptop',
  ACCESSORY = 'Phụ kiện',
}

export enum InventoryStatus {
  READY_TO_SELL = 'READY_TO_SELL',
  DEFECTIVE = 'DEFECTIVE',
  IN_TRANSIT = 'IN_TRANSIT',
}

// =============================================
// Specifications (JSON) - Factory Method Output
// =============================================
export interface PhoneSpec {
  display: string;       // Màn hình
  os: string;            // Hệ điều hành
  camera: string;        // Camera
  chip: string;          // Chip / CPU
  ram: string;           // RAM
  battery: string;       // Pin
  storage?: string;
}

export interface LaptopSpec {
  cpu: string;           // CPU
  ram: string;           // RAM
  storage: string;       // Ổ cứng
  vga: string;           // VGA / GPU
  ports: string;         // Cổng kết nối
  display?: string;
}

export interface AccessorySpec {
  type: string;          // Loại phụ kiện
  compatibility: string; // Thiết bị tương thích
  color?: string;
  material?: string;
  battery?: string;
}

export type ProductSpecifications = PhoneSpec | LaptopSpec | AccessorySpec;

// =============================================
// DTOs - Request / Response
// =============================================
export interface CreateProductDto {
  name: string;
  sku: string;
  category_id: number;
  supplier_id?: number;
  image_url?: string;
  specifications: ProductSpecifications;
  /** Kho sẽ khởi tạo bản ghi Inventory ban đầu */
  warehouse_id: number;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  category_id?: number;
  supplier_id?: number;
  image_url?: string;
  specifications?: Partial<ProductSpecifications>;
}

export interface ProductQueryDto {
  category_id?: number;
  warehouse_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// =============================================
// Response Shape
// =============================================
export interface ProductWithInventory {
  id: number;
  name: string;
  sku: string;
  image_url: string | null;
  specifications: ProductSpecifications | null;
  created_at: Date;
  category: {
    id: number;
    name: string;
  } | null;
  supplier: {
    id: number;
    company_name: string;
  } | null;
  inventory: Array<{
    id: number;
    warehouse_id: number | null;
    quantity: number;
    status: string;
  }>;
}

export interface CategoryStatsDto {
  category_name: string;
  category_id: number;
  product_count: number;
  total_quantity: number;
  sold_count: number;
}

export interface ProductStatsDto {
  phones: CategoryStatsDto;
  laptops: CategoryStatsDto;
  accessories: CategoryStatsDto;
  total_products: number;
  total_quantity: number;
}

// =============================================
// Factory output type
// =============================================
export interface ProductTemplate {
  categoryName: ProductCategoryName;
  defaultSpecifications: ProductSpecifications;
  requiredFields: string[];
}
