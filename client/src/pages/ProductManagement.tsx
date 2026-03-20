import React, { useState, useMemo } from 'react'
import {
  Bell,
  Box,
  ChevronRight,
  Headphones,
  LayoutDashboard,
  Laptop,
  Package,
  PackageSearch,
  Plus,
  Search,
  Settings,
  Smartphone,
  Truck,
  Warehouse,
  X,
  Edit3,
  Trash2,
  Filter,
  ScanLine,
  Tag,
  Cpu,
  HardDrive,
  Battery,
  Monitor,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Category = 'Tất cả' | 'Điện thoại' | 'Laptop' | 'Phụ kiện'
type StockStatus = 'READY_TO_SELL' | 'DEFECTIVE' | 'IN_TRANSIT'

interface ProductSpec {
  ram?: string
  cpu?: string
  pin?: string
  storage?: string
  display?: string
  gpu?: string
  color?: string
  material?: string
  compatibility?: string
}

interface Product {
  id: string
  name: string
  sku: string
  category: Exclude<Category, 'Tất cả'>
  status: StockStatus
  quantity: number
  price: string
  specs: ProductSpec
  iconType: 'phone' | 'laptop' | 'accessory'
  iconColor: string
  cardBg: string
}

interface ModalState {
  open: boolean
  mode: 'add' | 'edit'
  product: Partial<Product> | null
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// ─────────────────────────────────────────────
// Sample Data
// ─────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    sku: 'APL-IP15PM-256',
    category: 'Điện thoại',
    status: 'READY_TO_SELL',
    quantity: 48,
    price: '34.990.000đ',
    specs: { ram: '8 GB', cpu: 'A17 Pro', pin: '4.422 mAh', storage: '256 GB' },
    iconType: 'phone',
    iconColor: 'text-slate-700',
    cardBg: 'bg-pink-clay/45',
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-512',
    category: 'Điện thoại',
    status: 'READY_TO_SELL',
    quantity: 32,
    price: '31.990.000đ',
    specs: { ram: '12 GB', cpu: 'Snapdragon 8 Gen 3', pin: '5.000 mAh', storage: '512 GB' },
    iconType: 'phone',
    iconColor: 'text-violet-600',
    cardBg: 'bg-lilac-clay/40',
  },
  {
    id: 'p3',
    name: 'MacBook Pro 14" M3 Pro',
    sku: 'APL-MBP14-M3-18',
    category: 'Laptop',
    status: 'READY_TO_SELL',
    quantity: 15,
    price: '52.990.000đ',
    specs: { ram: '18 GB', cpu: 'Apple M3 Pro', storage: '512 GB SSD', display: '14.2" Liquid Retina XDR', gpu: '18-core GPU' },
    iconType: 'laptop',
    iconColor: 'text-slate-700',
    cardBg: 'bg-mint-clay/40',
  },
  {
    id: 'p4',
    name: 'Dell XPS 15 OLED',
    sku: 'DEL-XPS15-i9-32',
    category: 'Laptop',
    status: 'IN_TRANSIT',
    quantity: 8,
    price: '46.500.000đ',
    specs: { ram: '32 GB', cpu: 'Intel Core i9-13900H', storage: '1 TB SSD', display: '15.6" OLED Touch', gpu: 'RTX 4060' },
    iconType: 'laptop',
    iconColor: 'text-blue-600',
    cardBg: 'bg-sky-clay/40',
  },
  {
    id: 'p5',
    name: 'AirPods Pro 2nd Gen',
    sku: 'APL-APP2-WHT',
    category: 'Phụ kiện',
    status: 'READY_TO_SELL',
    quantity: 120,
    price: '6.490.000đ',
    specs: { pin: '30h (case)', color: 'Trắng sứ', compatibility: 'iOS / Android', material: 'Silicone mềm' },
    iconType: 'accessory',
    iconColor: 'text-rose-500',
    cardBg: 'bg-pink-clay/35',
  },
  {
    id: 'p6',
    name: 'Xiaomi 14 Ultra',
    sku: 'XIA-14U-512',
    category: 'Điện thoại',
    status: 'DEFECTIVE',
    quantity: 5,
    price: '28.990.000đ',
    specs: { ram: '16 GB', cpu: 'Snapdragon 8 Gen 3', pin: '5.300 mAh', storage: '512 GB' },
    iconType: 'phone',
    iconColor: 'text-orange-500',
    cardBg: 'bg-peach-clay/40',
  },
]

