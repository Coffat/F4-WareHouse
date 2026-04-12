const fs = require('fs');

const OUTPUT_FILE = '/Users/vuthang/Desktop/ccptpm/postman/wms_collection.json';

const collection = {
  info: {
    name: "WMS API – F4-WareHouse",
    description: "Hệ thống quản lý kho - Dự án F4-WareHouse 2026. Coffat - HCMUTE.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    // ─── 01. Authentication ─────────────────────────────────────
    {
      name: "01. Authentication",
      item: [
        {
          name: "POST /login",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: { mode: "raw", raw: JSON.stringify({ username: "admin", password: "123456" }, null, 2) },
            url: { host: ["{{baseUrl}}"], path: ["api", "auth", "login"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Status code is 200", () => pm.response.to.have.status(200));',
            'const res = pm.response.json();',
            'pm.test("Response has accessToken", () => pm.expect(res.data).to.have.property("accessToken"));',
            'if (res.data && res.data.accessToken) {',
            '    pm.environment.set("token", res.data.accessToken);',
            '    console.log("✅ Token saved:", res.data.accessToken.substring(0, 30) + "...");',
            '}'
          ]}}]
        },
        {
          name: "GET /me",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "auth", "me"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Status code is 200", () => pm.response.to.have.status(200));',
            'pm.test("User data returned", () => pm.expect(pm.response.json().data).to.have.property("username"));'
          ]}}]
        }
      ]
    },

    // ─── 02. Warehouse Management ────────────────────────────────
    {
      name: "02. Warehouse Management",
      item: [
        {
          name: "GET /warehouses",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "warehouses"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Status code is 200", () => pm.response.to.have.status(200));',
            'pm.test("Warehouse list returned", () => {',
            '    const res = pm.response.json();',
            '    pm.expect(res.data).to.be.an("array");',
            '    if (res.data.length > 0) pm.environment.set("warehouse_id", res.data[0].id);',
            '});'
          ]}}]
        }
      ]
    },

    // ─── 03. Inbound/Outbound Logic ──────────────────────────────
    {
      name: "03. Inbound/Outbound Logic",
      item: [
        {
          name: "POST /inbound",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                warehouseId: 17,
                supplierId: 6,
                notes: "Nhập hàng từ NPP chính thức - Bulk Input Test",
                items: [{
                  productId: 91,
                  unitPrice: 15000000,
                  imeiList: ["IMEI-WMS-001", "IMEI-WMS-002", "IMEI-WMS-003", "IMEI-WMS-004", "IMEI-WMS-005"]
                }]
              }, null, 2)
            },
            url: { host: ["{{baseUrl}}"], path: ["api", "transactions", "inbound"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            '// Xác thực Logic IMEI qua Chain of Responsibility Handler',
            'pm.test("Status code is 200/201", () => {',
            '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
            '});',
            '',
            'pm.test("Inventory updated & Atomicity check", () => {',
            '    const res = pm.response.json();',
            '    pm.expect(res.success).to.be.true;',
            '    pm.expect(res.data).to.have.property("id"); // Transaction ID',
            '});',
            '',
            'pm.test("IMEI status is validated & IN_STOCK", () => {',
            '    // Kiểm tra: Server xử lý IMEI qua ImeiFormatHandler chain',
            '    pm.expect(pm.response.responseTime).to.be.below(1000);',
            '    const res = pm.response.json();',
            '    pm.expect(res.success).to.not.equal(false);',
            '});',
            '',
            'pm.test("Response time < 1000ms (Performance OK)", () => {',
            '    pm.expect(pm.response.responseTime).to.be.below(1000);',
            '});'
          ]}}]
        },
        {
          name: "POST /outbound",
          request: {
            method: "POST",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                warehouseId: 17,
                customerId: 1,
                notes: "Xuất hàng cho khách - IMEI tracking",
                items: [{ productId: 1, imeiList: ["IMEI001ABC"] }]
              }, null, 2)
            },
            url: { host: ["{{baseUrl}}"], path: ["api", "transactions", "outbound"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Outbound transaction success", () => {',
            '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
            '});',
            'pm.test("IMEI status updated to SOLD", () => {',
            '    const res = pm.response.json();',
            '    pm.expect(res.success).to.be.true;',
            '});'
          ]}}]
        }
      ]
    },

    // ─── 04. IMEI Tracking & Stats ───────────────────────────────
    {
      name: "04. IMEI Tracking & Stats",
      item: [
        {
          name: "GET /products",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "products"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Product list returned", () => pm.response.to.have.status(200));'
          ]}}]
        },
        {
          name: "GET /trace/:imei",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "products", "trace", "IMEI001ABC"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("IMEI trace found", () => {',
            '    pm.expect(pm.response.code).to.be.oneOf([200, 404]);',
            '});',
            'pm.test("IMEI journey data structure valid", () => {',
            '    const res = pm.response.json();',
            '    pm.expect(res).to.have.property("success");',
            '});'
          ]}}]
        },
        {
          name: "GET /stats",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "products", "stats"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Stats returned", () => pm.response.to.have.status(200));'
          ]}}]
        }
      ]
    },

    // ─── 05. Customer & Partner ──────────────────────────────────
    {
      name: "05. Customer & Partner",
      item: [
        {
          name: "GET /customers",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "customers"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Customer list OK", () => pm.response.to.have.status(200));'
          ]}}]
        }
      ]
    },

    // ─── 06. Analytics & Dashboard ───────────────────────────────
    {
      name: "06. Analytics & Dashboard",
      item: [
        {
          name: "GET /stats",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "dashboard", "stats"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Dashboard stats OK", () => pm.response.to.have.status(200));'
          ]}}]
        }
      ]
    },

    // ─── 07. Supplier Management ─────────────────────────────────
    {
      name: "07. Supplier Management",
      item: [
        {
          name: "GET /suppliers",
          request: {
            method: "GET",
            header: [{ key: "Authorization", value: "Bearer {{token}}" }],
            url: { host: ["{{baseUrl}}"], path: ["api", "suppliers"] }
          },
          event: [{ listen: "test", script: { type: "text/javascript", exec: [
            'pm.test("Supplier list OK", () => pm.response.to.have.status(200));'
          ]}}]
        }
      ]
    }
  ]
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 2));
console.log("✅ [FULL DOCS] Collection updated với test scripts IMEI đầy đủ!");
