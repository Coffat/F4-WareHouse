/**
 * PRODUCT MANAGEMENT PAGE
 * ========================
 * Refactored với đầy đủ Design Patterns:
 *
 * - Container/Presenter Pattern (H2): ProductManagementPage (Container) vs ProductManagementView (Presenter)
 * - Compound Component Pattern (S2): Modal.Header / Modal.Body / Modal.Footer
 * - Custom Hooks (S3): useProducts + useProductStats thay vì inline fetching
 * - Zustand State (S1): useWarehouseStore cho Warehouse Selector toàn app
 * - Strategy Pattern: SPEC_FIELDS, mapApiProductToUI
 * - Inner Shadow CSS Guideline (H4): inset 8px 8px 12px rgba(255,255,255,0.5), inset -8px -8px 12px rgba(0,0,0,0.05)
 */

import React, { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, Box, ChevronRight, Headphones, LayoutDashboard, Laptop,
  Package, PackageSearch, Plus, Search, Settings, Smartphone, Truck,
  Warehouse, X, Edit3, Trash2, Filter, ScanLine, Tag, Cpu,
  HardDrive, Battery, Monitor, RefreshCw, AlertCircle, Loader2, ChevronDown
} from 'lucide-react'
import {
  productApiService,
  ApiProduct, ApiProductStats, FormOptions,
  CreateProductPayload,
} from '../services/product.service'
import { useProducts } from '../hooks/useProducts'
import { useProductStats } from '../hooks/useProductStats'
import { useWarehouseStore } from '../store/useWarehouseStore'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CategoryFilter = 'Tất cả' | 'Điện thoại' | 'Laptop' | 'Phụ kiện'
type StockStatus = 'READY_TO_SELL' | 'DEFECTIVE' | 'IN_TRANSIT'

interface ProductSpec {
  [key: string]: string
}

/** UI Product shape (mapped từ ApiProduct) */
interface UIProduct {
  id: number
  name: string
  sku: string
  category: string
  status: StockStatus
  quantity: number
  specs: ProductSpec
  iconType: 'phone' | 'laptop' | 'accessory'
  iconColor: string
  cardBg: string
  categoryId: number | null
  supplierId: number | null
  imageUrl: string | null
}

interface ModalForm {
  name: string
  sku: string
  category_id: number
  supplier_id: number | undefined
  image_url: string
  warehouse_id: number
  specs: ProductSpec
}

interface ModalState {
  open: boolean
  mode: 'add' | 'edit'
  productId: number | null
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function getTotalQuantity(inventory: ApiProduct['inventory']): number {
  return inventory
    .filter((inv) => inv.status === 'READY_TO_SELL')
    .reduce((sum, inv) => sum + inv.quantity, 0)
}

function getPrimaryStatus(inventory: ApiProduct['inventory']): StockStatus {
  if (inventory.length === 0) return 'READY_TO_SELL'
  if (inventory.some((inv) => inv.status === 'READY_TO_SELL')) return 'READY_TO_SELL'
  if (inventory.some((inv) => inv.status === 'IN_TRANSIT')) return 'IN_TRANSIT'
  return 'DEFECTIVE'
}

/** Factory Method Pattern (Frontend): mapApiProductToUI */
function mapApiProductToUI(p: ApiProduct): UIProduct {
  const categoryName = p.category?.name ?? 'Unknown'

  const iconTypeMap: Record<string, UIProduct['iconType']> = {
    'Điện thoại': 'phone',
    'Phone': 'phone',
    'Laptop': 'laptop',
    'Phụ kiện': 'accessory',
    'Accessory': 'accessory',
  }

  const cardBgMap: Record<string, string> = {
    'Điện thoại': 'bg-pink-clay/45',
    'Phone': 'bg-pink-clay/45',
    'Laptop': 'bg-mint-clay/40',
    'Phụ kiện': 'bg-lilac-clay/40',
    'Accessory': 'bg-lilac-clay/40',
  }

  const iconColorMap: Record<string, string> = {
    'Điện thoại': 'text-rose-500',
    'Laptop': 'text-slate-700',
    'Phụ kiện': 'text-violet-600',
  }

  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: categoryName,
    status: getPrimaryStatus(p.inventory),
    quantity: getTotalQuantity(p.inventory),
    specs: (p.specifications as ProductSpec) ?? {},
    iconType: iconTypeMap[categoryName] ?? 'accessory',
    iconColor: iconColorMap[categoryName] ?? 'text-slate-600',
    cardBg: cardBgMap[categoryName] ?? 'bg-sky-clay/40',
    categoryId: p.category?.id ?? null,
    supplierId: p.supplier?.id ?? null,
    imageUrl: p.image_url,
  }
}