const SPEC_FIELDS: Record<Exclude<Category, 'Tất cả'>, Array<{ key: keyof ProductSpec; label: string; icon: React.ReactNode }>> = {
  'Điện thoại': [
    { key: 'cpu', label: 'CPU / Chip', icon: <Cpu className="w-3 h-3" /> },
    { key: 'ram', label: 'RAM', icon: <HardDrive className="w-3 h-3" /> },
    { key: 'storage', label: 'Bộ nhớ trong', icon: <HardDrive className="w-3 h-3" /> },
    { key: 'pin', label: 'Dung lượng Pin', icon: <Battery className="w-3 h-3" /> },
  ],
  Laptop: [
    { key: 'cpu', label: 'CPU', icon: <Cpu className="w-3 h-3" /> },
    { key: 'ram', label: 'RAM', icon: <HardDrive className="w-3 h-3" /> },
    { key: 'gpu', label: 'GPU', icon: <Monitor className="w-3 h-3" /> },
    { key: 'storage', label: 'Ổ cứng', icon: <HardDrive className="w-3 h-3" /> },
    { key: 'display', label: 'Màn hình', icon: <Monitor className="w-3 h-3" /> },
  ],
  'Phụ kiện': [
    { key: 'color', label: 'Màu sắc', icon: <Tag className="w-3 h-3" /> },
    { key: 'material', label: 'Chất liệu', icon: <Tag className="w-3 h-3" /> },
    { key: 'pin', label: 'Thời lượng Pin', icon: <Battery className="w-3 h-3" /> },
    { key: 'compatibility', label: 'Tương thích', icon: <ScanLine className="w-3 h-3" /> },
  ],
}

