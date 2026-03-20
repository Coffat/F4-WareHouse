import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { transactionController } from "../controllers/transaction.controller";

const router = Router();

// Endpoint POST /api/transactions/inbound
// Sử dụng authenticateToken, sau đó controller sẽ đóng vai trò Proxy kiểm tra quyền truy cập warehouse (từ body).
router.post("/inbound", authenticateToken, transactionController.handleInboundTransaction);

// Endpoint POST /api/transactions/outbound
router.post("/outbound", authenticateToken, transactionController.handleOutboundTransaction);

export default router;
