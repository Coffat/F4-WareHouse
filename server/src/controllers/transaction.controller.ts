import { Request, Response, NextFunction } from "express";
import { inboundTransactionService } from "../services/transaction/inbound.service";
import { TransactionServiceContext } from "../services/transaction/transaction.strategy";
import { OutboundStrategy } from "../services/transaction/outbound.strategy";
import { RoleName } from "../types/auth.types";

export class TransactionController {
  public async handleInboundTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Chưa xác thực." });
        return;
      }

      const { supplierId, warehouseId, notes, items } = req.body;

      if (!warehouseId || !items || !Array.isArray(items)) {
         res.status(400).json({ success: false, message: "Dữ liệu payload không hợp lệ." });
         return;
      }

      // Proxy Pattern (RBAC): Kiểm tra quyền hạn Warehouse từ Body
      if (user.role !== RoleName.OWNER) {
        const hasAccess = user.assignedWarehouses.includes(Number(warehouseId));
        if (!hasAccess) {
          res.status(403).json({
            success: false,
            message: `Bạn không có quyền nhập hàng vào kho #${warehouseId}.`
          });
          return;
        }
      }

      // Gọi service
      const transaction = await inboundTransactionService.handleInboundTransaction(
        user.userId,
        supplierId,
        warehouseId,
        notes,
        items
      );

      res.status(201).json({
        success: true,
        data: transaction,
        message: "Phiếu nhập kho đã hoàn tất thành công.",
      });
    } catch (error: any) {
      if (error.statusCode === 400 && error.details) {
         res.status(400).json({
           success: false,
           message: error.message,
           errors: error.details,
         });
         return;
      }
      next(error);
    }
  }

  public async handleOutboundTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: "Chưa xác thực." });
        return;
      }

      const { customerId, warehouseId, notes, items } = req.body;

      if (!warehouseId || !items || !Array.isArray(items)) {
         res.status(400).json({ success: false, message: "Dữ liệu payload không hợp lệ." });
         return;
      }

      // Proxy Pattern (RBAC): Kiểm tra quyền hạn Warehouse từ Body
      if (user.role !== RoleName.OWNER) {
        const hasAccess = user.assignedWarehouses.includes(Number(warehouseId));
        if (!hasAccess) {
          res.status(403).json({
            success: false,
            message: `Bạn không có quyền xuất hàng từ kho #${warehouseId}.`
          });
          return;
        }
      }

      // Sử dụng Strategy Pattern
      const outboundStrategy = new OutboundStrategy();
      const transactionContext = new TransactionServiceContext(outboundStrategy);
      const transaction = await transactionContext.executeStrategy({
         userId: user.userId,
         customerId,
         warehouseId,
         notes,
         items,
      });

      res.status(201).json({
        success: true,
        data: transaction,
        message: "Phiếu xuất kho đã hoàn tất thành công.",
      });
    } catch (error: any) {
      if (error.statusCode === 400 && error.details) {
         res.status(400).json({
           success: false,
           message: error.message,
           errors: error.details,
         });
         return;
      }
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