// ─────────────────────────────────────────────
// Product Icon Component (3D fat icons)
// ─────────────────────────────────────────────
function ProductIcon({ type, className }: { type: Product['iconType']; className?: string }) {
  const base = cn('w-16 h-16', className)
  if (type === 'phone')
    return <Smartphone className={cn(base, 'animate-float-slow')} strokeWidth={1.4} />
  if (type === 'laptop')
    return <Laptop className={cn(base, 'animate-float')} strokeWidth={1.4} />
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
// Spec Tag (mini pastel bubble)
// ─────────────────────────────────────────────
function SpecTag({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold text-slate-700', color)}
      style={{ boxShadow: '-2px -2px 5px rgba(255,255,255,0.85), 2px 3px 7px rgba(17,24,39,0.08)' }}
    >
      {icon}
      <span className="opacity-60">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// Product Card (Clay)
// ─────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete }: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  const specColors = ['bg-mint-clay/70', 'bg-lilac-clay/70', 'bg-pink-clay/60', 'bg-sky-clay/70', 'bg-peach-clay/60']
  const specEntries = Object.entries(product.specs)

  return (
    <div
      className={cn('clay-product-card rounded-card2 p-5 flex flex-col gap-4 relative overflow-hidden', product.cardBg)}
      style={{
        boxShadow:
          '-10px -10px 24px rgba(255,255,255,0.92), 14px 18px 36px rgba(17,24,39,0.11), inset 0px 1px 0px rgba(255,255,255,0.88)',
      }}
    >
      {/* Quick Actions */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
        <button
          onClick={() => onEdit(product)}
          className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center transition-all active:scale-95 hover:scale-105"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.10)' }}
          title="Sửa"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="w-7 h-7 rounded-full bg-pink-clay/80 flex items-center justify-center transition-all active:scale-95 hover:scale-105"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.10)' }}
          title="Xóa"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-700" />
        </button>
      </div>

      {/* Product Icon + Status */}
      <div className="flex items-start justify-between">
        <div
          className="w-20 h-20 rounded-2xl bg-white/50 flex items-center justify-center"
          style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.85), 8px 10px 22px rgba(17,24,39,0.09), inset 0 1px 0 rgba(255,255,255,0.7)' }}
        >
          <ProductIcon type={product.iconType} className={product.iconColor} />
        </div>

        {/* Spec Tags floating around */}
        <div className="flex flex-col gap-1 items-end mt-1 pr-10">
          {specEntries.slice(0, 3).map(([key, val], i) => (
            <SpecTag
              key={key}
              icon={<Tag className="w-2.5 h-2.5" />}
              label={key.toUpperCase()}
              value={val}
              color={specColors[i % specColors.length]}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        <p className="text-[15px] font-bold text-slate-900 leading-tight">{product.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 font-mono tracking-wide">SKU: {product.sku}</p>
      </div>

      {/* Remaining Specs as tags */}
      {specEntries.length > 3 && (
        <div className="flex flex-wrap gap-1.5">
          {specEntries.slice(3).map(([key, val], i) => (
            <SpecTag
              key={key}
              icon={<Tag className="w-2.5 h-2.5" />}
              label={key.toUpperCase()}
              value={val}
              color={specColors[(i + 3) % specColors.length]}
            />
          ))}
        </div>
      )}

      {/* Footer: Status + Qty + Price */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <StatusBadge status={product.status} />
        <div className="text-right">
          <p className="text-[12px] font-bold text-slate-900">{product.price}</p>
          <p className="text-[10px] text-slate-500">{product.quantity} máy còn</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Summary Stat Cards (top row)
// ─────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode
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
        <p className="text-[30px] font-bold text-slate-900 leading-none">{value}</p>
      </div>
      <div>
        <p className="text-[14px] font-bold text-slate-900">{label}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// NavIcon (Sidebar)
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
// PillButton
// ─────────────────────────────────────────────
function PillButton({ icon, iconBg, children, className, onClick }: {
  icon?: React.ReactNode; iconBg?: string; children: React.ReactNode; className?: string; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 rounded-full px-4 text-[13px] font-semibold inline-flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5',
        className,
      )}
      style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.95), 10px 14px 28px rgba(17,24,39,0.12)' }}
    >
      {icon && (
        <span
          className={cn('w-6 h-6 rounded-full inline-flex items-center justify-center', iconBg ?? 'bg-white/70')}
          style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.9), 4px 4px 10px rgba(17,24,39,0.1)' }}
        >
          {icon}
        </span>
      )}
      <span className="leading-none">{children}</span>
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
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white text-slate-600 hover:text-slate-900 hover:-translate-y-0.5',
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
// Clay Inset Input
// ─────────────────────────────────────────────
function ClayInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-cream-bg px-4 py-3 text-[14px] font-medium text-slate-800 outline-none placeholder:text-slate-400 font-fredoka transition-shadow focus:ring-2 focus:ring-mint-clay/50"
        style={{ boxShadow: 'inset 4px 4px 10px rgba(17,24,39,0.08), inset -4px -4px 10px rgba(255,255,255,0.80)' }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Clay Select
// ─────────────────────────────────────────────
function ClaySelect<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-2xl bg-cream-bg px-4 py-3 text-[14px] font-medium text-slate-800 outline-none font-fredoka appearance-none cursor-pointer transition-shadow focus:ring-2 focus:ring-mint-clay/50"
        style={{ boxShadow: 'inset 4px 4px 10px rgba(17,24,39,0.08), inset -4px -4px 10px rgba(255,255,255,0.80)' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────
// Clay Modal (Add / Edit)
// ─────────────────────────────────────────────
function ClayModal({ state, onClose, onSave }: {
  state: ModalState
  onClose: () => void
  onSave: (product: Partial<Product>) => void
}) {
  const [form, setForm] = useState<Partial<Product>>(state.product ?? {
    category: 'Điện thoại',
    status: 'READY_TO_SELL',
    specs: {},
  })

  const selectedCat = (form.category as Exclude<Category, 'Tất cả'>) ?? 'Điện thoại'
  const specFields = SPEC_FIELDS[selectedCat]

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const setSpec = (k: keyof ProductSpec, v: string) =>
    setForm((prev) => ({ ...prev, specs: { ...(prev.specs ?? {}), [k]: v } }))

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-card bg-cream-bg"
        style={{
          boxShadow:
            '-18px -18px 44px rgba(255,255,255,0.96), 28px 36px 72px rgba(17,24,39,0.16), inset 0px 1px 0px rgba(255,255,255,0.94)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {state.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}
            </p>
            <h2 className="text-[20px] font-bold text-slate-900">
              {state.mode === 'add' ? '✦ Thêm Sản Phẩm Mới' : '✎ Chỉnh sửa Sản Phẩm'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all active:scale-95 hover:bg-pink-clay/40"
            style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 5px 6px 14px rgba(17,24,39,0.09)' }}
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Basic Info */}
          <ClayInput
            label="Tên sản phẩm"
            value={form.name ?? ''}
            onChange={(v) => set('name', v)}
            placeholder="Ví dụ: iPhone 15 Pro Max"
          />
          <div className="grid grid-cols-2 gap-3">
            <ClayInput
              label="Mã SKU"
              value={form.sku ?? ''}
              onChange={(v) => set('sku', v)}
              placeholder="APL-IP15PM-256"
            />
            <ClaySelect
              label="Danh mục"
              value={selectedCat}
              onChange={(v) => set('category', v as any)}
              options={[
                { value: 'Điện thoại', label: '📱 Điện thoại' },
                { value: 'Laptop', label: '💻 Laptop' },
                { value: 'Phụ kiện', label: '🎧 Phụ kiện' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ClaySelect
              label="Trạng thái"
              value={form.status ?? 'READY_TO_SELL'}
              onChange={(v) => set('status', v as StockStatus)}
              options={[
                { value: 'READY_TO_SELL', label: '✦ Sẵn sàng bán' },
                { value: 'DEFECTIVE', label: '✕ Hỏng hóc' },
                { value: 'IN_TRANSIT', label: '→ Đang luân chuyển' },
              ]}
            />
            <ClayInput
              label="Giá niêm yết"
              value={form.price ?? ''}
              onChange={(v) => set('price', v)}
              placeholder="34.990.000đ"
            />
          </div>

          {/* Dynamic JSON Spec Fields */}
          <div
            className="rounded-card2 p-4 bg-white/50"
            style={{ boxShadow: 'inset 3px 3px 8px rgba(17,24,39,0.06), inset -3px -3px 8px rgba(255,255,255,0.75)' }}
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              📋 Thông số kỹ thuật — {selectedCat}
            </p>
            <div className="flex flex-col gap-3">
              {specFields.map((field) => (
                <ClayInput
                  key={field.key}
                  label={field.label}
                  value={(form.specs as any)?.[field.key] ?? ''}
                  onChange={(v) => setSpec(field.key, v)}
                  placeholder={`Nhập ${field.label}...`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-white text-[14px] font-semibold text-slate-600 transition-all active:scale-95 hover:-translate-y-0.5"
            style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 22px rgba(17,24,39,0.09)' }}
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 h-11 rounded-full bg-mint-clay text-[14px] font-bold text-slate-800 transition-all active:scale-95 hover:-translate-y-0.5"
            style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.13), 0 2px 8px rgba(178,242,187,0.5)' }}
          >
            {state.mode === 'add' ? '✦ Thêm sản phẩm' : '✎ Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────
function DeleteModal({ productName, onClose, onConfirm }: {
  productName: string; onClose: () => void; onConfirm: () => void
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
            className="flex-1 h-10 rounded-full bg-white text-[13px] font-semibold text-slate-600 transition-all active:scale-95"
            style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.09)' }}
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-full bg-rose-400 text-[13px] font-bold text-white transition-all active:scale-95"
            style={{ boxShadow: '0 4px 14px rgba(251,113,133,0.4)' }}
          >
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ProductManagement() {
  const [activeCategory, setActiveCategory] = useState<Category>('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add', product: null })
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const categories: Category[] = ['Tất cả', 'Điện thoại', 'Laptop', 'Phụ kiện']

  const stats = useMemo(() => ({
    total: products.length,
    readyCount: products.filter((p) => p.status === 'READY_TO_SELL').length,
    defectiveCount: products.filter((p) => p.status === 'DEFECTIVE').length,
    inTransitCount: products.filter((p) => p.status === 'IN_TRANSIT').length,
  }), [products])

  const filtered = useMemo(() =>
    products.filter((p) => {
      const matchCat = activeCategory === 'Tất cả' || p.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      return matchCat && matchSearch
    }),
    [products, activeCategory, searchQuery],
  )

  const openAdd = () => setModal({
    open: true,
    mode: 'add',
    product: { category: 'Điện thoại', status: 'READY_TO_SELL', specs: {} },
  })

  const openEdit = (p: Product) => setModal({ open: true, mode: 'edit', product: { ...p } })

  const handleSave = (form: Partial<Product>) => {
    if (modal.mode === 'add') {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        name: form.name ?? 'Sản phẩm mới',
        sku: form.sku ?? 'SKU-000',
        category: form.category as Exclude<Category, 'Tất cả'> ?? 'Điện thoại',
        status: form.status ?? 'READY_TO_SELL',
        quantity: 0,
        price: form.price ?? '0đ',
        specs: form.specs ?? {},
        iconType: form.category === 'Laptop' ? 'laptop' : form.category === 'Phụ kiện' ? 'accessory' : 'phone',
        iconColor: 'text-slate-700',
        cardBg: form.category === 'Laptop' ? 'bg-mint-clay/40' : form.category === 'Phụ kiện' ? 'bg-pink-clay/35' : 'bg-pink-clay/45',
      }
      setProducts((prev) => [newProduct, ...prev])
    } else {
      setProducts((prev) => prev.map((p) => (p.id === (form as Product).id ? { ...p, ...form } as Product : p)))
    }
    setModal({ open: false, mode: 'add', product: null })
  }

  const handleDelete = (id: string) => {
    const target = products.find((p) => p.id === id)
    if (target) setDeleteTarget(target)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen font-fredoka" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="shrink-0">
            <div
              className="w-[72px] rounded-[36px] bg-cream-bg px-3 py-5 flex flex-col items-center gap-5"
              style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.95), 12px 16px 36px rgba(17,24,39,0.10)' }}
            >
              <div
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-mint-clay to-emerald-300 flex items-center justify-center font-bold text-slate-800 text-sm"
                style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.14)' }}
              >
                F4
              </div>
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Dashboard"><LayoutDashboard className="w-5 h-5" /></NavIcon>
              <NavIcon label="Kho hàng"><Warehouse className="w-5 h-5" /></NavIcon>
              <NavIcon label="Sản phẩm" active><Package className="w-5 h-5" /></NavIcon>
              <NavIcon label="Vận chuyển"><Truck className="w-5 h-5" /></NavIcon>
              <NavIcon label="Tìm kiếm"><PackageSearch className="w-5 h-5" /></NavIcon>
              <div className="flex-1" />
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Cài đặt"><Settings className="w-5 h-5" /></NavIcon>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* ── Header ───────────────────────────────── */}
            <header className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span
                  className="text-[11px] font-semibold text-slate-400 bg-white rounded-full px-3 py-1"
                  style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.07)' }}
                >
                  F4 Warehouse · Kho A-12 Thủ Đức
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  Quản lý Sản phẩm{' '}
                  <span className="text-emerald-600 bg-mint-clay/40 px-3 py-0.5 rounded-full text-lg">
                    Kho A-12 Thủ Đức
                  </span>
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {stats.total} sản phẩm · {stats.readyCount} sẵn sàng bán
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div
                  className="hidden lg:flex items-center gap-2 rounded-full bg-white px-4 py-2.5 w-[260px]"
                  style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.95), 8px 12px 24px rgba(17,24,39,0.09)' }}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-fredoka"
                    placeholder="Tìm theo tên, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <PillButton
                  className="bg-pink-clay/50 text-slate-800"
                  iconBg="bg-pink-clay"
                  icon={<Warehouse className="w-3.5 h-3.5 text-rose-600" />}
                >
                  Chọn Kho
                </PillButton>
                <PillButton
                  onClick={openAdd}
                  className="bg-mint-clay/70 text-slate-800"
                  iconBg="bg-mint-clay"
                  icon={<Plus className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  Thêm Sản Phẩm Mới
                </PillButton>
                <button
                  className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all active:scale-95"
                  style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.10)' }}
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-cream-bg" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-lilac-clay flex items-center justify-center transition-all active:scale-95 text-xs font-bold text-slate-700"
                  style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.10)' }}
                >
                  VT
                </button>
              </div>
            </header>

            {/* ── ROW 1: Stat Cards (Bento) ─────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <StatCard
                label="Tổng sản phẩm"
                value={String(stats.total)}
                sub="Trong kho A-12"
                color="bg-white"
                icon={<Box className="w-5 h-5 text-slate-700" />}
              />
              <StatCard
                label="Sẵn sàng bán"
                value={String(stats.readyCount)}
                sub="Tình trạng tốt"
                color="bg-mint-clay/40"
                icon={<Package className="w-5 h-5 text-emerald-700" />}
              />
              <StatCard
                label="Hỏng hóc"
                value={String(stats.defectiveCount)}
                sub="Cần xử lý"
                color="bg-pink-clay/40"
                icon={<Trash2 className="w-5 h-5 text-rose-600" />}
              />
              <StatCard
                label="Đang luân chuyển"
                value={String(stats.inTransitCount)}
                sub="Đang vận chuyển"
                color="bg-lilac-clay/40"
                icon={<Truck className="w-5 h-5 text-purple-600 animate-float" />}
              />
            </div>

            {/* ── ROW 2: Filter Pills + Sort ─────────────── */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <FilterPill
                    key={cat}
                    label={cat}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                  />
                ))}
              </div>
              <button
                className="h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-slate-600 inline-flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 22px rgba(17,24,39,0.09)' }}
              >
                <Filter className="w-3.5 h-3.5" />
                Bộ lọc
              </button>
            </div>

            {/* ── ROW 3: Product Grid (Bento) ─────────────── */}
            {filtered.length === 0 ? (
              <div
                className="rounded-card bg-white flex flex-col items-center justify-center py-20 gap-4"
                style={{ boxShadow: '-10px -10px 24px rgba(255,255,255,0.95), 16px 20px 40px rgba(17,24,39,0.09)' }}
              >
                <div
                  className="w-16 h-16 rounded-card2 bg-cream-bg flex items-center justify-center"
                  style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.08)' }}
                >
                  <PackageSearch className="w-7 h-7 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">Không tìm thấy sản phẩm</p>
                  <p className="text-[13px] text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
                <button
                  onClick={openAdd}
                  className="h-10 rounded-full bg-mint-clay/70 px-5 text-[13px] font-bold text-slate-800 transition-all active:scale-95"
                  style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.10)' }}
                >
                  + Thêm sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}

                {/* Add New Card (Bento Slot) */}
                <button
                  onClick={openAdd}
                  className="clay-product-card rounded-card2 border-2 border-dashed border-slate-200/80 flex flex-col items-center justify-center gap-3 min-h-[280px] transition-all hover:border-mint-clay/60 group"
                  style={{ boxShadow: 'inset 4px 4px 12px rgba(17,24,39,0.05), inset -4px -4px 12px rgba(255,255,255,0.6)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl bg-mint-clay/30 flex items-center justify-center transition-all group-hover:bg-mint-clay/60 group-hover:scale-110"
                    style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.09)' }}
                  >
                    <Plus className="w-6 h-6 text-emerald-700" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                    Thêm sản phẩm mới
                  </p>
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[12px] text-slate-400">
                Hiển thị <span className="font-bold text-slate-600">{filtered.length}</span> / {products.length} sản phẩm
              </p>
              <button className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                Xem tất cả giao dịch
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </main>
        </div>
      </div>

      {/* ── Clay Modal (Add / Edit) ────────────────── */}
      {modal.open && modal.product && (
        <ClayModal
          key={modal.mode + (modal.product as any)?.id}
          state={modal}
          onClose={() => setModal({ open: false, mode: 'add', product: null })}
          onSave={handleSave}
        />
      )}

      {/* ── Delete Confirm Modal ───────────────────── */}
      {deleteTarget && (
        <DeleteModal
          productName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
