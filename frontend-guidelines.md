# FE Skill Profile: Antigravity - Claymorphism Architect

## 1. Core Tech Stack (2026 Standards)

* **Framework:** React 19+ (Vite) với kiến trúc Functional Components và Hooks.
* **Language:** TypeScript (Strict mode) để quản lý chặt chẽ các thực thể Sản phẩm (Phones, Laptops)^^^^^^.
* **Styling:** Tailwind CSS 4.0+ kết hợp với Custom CSS Variables cho hiệu ứng 3D.
* **State Management:** Zustand (ưu tiên vì nhẹ và nhanh cho việc chuyển đổi kho hàng).
* **Visualization:** Recharts (để vẽ biểu đồ Sức khỏe kho hàng với cột bo tròn)^^.

## 2. Design System: The "Stitch" Protocol

Mọi component do Antigravity tạo ra phải tuân thủ nghiêm ngặt bộ nhận diện thương hiệu sau:

### A. Visual Tokens

* **Palette (Candy Pastels):** * `Background`: Cream (#FDFBF7).
  * `Primary`: Mint Clay (#B2F2BB) - Cho nút Nhập kho, Thành công.
  * `Secondary`: Lilac Clay (#E0C3FC) - Cho Luân chuyển, Phụ kiện.
  * `<span class="citation-235">Accent</span>`: Pink Clay (#FFD1DC) - Cho Hàng đang về, Cảnh báo^^.
* **Geometry:** `border-radius` tối thiểu là `32px` cho Card và `full` cho Pill-shaped buttons.

### B. The Claymorphism Formula

Sử dụng công thức đổ bóng kép (Dual-shadow) để tạo độ phồng:

* **Outer Shadow:** Tạo cảm giác nổi (`12px 12px 24px #e0ddd7, -12px -12px 24px #ffffff`).
* **Inner Shadow:** Tạo độ dày vật liệu (`inset 8px 8px 12px rgba(255,255,255,0.5), inset -8px -8px 12px rgba(0,0,0,0.05)`).
* **Interaction:** Hiệu ứng `Squishy Press` - Khi click sử dụng `scale-95` và thay đổi bóng đổ vào trong.

## 3. UI Patterns & Layout

* **Bento Grid:** Sắp xếp Dashboard thành các ô vuông/chữ nhật bo tròn, không chồng chéo, có khoảng cách (gap) lớn (tối thiểu `gap-6`).
* **Micro-interactions:** * Các icon sản phẩm (Điện thoại, Laptop) phải có chuyển động `<span class="citation-234">floating</span>` (trôi nổi) nhẹ nhàng^^.
  * Thanh tiến độ (Progress Bar) phải bo tròn hai đầu như viên kẹo dẻo.

## 4. Business Logic Integration (FE)

* **Product Handling:** Hiển thị thông số kỹ thuật (RAM, CPU, GPU) từ trường JSON bằng các thẻ tag bong bóng^^^^^^^^.
* **IMEI Management:** * Giao diện quét mã vạch phải hỗ trợ chế độ nhập liên tục (Continuous Input).
  * **Tích hợp tính năng Import Excel/CSV với thanh tiến độ xử lý dữ liệu trực quan**^^.
* **Multi-warehouse UI:** Bộ chọn kho (Warehouse Selector) phải thay đổi toàn bộ ngữ cảnh dữ liệu trên Dashboard ngay lập tức mà không cần load lại trang^^.
* **RBAC UI:** Ẩn/Hiện các nút hành động (Duyệt phiếu, Xóa kho) dựa trên vai trò Owner, Manager, hoặc Staff^^.

## 5. Coding Standards

* **Clean Code:** Phân tách rõ ràng Logic (Hooks) và Giao diện (Components).
* **Accessibility:** Đảm bảo độ tương phản màu sắc dù sử dụng tone Pastel để người dùng không bị mỏi mắt.
* **Performance:** Tối ưu hóa việc render danh sách IMEI lớn bằng Virtual Scrolling nếu cần thiết.