// ─────────────────────────────────────────────
// Strategy Pattern (Frontend): Spec field renderers
// ─────────────────────────────────────────────
interface SpecFieldDef {
  key: string
  label: string
  icon: React.ReactNode
  placeholder: string
}

const SPEC_FIELDS: Record<string, SpecFieldDef[]> = {
  'Điện thoại': [
    { key: 'display', label: 'Màn hình', icon: <Monitor className="w-3 h-3" />, placeholder: '6.7\" Super AMOLED' },
    { key: 'os', label: 'Hệ điều hành', icon: <Cpu className="w-3 h-3" />, placeholder: 'Android 14 / iOS 17' },
    { key: 'camera', label: 'Camera', icon: <ScanLine className="w-3 h-3" />, placeholder: '200MP + 10MP + 12MP' },
    { key: 'chip', label: 'Chip / CPU', icon: <Cpu className="w-3 h-3" />, placeholder: 'Snapdragon 8 Gen 3' },
    { key: 'ram', label: 'RAM', icon: <HardDrive className="w-3 h-3" />, placeholder: '12 GB' },
    { key: 'battery', label: 'Dung lượng Pin', icon: <Battery className="w-3 h-3" />, placeholder: '5000 mAh' },
    { key: 'storage', label: 'Bộ nhớ trong', icon: <HardDrive className="w-3 h-3" />, placeholder: '256 GB' },
  ],
  'Laptop': [
    { key: 'cpu', label: 'CPU', icon: <Cpu className="w-3 h-3" />, placeholder: 'Intel Core i9-13900H' },
    { key: 'ram', label: 'RAM', icon: <HardDrive className="w-3 h-3" />, placeholder: '32 GB DDR5' },
    { key: 'storage', label: 'Ổ cứng', icon: <HardDrive className="w-3 h-3" />, placeholder: '1 TB SSD NVMe' },
    { key: 'vga', label: 'VGA / GPU', icon: <Monitor className="w-3 h-3" />, placeholder: 'RTX 4070 8GB' },
    { key: 'ports', label: 'Cổng kết nối', icon: <Tag className="w-3 h-3" />, placeholder: 'USB-C, HDMI, SD Card' },
    { key: 'display', label: 'Màn hình', icon: <Monitor className="w-3 h-3" />, placeholder: '15.6\" 2K 165Hz' },
  ],
  'Phụ kiện': [
    { key: 'type', label: 'Loại phụ kiện', icon: <Tag className="w-3 h-3" />, placeholder: 'Tai nghe / Ốp lưng...' },
    { key: 'compatibility', label: 'Thiết bị tương thích', icon: <ScanLine className="w-3 h-3" />, placeholder: 'iPhone 15, Samsung S24' },
    { key: 'color', label: 'Màu sắc', icon: <Tag className="w-3 h-3" />, placeholder: 'Trắng sứ' },
    { key: 'material', label: 'Chất liệu', icon: <Tag className="w-3 h-3" />, placeholder: 'Nhôm / Silicone / Nhựa ABS' },
    { key: 'battery', label: 'Thời lượng Pin', icon: <Battery className="w-3 h-3" />, placeholder: '30h (có hộp sạc)' },
  ],
}

const CARD_SPEC_KEYS: Record<string, string[]> = {
  'Điện thoại': ['chip', 'ram', 'battery', 'storage'],
  'Laptop': ['cpu', 'ram', 'vga', 'storage'],
  'Phụ kiện': ['type', 'compatibility', 'color'],
}

