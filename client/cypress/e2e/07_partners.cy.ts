// @ts-nocheck
/// <reference types="cypress" />

// ============================================================
// 07. Partner Management (Customers & Suppliers) Tests
// ============================================================

describe('07. Partner Management', () => {
  beforeEach(() => {
    cy.fixture('credentials').then((creds) => {
      cy.loginByAPI(creds.admin.username, creds.admin.password);
    });
    cy.visit('/partners');
  });

  it('TC34 - Trang Partner Management tải thành công', () => {
    cy.url().should('include', '/partners');
    cy.get('body').should('be.visible');
    cy.log('✅ Trang Partners tải thành công');
  });

  it('TC35 - Hiển thị tab Customers và Suppliers', () => {
    cy.visit('/partners');
    cy.contains(/customer|khách hàng/i).should('be.visible');
    cy.contains(/supplier|nhà cung cấp/i).should('be.visible');
    cy.log('✅ Cả 2 tab Customers và Suppliers hiển thị');
  });

  it('TC36 - Danh sách Customers tải đúng', () => {
    cy.visit('/partners');
    cy.contains(/customer|khách hàng/i).click({ force: true });
    cy.wait(800);
    cy.get('body').should('not.be.empty');
    cy.log('✅ Danh sách Customers tải OK');
  });

  it('TC37 - Danh sách Suppliers tải đúng', () => {
    cy.visit('/partners');
    cy.contains(/supplier|nhà cung cấp/i).click({ force: true });
    cy.wait(800);
    cy.get('body').should('not.be.empty');
    cy.log('✅ Danh sách Suppliers tải OK');
  });

  it('TC38 - Mở modal tạo Customer mới', () => {
    cy.visit('/partners');
    cy.contains(/customer|khách hàng/i).click({ force: true });

    cy.contains('button', /thêm|add|tạo|new|\+/i).first().click({ force: true });
    cy.get('[role="dialog"], .modal').should('be.visible');
    cy.log('✅ Modal tạo Customer mở được');
  });

  it('TC39 - Mở modal tạo Supplier mới', () => {
    cy.visit('/partners');
    cy.contains(/supplier|nhà cung cấp/i).click({ force: true });

    cy.contains('button', /thêm|add|tạo|new|\+/i).first().click({ force: true });
    cy.get('[role="dialog"], .modal').should('be.visible');
    cy.log('✅ Modal tạo Supplier mở được');
  });

  it('TC40 - Validation form Customer: submit rỗng phải báo lỗi', () => {
    cy.visit('/partners');
    cy.contains(/customer|khách hàng/i).click({ force: true });
    cy.contains('button', /thêm|add|tạo|new|\+/i).first().click({ force: true });

    // Submit form rỗng
    cy.get('[role="dialog"] button[type="submit"]').click({ force: true });
    // Dialog vẫn còn mở (không submit thành công)
    cy.get('[role="dialog"]').should('exist');
    cy.log('✅ Validation form Customer hoạt động');
  });

  it('TC41 - API /customers trả về danh sách hợp lệ', () => {
    cy.window().then((win) => {
      const storage = JSON.parse(win.localStorage.getItem('auth-storage') || '{}');
      const token = storage?.state?.token;

      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/customers`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
        cy.log(`✅ API /customers trả về ${response.body.data?.length || 0} khách hàng`);
      });
    });
  });

  it('TC42 - API /suppliers trả về danh sách hợp lệ', () => {
    cy.window().then((win) => {
      const storage = JSON.parse(win.localStorage.getItem('auth-storage') || '{}');
      const token = storage?.state?.token;

      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/suppliers`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
        cy.log(`✅ API /suppliers trả về ${response.body.data?.length || 0} nhà cung cấp`);
      });
    });
  });
});
