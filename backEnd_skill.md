# BE Skill Profile: Antigravity - Design Pattern Architect

## 1. Core Tech Stack (Node.js 2026)

* **Runtime:** Node.js (Latest LTS) sử dụng ES Modules.
* **Language:** TypeScript (Strict mode) để định nghĩa chính xác Product Specs (JSON)^^.
* **ORM:** Prisma hoặc Sequelize cho giao tiếp Database^^.

## 2. The Elite 9 Design Patterns (Warehouse Context)

Antigravity phải áp dụng các pattern này vào logic nghiệp vụ của  **F4 Warehouse** :

* **Singleton + Factory:**
  * **Singleton:** Đảm bảo chỉ có một thực thể `DatabaseConnection` hoặc `AppConfig` duy nhất.
  * **Factory Method:** Tạo các đối tượng Sản phẩm (Phone, Laptop, Accessory) dựa trên `<span class="citation-306">Category_ID</span>`^^^^^^^^.
* **Builder:** Sử dụng để khởi tạo các `<span class="citation-305">Transaction</span>` (Phiếu giao dịch) phức tạp với nhiều dòng `<span class="citation-305">Transaction_Detail</span>` và danh sách IMEI đi kèm^^^^^^^^.
* **Strategy:** Định nghĩa các chiến lược tính giá (FIFO, LIFO, Weighted Average) hoặc các phương thức xuất file báo cáo (Excel, PDF, CSV)^^.
* **Observer:** Khi một `<span class="citation-303">Transaction</span>` hoàn tất, hệ thống tự động thông báo cho bộ phận Kế toán và cập nhật lại số lượng trong `<span class="citation-303">Inventory</span>`^^^^^^^^.
* **Decorator:** Bổ sung các tính năng như "Ghi Log chi tiết" hoặc "Kiểm tra bảo mật bổ sung" vào các hàm xử lý giao dịch mà không làm thay đổi code gốc.
* **Facade + Adapter:**
  * **Facade:** Cung cấp một Interface đơn giản (ví dụ: `<span class="citation-302">InboundService.process()</span>`) để che giấu các bước phức tạp bên trong (tạo phiếu, lưu IMEI, cập nhật tồn kho)^^.
  * **Adapter:** Chuyển đổi dữ liệu từ các API bên thứ ba (như đơn vị vận chuyển) về định dạng chuẩn của hệ thống F4.
* **Proxy:** Thực hiện **Role-Based Access Control (RBAC)**^^. **Kiểm tra quyền của User (Owner, Manager, Staff) trước khi cho phép truy cập vào dữ liệu kho cụ thể**^^^^^^^^.
* **Template Method + State:**
  * **Template Method:** Định nghĩa khung quy trình "Xử lý đơn hàng" cố định, nhưng cho phép các subclass thay đổi cách kiểm tra lỗi cho từng loại kho khác nhau.
  * **State:** Quản lý trạng thái của `<span class="citation-299">Transaction</span>` (Draft -> Pending -> Completed -> Cancelled) và trạng thái hàng hóa (Ready, Defective, In Transit)^^^^^^^^.
* **Command:** Encapsulate các yêu cầu điều chuyển kho (Stock Transfer) thành các đối tượng, cho phép thực hiện tính năng **Undo/Redo** khi nhân viên nhập sai^^.

## 3. Bonus Advanced Patterns (From "Dive Into Design Patterns")

* **Chain of Responsibility:** Cực kỳ hữu ích cho việc  **Validation IMEI** . **Lô hàng nhập vào sẽ đi qua một chuỗi các bước kiểm tra: Đúng định dạng -> Không trùng trong file -> Không trùng trong DB**^^.
* **Mediator:** Giảm sự phụ thuộc lẫn nhau giữa `InventoryService`, `UserService`, và `NotificationService`. Mọi liên lạc sẽ đi qua một Trung gian (Mediator).
* **Composite:** Quản lý danh mục sản phẩm (Category) theo dạng cây, giúp xử lý các danh mục đa cấp (Ví dụ: Phụ kiện -> Ốp lưng -> Ốp lưng iPhone)^^.

---

## 4. Elite Combinations (The "Wow" Factor)

Antigravity cần biết cách kết hợp các pattern để xử lý các bài toán khó:

> ### 🚀 Siêu Logic: Command + Observer + Memento
>
> Khi thực hiện một đợt "Kiểm kê kho" (Audit), mỗi thao tác điều chỉnh số lượng sẽ được gói trong một  **Command** . **Nếu có sai sót, ****Memento** sẽ giúp khôi phục trạng thái kho (`<span class="citation-295">Inventory</span>`) về thời điểm trước đó, đồng thời **Observer** sẽ gửi cảnh báo đến Owner^^^^^^^^.

> ### 📦 Siêu Logic: Facade + Builder + Strategy
>
> **Một hàm **`<span class="citation-294">createBulkImport()</span>` (Facade) sẽ sử dụng **Builder** để dựng lên phiếu nhập hàng nghìn IMEI từ file Excel, đồng thời gọi các **Strategy** khác nhau để kiểm tra quy tắc nhập hàng tùy theo nhà cung cấp (Supplier)^^^^^^^^.

:

### thông tin các cổng (Ports):

* **Frontend** : [http://localhost:80](http://localhost/)
* **Backend API** : [http://localhost:3000](http://localhost:3000/)
* **Database (MySQL)** : `localhost:3306` (User: `user`, Pass: `password`, DB: `wms_db`)
