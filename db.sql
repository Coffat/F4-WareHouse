-- =========================================================================
-- 1. NHÓM QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN (USERS & ROLES) [cite: 31]
-- =========================================================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Ví dụ: Owner, Manager, Warehouse Staff [cite: 33]
    description VARCHAR(255)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL, -- [cite: 34]
    email VARCHAR(100) UNIQUE NOT NULL, -- [cite: 34]
    password_hash VARCHAR(255) NOT NULL, -- Mật khẩu đã mã hóa [cite: 34]
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') DEFAULT 'ACTIVE', -- [cite: 34]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- =========================================================================
-- 2. NHÓM QUẢN LÝ KHO BÃI (WAREHOUSE) [cite: 43]
-- =========================================================================

CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Tên kho [cite: 45]
    address TEXT, -- Địa chỉ [cite: 45]
    capacity INT -- Sức chứa [cite: 45]
);

-- Bảng trung gian: Phân công nhân sự làm việc tại kho [cite: 35]
CREATE TABLE user_warehouse (
    user_id INT,
    warehouse_id INT,
    PRIMARY KEY (user_id, warehouse_id), -- Một quản lý có thể quản lý nhiều kho, một kho có nhiều nhân viên [cite: 36]
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- =========================================================================
-- 3. NHÓM QUẢN LÝ HÀNG HÓA (PRODUCTS & CATEGORIES) [cite: 37]
-- =========================================================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Điện thoại, Laptop, Phụ kiện [cite: 39]
    parent_id INT NULL, -- Hỗ trợ danh mục đa cấp (Ví dụ: Phụ kiện -> Ốp lưng)
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL, -- Tên công ty [cite: 40]
    phone VARCHAR(20), -- Số điện thoại [cite: 40]
    address TEXT, -- Địa chỉ [cite: 40]
    email VARCHAR(100)
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    supplier_id INT,
    name VARCHAR(200) NOT NULL, -- Tên sản phẩm [cite: 41]
    sku VARCHAR(100) UNIQUE NOT NULL, -- Mã SKU định danh dòng sản phẩm [cite: 41]
    image_url VARCHAR(255), -- Hình ảnh [cite: 41]
    specifications JSON, -- Trường JSON linh hoạt lưu RAM, CPU, Pin, v.v. [cite: 42]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- =========================================================================
-- 4. NHÓM TỒN KHO & ĐỊNH DANH THIẾT BỊ (INVENTORY & IMEI)
-- =========================================================================

-- Bảng lưu tổng số lượng vật lý theo trạng thái tại từng kho [cite: 46]
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT,
    product_id INT,
    quantity INT DEFAULT 0, -- Sản phẩm X đang có số lượng bao nhiêu [cite: 47]
    status ENUM('READY_TO_SELL', 'DEFECTIVE', 'IN_TRANSIT') DEFAULT 'READY_TO_SELL', -- Sẵn sàng bán, Hỏng hóc, Đang luân chuyển [cite: 47]
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(warehouse_id, product_id, status) -- Ngăn chặn lặp dòng trạng thái cho cùng 1 sản phẩm ở 1 kho
);

-- BẢNG BỔ SUNG: Quản lý chi tiết từng máy (IMEI/Serial)
CREATE TABLE product_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    warehouse_id INT,
    imei_serial VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('IN_STOCK', 'SOLD', 'WARRANTY', 'DEFECTIVE') DEFAULT 'IN_STOCK',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- =========================================================================
-- 5. NHÓM QUẢN LÝ GIAO DỊCH (TRANSACTIONS) [cite: 48]
-- =========================================================================

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- Mã phiếu (VD: PN001, PX002)
    type ENUM('INBOUND', 'OUTBOUND', 'TRANSFER') NOT NULL, -- Nhập, Xuất, Chuyển [cite: 51]
    status ENUM('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    created_by INT, -- Người tạo phiếu [cite: 51]
    source_warehouse_id INT NULL, -- Kho nguồn (Dùng khi Xuất hoặc Chuyển) [cite: 51]
    dest_warehouse_id INT NULL, -- Kho đích (Dùng khi Nhập hoặc Chuyển) [cite: 51]
    total_amount DECIMAL(15, 2) DEFAULT 0, -- Tổng tiền của toàn bộ hóa đơn [cite: 51]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo [cite: 51]
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (dest_warehouse_id) REFERENCES warehouses(id)
);

-- Chi tiết các dòng sản phẩm trong một phiếu giao dịch [cite: 52]
CREATE TABLE transaction_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    product_id INT,
    quantity INT NOT NULL, -- Số lượng bao nhiêu [cite: 53]
    unit_price DECIMAL(15, 2) NOT NULL, -- Đơn giá lúc đó là bao nhiêu [cite: 53]
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- BẢNG BỔ SUNG: Gắn mã IMEI cụ thể vào từng chi tiết giao dịch
-- Khi nhập hàng hoặc xuất hàng, phải biết chính xác IMEI nào được giao dịch
CREATE TABLE transaction_imei (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_detail_id INT,
    product_item_id INT,
    FOREIGN KEY (transaction_detail_id) REFERENCES transaction_details(id) ON DELETE CASCADE,
    FOREIGN KEY (product_item_id) REFERENCES product_items(id)
);