/**
 * PRODUCT CONTROLLER - PRESENTATION LAYER
 * ==========================================
 * Controller chỉ xử lý HTTP: nhận request, validate input,
 * gọi service, và trả về response chuẩn.
 * Không chứa business logic.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  productService,
  ProductNotFoundError,
  DuplicateSkuError,
  InvalidCategoryError,
  InvalidWarehouseError,
  SpecificationValidationError,
} from '../services/product.service';
import { JwtPayload } from '../types/auth.types';
import { getAccessibleWarehouseIds } from '../middlewares/auth.middleware';

// =============================================
// Zod Schemas - Input Validation
// =============================================
const createProductSchema = z.object({
  name: z.string({ required_error: 'Tên sản phẩm là bắt buộc' }).min(1, 'Tên sản phẩm không được trống'),
  sku: z.string({ required_error: 'SKU là bắt buộc' }).min(1, 'SKU không được trống'),
  category_id: z.number({ required_error: 'Danh mục là bắt buộc' }).int().positive(),
  image_url: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
  specifications: z.record(z.unknown(), { required_error: 'Thông số kỹ thuật là bắt buộc' }),
  // warehouse_id và supplier_id đã được loại bỏ: 
  // - Đăng ký Model là Master Data (Facade tự động khởi tạo Inventory).
  // - Nhà cung cấp sẽ được gắn ở bước Nhập kho (Inbound).
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  category_id: z.number().int().positive().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  specifications: z.record(z.unknown()).optional(),
});

const querySchema = z.object({
  category_id: z.coerce.number().int().positive().optional(),
  warehouse_id: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================
// Product Controller
// =============================================
class ProductController {
  /**
   * GET /api/products
   * Lấy danh sách sản phẩm có filter theo category, kho, từ khóa.
   */
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as JwtPayload;
      const accessibleWarehouses = getAccessibleWarehouseIds(user);

      const queryResult = querySchema.safeParse(req.query);
      if (!queryResult.success) {
        res.status(400).json({
          success: false,
          message: 'Tham số query không hợp lệ',
          errors: queryResult.error.flatten().fieldErrors,
        });
        return;
      }

      const query = queryResult.data;

      // C1 Fix: Enforce warehouse isolation cho Staff/Manager
      // - Owner (accessibleWarehouses = undefined) → lấy tất cả
      // - Staff/Manager không chỉ định warehouse → auto-filter theo kho được phân công đầu tiên
      // - Staff/Manager chỉ định warehouse cụ thể → đã được kiểm tra bơi authorizeWarehouseAccess()
      if (accessibleWarehouses && !query.warehouse_id) {
        // Lấy kho đầu tiên được phân công nếu user không chỉ định cụ thể
        query.warehouse_id = accessibleWarehouses[0];
      }

      const result = await productService.getProducts(query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/stats
   * Lấy thống kê sản phẩm theo danh mục (cho Dashboard & Stats Cards).
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouseId = req.query['warehouse_id']
        ? parseInt(req.query['warehouse_id'] as string, 10)
        : undefined;

      const stats = await productService.getProductStats(warehouseId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/form-options
   * Lấy danh sách categories, suppliers, warehouses cho form dropdown.
   */
  async getFormOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = await productService.getFormOptions();
      res.status(200).json({ success: true, data: options });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Lấy chi tiết sản phẩm.
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']!, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        return;
      }

      const product = await productService.getProductById(id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/products
   * Tạo sản phẩm mới (qua ProductFacade).
   * Chỉ Owner và Manager được phép.
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validationResult = createProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const product = await productService.createProduct(validationResult.data as any);

      res.status(201).json({
        success: true,
        message: `✦ Thêm sản phẩm "${product.name}" thành công!`,
        data: product,
      });
    } catch (error) {
      if (error instanceof DuplicateSkuError) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof InvalidCategoryError) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof InvalidWarehouseError) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      if (error instanceof SpecificationValidationError) {
        res.status(422).json({
          success: false,
          message: error.message,
          errors: error.validationErrors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Cập nhật sản phẩm.
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']!, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        return;
      }

      const validationResult = updateProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const product = await productService.updateProduct(id, validationResult.data as any);
      res.status(200).json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: product,
      });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   * Xóa sản phẩm. Chỉ Owner và Manager.
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params['id']!, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        return;
      }

      await productService.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: `Đã xóa sản phẩm #${id} thành công`,
      });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

// Export singleton instance
export const productController = new ProductController();