// ─────────────────────────────────────────────
// Product Icon
// ─────────────────────────────────────────────
function ProductIcon({ type, className }: { type: UIProduct['iconType']; className?: string }) {
  const base = cn('w-14 h-14', className)
  if (type === 'phone') return <Smartphone className={cn(base, 'animate-float-slow')} strokeWidth={1.4} />
  if (type === 'laptop') return <Laptop className={cn(base, 'animate-float')} strokeWidth={1.4} />
  return <Headphones className={cn(base, 'animate-float-delayed')} strokeWidth={1.4} />
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { label: string; cls: string }> = {
    READY_TO_SELL: { label: '✦ Sẵn sàng bán', cls: 'bg-mint-clay text-emerald-800' },
    DEFECTIVE: { label: '✕ Hỏng hóc', cls: 'bg-pink-clay text-rose-800' },
    IN_TRANSIT: { label: '→ Đang luân chuyển', cls: 'bg-lilac-clay text-purple-800' },
  }
  const { label, cls } = map[status]
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide', cls)}
      style={{ boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 3px 8px rgba(17,24,39,0.09)' }}
    >
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────
// Spec Tag
// ─────────────────────────────────────────────
function SpecTag({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold text-slate-700', color)}
      style={{ boxShadow: '-2px -2px 5px rgba(255,255,255,0.85), 2px 3px 7px rgba(17,24,39,0.08)' }}
    >
      {icon}
      <span className="opacity-60">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete }: {
  product: UIProduct
  onEdit: (p: UIProduct) => void
  onDelete: (id: number) => void
}) {
  const specColors = ['bg-mint-clay/70', 'bg-lilac-clay/70', 'bg-pink-clay/60', 'bg-sky-clay/70', 'bg-peach-clay/60']
  const cardSpecKeys = CARD_SPEC_KEYS[product.category] ?? []
  const specEntries = cardSpecKeys
    .map((key) => ({ key, value: product.specs[key] }))
    .filter((e) => e.value)

  const fieldDefs = SPEC_FIELDS[product.category] ?? []
  const getLabel = (key: string) => fieldDefs.find((f) => f.key === key)?.label ?? key.toUpperCase()

  return (
    <div
      className={cn('clay-product-card rounded-card2 p-5 flex flex-col gap-4 relative overflow-hidden group', product.cardBg)}
      style={{
        boxShadow:
          '-10px -10px 24px rgba(255,255,255,0.92), 14px 18px 36px rgba(17,24,39,0.11), inset 0px 1px 0px rgba(255,255,255,0.88)',
      }}
    >
      <div className="absolute top-4 right-4 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(product)}
          className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center transition-all active:scale-95 hover:scale-110"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.10)' }}
          title="Sửa"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="w-7 h-7 rounded-full bg-pink-clay/80 flex items-center justify-center transition-all active:scale-95 hover:scale-110"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.10)' }}
          title="Xóa"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-700" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div
          className="w-[72px] h-[72px] rounded-2xl bg-white/50 flex items-center justify-center shrink-0"
          style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.85), 8px 10px 22px rgba(17,24,39,0.09), inset 0 1px 0 rgba(255,255,255,0.7)' }}
        >
          <ProductIcon type={product.iconType} className={product.iconColor} />
        </div>

        <div className="flex flex-col gap-1 items-end flex-1 pt-1">
          {specEntries.slice(0, 3).map((e, i) => (
            <SpecTag
              key={e.key}
              icon={<Tag className="w-2.5 h-2.5" />}
              label={getLabel(e.key)}
              value={e.value}
              color={specColors[i % specColors.length]}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[15px] font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 font-mono tracking-wide">SKU: {product.sku}</p>
      </div>

      {specEntries.length > 3 && (
        <div className="flex flex-wrap gap-1.5">
          {specEntries.slice(3).map((e, i) => (
            <SpecTag
              key={e.key}
              icon={<Tag className="w-2.5 h-2.5" />}
              label={getLabel(e.key)}
              value={e.value}
              color={specColors[(i + 3) % specColors.length]}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        <StatusBadge status={product.status} />
        <div className="text-right">
          <p className="text-[10px] text-slate-500">{product.quantity} đơn vị</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon, loading }: {
  label: string; value: number | string; sub: string; color: string; icon: React.ReactNode; loading?: boolean
}) {
  return (
    <div
      className={cn('rounded-card2 p-5 flex flex-col gap-3', color)}
      style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.92), 12px 16px 32px rgba(17,24,39,0.10), inset 0px 1px 0px rgba(255,255,255,0.88)' }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)' }}
        >
          {icon}
        </div>
        {loading ? (
          <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
        ) : (
          <p className="text-[30px] font-bold text-slate-900 leading-none">{value}</p>
        )}
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// NavIcon
// ─────────────────────────────────────────────
function NavIcon({ active, label, children }: { active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className={cn(
        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95',
        active ? 'bg-mint-clay text-slate-800' : 'bg-cream-bg text-slate-500 hover:text-slate-700',
      )}
      style={{
        boxShadow: active
          ? '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.12), inset 0px 1px 0px rgba(255,255,255,0.8)'
          : '-3px -3px 8px rgba(255,255,255,0.9), 4px 6px 14px rgba(17,24,39,0.08)',
      }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// Filter Pill
// ─────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-9 rounded-full px-5 text-[13px] font-semibold transition-all active:scale-95',
        active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:text-slate-900 hover:-translate-y-0.5',
      )}
      style={{
        boxShadow: active
          ? '0 4px 14px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.15)'
          : '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 22px rgba(17,24,39,0.09)',
      }}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// H4 Fix: Clay Input — Inner Shadow theo Guideline
// Guideline: inset 8px 8px 12px rgba(255,255,255,0.5), inset -8px -8px 12px rgba(0,0,0,0.05)
// ─────────────────────────────────────────────
const CLAY_INNER_SHADOW = 'inset 8px 8px 12px rgba(255,255,255,0.5), inset -8px -8px 12px rgba(0,0,0,0.05)'

function ClayInput({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-cream-bg px-4 py-3 text-[14px] font-medium text-slate-800 outline-none placeholder:text-slate-400 font-fredoka transition-shadow focus:ring-2 focus:ring-mint-clay/50"
        style={{ boxShadow: CLAY_INNER_SHADOW }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Clay Select
// ─────────────────────────────────────────────
function ClaySelect<T extends string | number>({ label, value, onChange, options, required }: {
  label: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[]; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative group">
        <select
          value={String(value)}
          onChange={(e) => {
            const raw = e.target.value
            onChange((typeof value === 'number' ? Number(raw) : raw) as T)
          }}
          className="w-full rounded-2xl bg-cream-bg px-4 py-3 text-[14px] font-medium text-slate-800 outline-none font-fredoka appearance-none cursor-pointer transition-all focus:ring-2 focus:ring-mint-clay/50 pr-10 hover:bg-white"
          style={{ boxShadow: CLAY_INNER_SHADOW }}
        >
          {options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// S2: Compound Component Pattern — Modal
// Usage:
//   <Modal onClose={...} saving={...}>
//     <Modal.Header title="Thêm Sản Phẩm" />
//     <Modal.Body>...</Modal.Body>
//     <Modal.Footer onSave={...} onClose={...} />
//   </Modal>
// ─────────────────────────────────────────────
interface ModalContextValue {
  onClose: () => void
  saving: boolean
}
const ModalContext = createContext<ModalContextValue>({ onClose: () => {}, saving: false })

interface ModalComposition {
  Header: typeof ModalHeader
  Body: typeof ModalBody
  Footer: typeof ModalFooter
}

function Modal({ children, onClose, saving }: {
  children: React.ReactNode
  onClose: () => void
  saving: boolean
}) {
  return (
    <ModalContext.Provider value={{ onClose, saving }}>
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-card bg-cream-bg"
          style={{
            boxShadow: '-18px -18px 44px rgba(255,255,255,0.96), 28px 36px 72px rgba(17,24,39,0.16), inset 8px 8px 12px rgba(255,255,255,0.5), inset -8px -8px 12px rgba(0,0,0,0.05)',
          }}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

function ModalHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { onClose } = useContext(ModalContext)
  return (
    <div className="flex items-center justify-between p-6 pb-0">
      <div>
        {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{subtitle}</p>}
        <h2 className="text-[20px] font-bold text-slate-900">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all active:scale-95 hover:bg-pink-clay/40"
        style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 5px 6px 14px rgba(17,24,39,0.09)' }}
      >
        <X className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  )
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 flex flex-col gap-4">
      {children}
    </div>
  )
}

function ModalFooter({ onSave, saveLabel = '✦ Thêm sản phẩm', cancelLabel = 'Hủy bỏ' }: {
  onSave: () => void
  saveLabel?: string
  cancelLabel?: string
}) {
  const { onClose, saving } = useContext(ModalContext)
  return (
    <div className="flex gap-3 px-6 pb-6">
      <button
        onClick={onClose}
        disabled={saving}
        className="flex-1 h-11 rounded-full bg-white text-[14px] font-semibold text-slate-600 transition-all active:scale-95 hover:-translate-y-0.5 disabled:opacity-50"
        style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 22px rgba(17,24,39,0.09)' }}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex-1 h-11 rounded-full bg-mint-clay text-[14px] font-bold text-slate-800 transition-all active:scale-95 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.13), 0 2px 8px rgba(178,242,187,0.5)' }}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? 'Đang lưu...' : saveLabel}
      </button>
    </div>
  )
}

// Attach sub-components to Modal (Compound Component Pattern)
;(Modal as unknown as ModalComposition).Header = ModalHeader
;(Modal as unknown as ModalComposition).Body = ModalBody
;(Modal as unknown as ModalComposition).Footer = ModalFooter
const ModalComponent = Modal as typeof Modal & ModalComposition

// ─────────────────────────────────────────────
// ClayModal — Compound Component usage (S2)
// ─────────────────────────────────────────────
function ClayModal({ state, formOptions, onClose, onSave, saving }: {
  state: ModalState
  formOptions: FormOptions | null
  onClose: () => void
  onSave: (form: ModalForm) => Promise<void>
  saving: boolean
}) {
  const firstCatId = formOptions?.categories[0]?.id ?? 1
  const firstWhId = formOptions?.warehouses[0]?.id ?? 1

  const [form, setForm] = useState<ModalForm>({
    name: '', sku: '', category_id: firstCatId, supplier_id: undefined,
    image_url: '', warehouse_id: firstWhId, specs: {},
  })

  useEffect(() => {
    if (state.open) {
      setForm({
        name: '', sku: '', category_id: firstCatId, supplier_id: undefined,
        image_url: '', warehouse_id: firstWhId, specs: {},
      })
    }
  }, [state.open, firstCatId, firstWhId])

  const selectedCategory = formOptions?.categories.find((c) => c.id === form.category_id)
  const categoryName = selectedCategory?.name ?? 'Điện thoại'
  const specFields = SPEC_FIELDS[categoryName] ?? SPEC_FIELDS['Phụ kiện']

  const setSpec = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, specs: { ...prev.specs, [key]: val } }))

  return (
    <ModalComponent onClose={onClose} saving={saving}>
      <ModalComponent.Header title="✦ Thêm Sản Phẩm Mới" subtitle="Thêm mới" />
      <ModalComponent.Body>
        <ClayInput required label="Tên sản phẩm" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Ví dụ: iPhone 15 Pro Max" />

        <div className="grid grid-cols-2 gap-3">
          <ClayInput required label="Mã SKU" value={form.sku} onChange={(v) => setForm((f) => ({ ...f, sku: v }))} placeholder="APL-IP15PM-256" />
          {formOptions && (
            <ClaySelect<number>
              required
              label="Danh mục"
              value={form.category_id}
              onChange={(v) => setForm((f) => ({ ...f, category_id: v, specs: {} }))}
              options={formOptions.categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {formOptions && (
            <ClaySelect<number>
              label="Nhà cung cấp"
              value={form.supplier_id ?? 0}
              onChange={(v) => setForm((f) => ({ ...f, supplier_id: v === 0 ? undefined : v }))}
              options={[
                { value: 0, label: '— Không có —' },
                ...formOptions.suppliers.map((s) => ({ value: s.id, label: s.company_name })),
              ]}
            />
          )}
          {formOptions && (
            <ClaySelect<number>
              required
              label="Kho khởi tạo"
              value={form.warehouse_id}
              onChange={(v) => setForm((f) => ({ ...f, warehouse_id: v }))}
              options={formOptions.warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          )}
        </div>

        {/* Dynamic JSON Spec Fields (Strategy Pattern) */}
        <div
          className="rounded-card2 p-4 bg-white/50"
          style={{ boxShadow: CLAY_INNER_SHADOW }}
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            📋 Thông số kỹ thuật — {categoryName}
          </p>
          <div className="flex flex-col gap-3">
            {specFields.map((field) => (
              <ClayInput
                key={field.key}
                label={`${field.label}${['display','os','camera','chip','ram','battery','cpu','storage','vga','ports','type','compatibility'].includes(field.key) ? ' *' : ''}`}
                value={form.specs[field.key] ?? ''}
                onChange={(v) => setSpec(field.key, v)}
                placeholder={field.placeholder}
              />
            ))}
          </div>
        </div>
      </ModalComponent.Body>
      <ModalComponent.Footer onSave={() => onSave(form)} />
    </ModalComponent>
  )
}

// ─────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────
function DeleteModal({ productName, onClose, onConfirm, deleting }: {
  productName: string; onClose: () => void; onConfirm: () => void; deleting: boolean
}) {
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-panel w-full max-w-sm rounded-card bg-cream-bg p-8 flex flex-col items-center gap-5 text-center"
        style={{ boxShadow: '-18px -18px 44px rgba(255,255,255,0.96), 28px 36px 72px rgba(17,24,39,0.16)' }}
      >
        <div
          className="w-16 h-16 rounded-card2 bg-pink-clay/60 flex items-center justify-center"
          style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.10)' }}
        >
          <Trash2 className="w-7 h-7 text-rose-600" />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-slate-900">Xóa sản phẩm?</h3>
          <p className="text-[13px] text-slate-500 mt-1">
            Bạn sắp xóa <span className="font-semibold text-slate-700">"{productName}"</span>. Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 h-10 rounded-full bg-white text-[13px] font-semibold text-slate-600 transition-all active:scale-95 disabled:opacity-50"
            style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.09)' }}
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 h-10 rounded-full bg-rose-400 text-[13px] font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ boxShadow: '0 4px 14px rgba(251,113,133,0.4)' }}
          >
            {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {deleting ? 'Đang xóa...' : 'Xóa ngay'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Toast Notification
// ─────────────────────────────────────────────
type ToastType = 'success' | 'error'
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-4 text-[14px] font-semibold shadow-2xl transition-all animate-slide-up',
        type === 'success' ? 'bg-mint-clay text-emerald-900' : 'bg-pink-clay text-rose-900',
      )}
      style={{ boxShadow: '0 8px 32px rgba(17,24,39,0.18)' }}
    >
      {type === 'success' ? '✦' : '✕'} {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// PRESENTER — Pure render, receives all data as props
// (H2: Container/Presenter split)
// ─────────────────────────────────────────────
interface ProductManagementViewProps {
  products: UIProduct[]
  stats: ApiProductStats | null
  formOptions: FormOptions | null
  modal: ModalState
  deleteTarget: UIProduct | null
  loadingProducts: boolean
  loadingStats: boolean
  saving: boolean
  deleting: boolean
  toast: { message: string; type: ToastType } | null
  error: string | null
  activeCategory: CategoryFilter
  searchQuery: string
  onCategoryChange: (cat: CategoryFilter) => void
  onSearchChange: (q: string) => void
  onOpenAdd: () => void
  onEdit: (p: UIProduct) => void
  onDelete: (id: number) => void
  onModalClose: () => void
  onModalSave: (form: ModalForm) => Promise<void>
  onDeleteClose: () => void
  onDeleteConfirm: () => void
  onToastClose: () => void
  onRefresh: () => void
}

function ProductManagementView({
  products, stats, formOptions, modal, deleteTarget,
  loadingProducts, loadingStats, saving, deleting, toast, error,
  activeCategory, searchQuery,
  onCategoryChange, onSearchChange, onOpenAdd, onEdit, onDelete,
  onModalClose, onModalSave, onDeleteClose, onDeleteConfirm, onToastClose, onRefresh,
}: ProductManagementViewProps) {
  const categories: CategoryFilter[] = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện']

  const filtered = useMemo(() => {
    if (!searchQuery) return products
    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [products, searchQuery])

  return (
    <div className="min-h-screen font-fredoka" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar ─────────────────────────── */}
          <aside className="shrink-0">
            <div
              className="w-[72px] rounded-[36px] bg-cream-bg px-3 py-5 flex flex-col items-center gap-5"
              style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.95), 12px 16px 36px rgba(17,24,39,0.10)' }}
            >
              <Link
                to="/"
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-mint-clay to-emerald-300 flex items-center justify-center font-bold text-slate-800 text-sm active:scale-95 transition-transform"
                style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.14)' }}
              >
                F4
              </Link>
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <Link to="/"><NavIcon label="Dashboard"><LayoutDashboard className="w-5 h-5" /></NavIcon></Link>
              <NavIcon label="Kho hàng"><Warehouse className="w-5 h-5" /></NavIcon>
              <Link to="/products"><NavIcon label="Sản phẩm" active><Package className="w-5 h-5" /></NavIcon></Link>
              <NavIcon label="Vận chuyển"><Truck className="w-5 h-5" /></NavIcon>
              <NavIcon label="Tìm kiếm"><PackageSearch className="w-5 h-5" /></NavIcon>
              <div className="flex-1" />
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Cài đặt"><Settings className="w-5 h-5" /></NavIcon>
            </div>
          </aside>

          {/* ── Main Content ─────────────────── */}
          <main className="flex-1 min-w-0">

            {/* ── Header ─── */}
            <header className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span
                  className="text-[11px] font-semibold text-slate-400 bg-white rounded-full px-3 py-1"
                  style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.07)' }}
                >
                  F4 Warehouse · Quản lý kho
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  Quản lý Sản phẩm{' '}
                  <span className="text-emerald-600 bg-mint-clay/40 px-3 py-0.5 rounded-full text-lg">
                    {stats ? `${stats.total_products} SKU` : '—'}
                  </span>
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Tổng tồn kho: {stats?.total_quantity ?? '—'} đơn vị
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="hidden lg:flex items-center gap-2 rounded-full bg-white px-4 py-2.5 w-[260px]"
                  style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.95), 8px 12px 24px rgba(17,24,39,0.09)' }}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-fredoka"
                    placeholder="Tìm theo tên, SKU..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
                <button
                  onClick={onRefresh}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.09)' }}
                  title="Làm mới"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                  style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.09)' }}
                >
                  <Bell className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={onOpenAdd}
                  className="h-10 rounded-full px-5 text-[13px] font-bold bg-mint-clay text-slate-800 inline-flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.12)' }}
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </button>
              </div>
            </header>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Điện thoại"
                value={stats?.phones.product_count ?? 0}
                sub={`${stats?.phones.total_quantity ?? 0} máy tồn kho`}
                color="bg-pink-clay/30"
                icon={<Smartphone className="w-5 h-5 text-rose-500" />}
                loading={loadingStats}
              />
              <StatCard
                label="Laptop"
                value={stats?.laptops.product_count ?? 0}
                sub={`${stats?.laptops.total_quantity ?? 0} máy tồn kho`}
                color="bg-mint-clay/30"
                icon={<Laptop className="w-5 h-5 text-emerald-600" />}
                loading={loadingStats}
              />
              <StatCard
                label="Phụ kiện"
                value={stats?.accessories.product_count ?? 0}
                sub={`${stats?.accessories.total_quantity ?? 0} đơn vị tồn kho`}
                color="bg-lilac-clay/30"
                icon={<Headphones className="w-5 h-5 text-violet-500" />}
                loading={loadingStats}
              />
            </div>

            {/* ── Filter Pills ── */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              {categories.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onClick={() => onCategoryChange(cat)}
                />
              ))}
              <span className="ml-auto text-[12px] text-slate-400 font-medium">
                {filtered.length} sản phẩm
              </span>
            </div>

            {/* ── Error Banner ── */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-pink-clay/40 px-5 py-4 mb-6 text-rose-800 text-[13px] font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
                <button onClick={onRefresh} className="ml-auto underline">Thử lại</button>
              </div>
            )}

            {/* ── Bento Grid ── */}
            {loadingProducts ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-[14px] font-medium">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Box className="w-16 h-16 text-slate-300" />
                <p className="text-[15px] text-slate-400 font-medium">
                  {error ? 'Không thể tải dữ liệu' : 'Không có sản phẩm nào'}
                </p>
                <button
                  onClick={onOpenAdd}
                  className="h-10 rounded-full px-5 text-[13px] font-bold bg-mint-clay text-slate-800 inline-flex items-center gap-2"
                  style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.10)' }}
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal.open && (
        <ClayModal
          state={modal}
          formOptions={formOptions}
          onClose={onModalClose}
          onSave={onModalSave}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          productName={deleteTarget.name}
          onClose={onDeleteClose}
          onConfirm={onDeleteConfirm}
          deleting={deleting}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={onToastClose}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// CONTAINER — Xử lý data fetching + business logic
// (H2: Container/Presenter Pattern)
// ─────────────────────────────────────────────
export default function ProductManagement() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [formOptions, setFormOptions] = useState<FormOptions | null>(null)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add', productId: null })
  const [deleteTarget, setDeleteTarget] = useState<UIProduct | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // Lấy warehouse context từ global store (S1)
  const { selectedWarehouseId } = useWarehouseStore()

  // Xác định category_id từ activeCategory filter
  const categoryId = useMemo(() => {
    if (activeCategory === 'Tất cả') return undefined
    if (formOptions?.categories) {
      return formOptions.categories.find((c) => c.name === activeCategory)?.id
    }
    return undefined
  }, [activeCategory, formOptions])

  // Custom Hooks thay thế inline fetch logic (S3 / H2)
  const { products: rawProducts, loading: loadingProducts, error, refetch: refetchProducts } = useProducts({
    category_id: categoryId,
    warehouse_id: selectedWarehouseId ?? undefined,
    search: searchQuery || undefined,
    limit: 50,
  })
  const { stats, loading: loadingStats, refetch: refetchStats } = useProductStats(selectedWarehouseId ?? undefined)

  const products = useMemo(() => rawProducts.map(mapApiProductToUI), [rawProducts])

  // ── Fetch form options ──
  const fetchFormOptions = useCallback(async () => {
    try {
      const opts = await productApiService.getFormOptions()
      setFormOptions(opts)
    } catch (err) {
      console.error('[FormOptions] Error:', err)
    }
  }, [])

  useEffect(() => {
    fetchFormOptions()
  }, [fetchFormOptions])

  const handleRefresh = useCallback(() => {
    refetchProducts()
    refetchStats()
  }, [refetchProducts, refetchStats])

  const handleSave = useCallback(async (form: ModalForm) => {
    setSaving(true)
    try {
      const categoryName = formOptions?.categories.find((c) => c.id === form.category_id)?.name ?? ''
      const specFields = SPEC_FIELDS[categoryName] ?? []
      const cleanSpecs: Record<string, string> = {}
      specFields.forEach((f) => {
        const v = form.specs[f.key]
        if (v && v.trim()) cleanSpecs[f.key] = v.trim()
      })

      const payload: CreateProductPayload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id,
        supplier_id: form.supplier_id,
        image_url: form.image_url.trim() || undefined,
        specifications: cleanSpecs,
        warehouse_id: form.warehouse_id,
      }

      await productApiService.createProduct(payload)
      setToast({ message: `Thêm "${form.name}" thành công! 🎉`, type: 'success' })
      setModal({ open: false, mode: 'add', productId: null })
      refetchProducts()
      refetchStats()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thêm sản phẩm'
      setToast({ message: msg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }, [formOptions, refetchProducts, refetchStats])

  const handleDelete = useCallback((id: number) => {
    const target = products.find((p) => p.id === id)
    if (target) setDeleteTarget(target)
  }, [products])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await productApiService.deleteProduct(deleteTarget.id)
      setToast({ message: `Đã xóa "${deleteTarget.name}"`, type: 'success' })
      setDeleteTarget(null)
      refetchProducts()
      refetchStats()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa sản phẩm'
      setToast({ message: msg, type: 'error' })
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, refetchProducts, refetchStats])

  return (
    <ProductManagementView
      products={products}
      stats={stats}
      formOptions={formOptions}
      modal={modal}
      deleteTarget={deleteTarget}
      loadingProducts={loadingProducts}
      loadingStats={loadingStats}
      saving={saving}
      deleting={deleting}
      toast={toast}
      error={error}
      activeCategory={activeCategory}
      searchQuery={searchQuery}
      onCategoryChange={setActiveCategory}
      onSearchChange={setSearchQuery}
      onOpenAdd={() => setModal({ open: true, mode: 'add', productId: null })}
      onEdit={() => setModal({ open: true, mode: 'add', productId: null })}
      onDelete={handleDelete}
      onModalClose={() => setModal({ open: false, mode: 'add', productId: null })}
      onModalSave={handleSave}
      onDeleteClose={() => setDeleteTarget(null)}
      onDeleteConfirm={confirmDelete}
      onToastClose={() => setToast(null)}
      onRefresh={handleRefresh}
    />
  )
}
