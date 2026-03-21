/**
 * WarehouseOperationsHub — "The Stitch" Claymorphism Edition
 * ===========================================================
 * Architecture: Container / Presenter separation
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Coins,
  FileDigit,
  FileSpreadsheet,
  PackagePlus,
  Scan,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { useWarehouseStore } from '../../store/useWarehouseStore'
import { productApiService, ApiProduct } from '../../services/product.service'
import { transactionApiService, InboundPayload, OutboundPayload } from '../../services/transaction.service'
import { usePartnerStore } from '../../store/usePartnerStore'
import { useEffect } from 'react'

// ─────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────

export type HubMode = 'INBOUND' | 'OUTBOUND' | 'TRANSFER'

type HubStatus =
  | { kind: 'idle' }
  | { kind: 'submitting'; progress: number }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

interface Supplier { id: number; name: string }
interface Customer { id: number; name: string }

interface ScannedRow {
  id: string;
  productName: string;
  price: number;
  imei: string;
}

// Removed MOCK arrays in favor of real DB data from usePartnerStore

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function findDuplicates(rows: ScannedRow[]): Set<string> {
  const seen = new Set<string>(); const dupes = new Set<string>()
  for (const r of rows) {
    if (seen.has(r.imei)) dupes.add(r.imei)
    else seen.add(r.imei)
  }
  return dupes
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function ModeSwitcher({ mode, onChange }: { mode: HubMode; onChange: (m: HubMode) => void }) {
  return (
    <div className="inline-flex gap-1 p-1.5 rounded-full" style={{ background: '#FDFBF7', boxShadow: 'inset 4px 4px 10px rgba(17,24,39,0.08), inset -4px -4px 10px rgba(255,255,255,0.80)' }}>
      {(['INBOUND', 'OUTBOUND', 'TRANSFER'] as HubMode[]).map((m) => {
        const isActive = mode === m
        const bg = isActive ? (m === 'INBOUND' ? 'bg-mint-clay' : m === 'OUTBOUND' ? 'bg-pink-clay' : 'bg-lilac-clay') : 'bg-transparent'
        const Icon = m === 'INBOUND' ? ArrowDownToLine : m === 'OUTBOUND' ? ArrowUpFromLine : ArrowRightLeft
        const label = m === 'INBOUND' ? 'Nhập Kho' : m === 'OUTBOUND' ? 'Xuất Kho' : 'Điều chuyển'
        return (
          <button key={m} onClick={() => onChange(m)} className={cn('relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 active:scale-95', bg, isActive ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600')} style={isActive ? { boxShadow: '-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 16px rgba(17,24,39,0.12)' } : {}}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ClaySelect<T extends { id: number; name: string }>({ label, placeholder, items, value, onChange, accentColor }: { label: string; placeholder: string; items: T[]; value: number | null; onChange: (id: number) => void; accentColor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} className="w-full appearance-none rounded-2xl px-4 py-3 text-[14px] font-semibold text-slate-700 bg-cream-bg outline-none cursor-pointer font-fredoka transition-all" style={{ boxShadow: 'inset 3px 3px 8px rgba(17,24,39,0.07), inset -3px -3px 8px rgba(255,255,255,0.80)', border: `2px solid ${value ? accentColor + '60' : 'transparent'}` }}>
          <option value="" disabled>{placeholder}</option>
          {items.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}

function PriceDisplay({ label, value, accentColor, highlight }: { label: string; value: string; accentColor: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <div className={cn("rounded-2xl px-4 py-3 text-[14px] font-bold text-slate-700 bg-cream-bg transition-all duration-500 min-h-[48px] flex items-center", highlight && "text-emerald-600 ring-2 ring-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]")} style={{ boxShadow: 'inset 3px 3px 8px rgba(17,24,39,0.07), inset -3px -3px 8px rgba(255,255,255,0.80)', border: `2px solid ${accentColor}60` }}>
        {value || '0 ₫'}
      </div>
    </div>
  )
}

function ImeiCounter({ count, hasDuplicates }: { count: number; hasDuplicates: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-2xl px-4 py-2 transition-all', hasDuplicates ? 'bg-rose-50' : 'bg-cream-bg')} style={{ boxShadow: hasDuplicates ? 'inset 3px 3px 6px rgba(220,38,38,0.08), inset -3px -3px 6px rgba(255,255,255,0.80)' : 'inset 3px 3px 6px rgba(17,24,39,0.06), inset -3px -3px 6px rgba(255,255,255,0.80)' }}>
      <ScanLine className={cn('w-4 h-4', hasDuplicates ? 'text-rose-400' : 'text-slate-400')} />
      <span className="text-[28px] font-bold leading-none" style={{ color: hasDuplicates ? '#f87171' : '#E0C3FC' }}>{count}</span>
      <span className="text-[11px] text-slate-400 font-semibold leading-tight">mã<br />IMEI</span>
      {hasDuplicates && <span className="ml-1 flex items-center gap-1 text-[11px] font-bold text-rose-500"><AlertTriangle className="w-3" />Trùng!</span>}
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(17,24,39,0.06)', boxShadow: 'inset 2px 2px 5px rgba(17,24,39,0.08), inset -2px -2px 5px rgba(255,255,255,0.7)' }}>
      <div className="h-full rounded-full transition-all duration-300 relative overflow-hidden" style={{ width: `${value}%`, background: 'linear-gradient(90deg, #B2F2BB, #64D87A)', boxShadow: '0 2px 6px rgba(100,216,122,0.4)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 1.8s linear infinite', backgroundSize: '200% 100%' }} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: HubStatus }) {
  if (status.kind === 'idle') return null
  if (status.kind === 'submitting') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between"><span className="text-[13px] font-semibold text-slate-600">Đang xử lý giao dịch...</span><span className="text-[13px] font-bold text-slate-800">{status.progress}%</span></div>
        <ProgressBar value={status.progress} />
      </div>
    )
  }
  if (status.kind === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-mint-clay/30" style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 16px rgba(17,24,39,0.08)' }}>
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span className="text-[13px] font-semibold text-emerald-700">{status.message}</span>
      </div>
    )
  }
  if (status.kind === 'error') {
    return (
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-rose-50" style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 16px rgba(17,24,39,0.06)' }}>
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /><span className="text-[13px] font-semibold text-rose-600">{status.message}</span>
      </div>
    )
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// HubPresenter — Pure Rendering Component
// ─────────────────────────────────────────────────────────────

import { ArrowRightLeft } from 'lucide-react'

interface HubPresenterProps {
  mode: HubMode; warehouseName: string; rows: ScannedRow[]; duplicates: Set<string>; status: HubStatus; selectedSupplierId: number | null; selectedCustomerId: number | null; selectedDestWarehouseId: number | null; availableDestWarehouses: any[]; suppliers: any[]; customers: any[]; totalValue: string; onModeChange: (m: HubMode) => void; onSupplierChange: (id: number) => void; onCustomerChange: (id: number) => void; onDestWarehouseChange: (id: number) => void; onConfirm: () => void; onClear: () => void; isShaking: boolean; onFileUpload: (file: File) => void; onRemoveRow: (id: string) => void
}

function HubPresenter({ mode, warehouseName, rows, duplicates, status, selectedSupplierId, selectedCustomerId, selectedDestWarehouseId, availableDestWarehouses, suppliers, customers, totalValue, onModeChange, onSupplierChange, onCustomerChange, onDestWarehouseChange, onConfirm, onClear, isShaking, onFileUpload, onRemoveRow }: HubPresenterProps) {
  const isInbound = mode === 'INBOUND'
  const isOutbound = mode === 'OUTBOUND'
  const isTransfer = mode === 'TRANSFER'
  const accentColor = isInbound ? '#B2F2BB' : isOutbound ? '#FFD1DC' : '#E0C3FC'
  const accentBg = isInbound ? 'bg-mint-clay' : isOutbound ? 'bg-pink-clay' : 'bg-lilac-clay'
  const ModeIcon = isInbound ? PackagePlus : isOutbound ? ClipboardList : ArrowRightLeft
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasDuplicates = duplicates.size > 0
  const imeiCount = rows.length
  const isReady = imeiCount > 0 && !hasDuplicates && (isInbound ? !!selectedSupplierId : isOutbound ? !!selectedCustomerId : !!selectedDestWarehouseId) && status.kind !== 'submitting'

  return (
    <div className="relative flex flex-col gap-6 rounded-[40px] p-6 bg-cream-bg transition-all duration-500" style={{ boxShadow: '12px 12px 24px #e0ddd7, -12px -12px 24px #ffffff', border: `2px solid ${accentColor}40`, width: '100%', maxWidth: '1120px', margin: '0 auto' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', accentBg)} style={{ boxShadow: `-4px -4px 10px rgba(255,255,255,0.95), 6px 8px 18px rgba(17,24,39,0.12)` }}>
            <ModeIcon className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Trung Tâm Vận Hành</p>
            <h2 className="text-[20px] font-bold text-slate-900 leading-snug">{warehouseName}</h2>
          </div>
        </div>
        <ModeSwitcher mode={mode} onChange={onModeChange} />
      </div>

      <div className="h-px w-full rounded-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent, ${accentColor})` }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isInbound && (
          <>
            <ClaySelect label="Nhà cung cấp" placeholder="— Chọn nhà cung cấp —" items={suppliers.map(s => ({ id: s.id, name: s.company_name || s.name || '' }))} value={selectedSupplierId} onChange={onSupplierChange} accentColor={accentColor} />
            <PriceDisplay label="Tổng tiền nhập kho (₫)" value={totalValue} accentColor={accentColor} highlight={imeiCount > 0} />
          </>
        )}
        {isOutbound && (
          <>
            <ClaySelect label="Khách hàng" placeholder="— Chọn khách hàng —" items={customers.map(c => ({ id: c.id, name: c.full_name || c.name || '' }))} value={selectedCustomerId} onChange={onCustomerChange} accentColor={accentColor} />
            <PriceDisplay label="Tổng tiền xuất kho (₫)" value={totalValue} accentColor={accentColor} highlight={imeiCount > 0} />
          </>
        )}
        {isTransfer && (
          <>
            <ClaySelect label="Kho đích" placeholder="— Chọn kho đích —" items={availableDestWarehouses} value={selectedDestWarehouseId} onChange={onDestWarehouseChange} accentColor={accentColor} />
            <PriceDisplay label="Tổng số lượng (IMEI)" value={`${imeiCount}`} accentColor={accentColor} highlight={imeiCount > 0} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center"><Coins className="w-4 h-4 text-emerald-600" /></div>
             <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Danh Mục Đối Soát Dữ Liệu</span>
          </div>
          <div className="flex items-center gap-2">
             <ImeiCounter count={imeiCount} hasDuplicates={hasDuplicates} />
             {imeiCount > 0 && <button onClick={onClear} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all active:scale-95" style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 4px 5px 12px rgba(17,24,39,0.08)' }}><X className="w-4 h-4" /></button>}
          </div>
        </div>

        <div className={cn('relative rounded-[32px] overflow-hidden group transition-all duration-500 bg-cream-bg border-2 border-transparent h-[340px]', isShaking && 'animate-shake', imeiCount > 0 && `border-${isInbound ? 'emerald' : isOutbound ? 'pink' : 'purple'}-100`)} style={{ boxShadow: 'inset 10px 10px 20px rgba(0,0,0,0.04), inset -10px -10px 20px rgba(255,255,255,0.6)' }}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-scan-fast z-30" />
          
          <div className="h-full overflow-y-auto p-4 pt-12 custom-scrollbar">
            {imeiCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                <div className="w-16 h-16 rounded-3xl bg-slate-200 flex items-center justify-center"><FileDigit className="w-8 h-8 text-slate-400" /></div>
                <p className="text-[13px] font-medium text-slate-400 text-center">Sẵn sàng nhập dữ liệu.<br/>Vui lòng chọn nút "NHẬP FILE" phía trên.</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-fredoka">
                    <th className="px-4 pb-2">Model Sản Phẩm</th>
                    <th className="px-4 pb-2">Giá Đơn Vị</th>
                    <th className="px-4 pb-2">Mã IMEI / Serial</th>
                    <th className="px-4 pb-2 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {rows.map((row) => (
                    <tr key={row.id} className="group/row animate-in fade-in slide-in-from-left-2 duration-300">
                      <td className="bg-white/40 rounded-l-2xl px-4 py-3 font-bold text-slate-700">{row.productName}</td>
                      <td className="bg-white/40 px-4 py-3 font-mono font-bold text-slate-600">{row.price.toLocaleString()} ₫</td>
                      <td className="bg-white/40 px-4 py-3 font-mono text-slate-500">
                        <span className={cn(duplicates.has(row.imei) ? 'text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-lg' : '')}>{row.imei}</span>
                      </td>
                      <td className="bg-white/40 rounded-r-2xl px-4 py-3 text-right">
                        <button onClick={() => onRemoveRow(row.id)} className="opacity-0 group-hover/row:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-300"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="absolute top-4 right-6 z-20 flex gap-2">
             <input type="file" ref={fileInputRef} hidden accept=".csv,.txt" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileUpload(file); }} />
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-[12px] font-bold text-white hover:scale-105 active:scale-95 transition-all shadow-xl">
               <FileSpreadsheet className="w-4 h-4 text-emerald-400" />NHẬP FILE CSV
             </button>
          </div>
          <div className="absolute top-5 left-6 pointer-events-none opacity-20"><Scan className="w-5 h-5 text-slate-600" /></div>
          
          {imeiCount > 0 && !hasDuplicates && (
            <div className="absolute bottom-5 right-6 flex items-center gap-1.5 rounded-full px-4 py-1.5 animate-bounce-subtle z-20" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '4px 6px 15px rgba(17,24,39,0.08), inset 0 1px 0 rgba(255,255,255,1)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-[11px] font-bold text-slate-700">Digital Verified</span>
            </div>
          )}
        </div>
      </div>

      <StatusBadge status={status} />

      <button onClick={onConfirm} disabled={!isReady} className={cn('relative w-full rounded-full py-4 flex items-center justify-center gap-2.5', 'text-[15px] font-bold text-slate-800', 'transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed', accentBg)} style={{ boxShadow: isReady ? `-6px -6px 14px rgba(255,255,255,0.95), 10px 14px 28px rgba(17,24,39,0.12), inset 0 1px 0 rgba(255,255,255,0.8)` : 'none' }}>
        {status.kind === 'submitting' ? <><Sparkles className="w-5 h-5 animate-spin" />Vạn vật đang đồng bộ...</> : <><Zap className="w-5 h-5" />{isInbound ? `Khai báo Bulk Inbound (${imeiCount})` : isOutbound ? `Xác nhận Bulk Outbound (${imeiCount})` : `Thực hiện Điều chuyển (${imeiCount})`}</>}
      </button>

      <div className="absolute top-5 right-5 w-3 h-3 rounded-full opacity-60 animate-pulse" style={{ background: accentColor }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// WarehouseOperationsHub — Container
// ─────────────────────────────────────────────────────────────

export default function WarehouseOperationsHub() {
  const { selectedWarehouseId, availableWarehouses } = useWarehouseStore()
  const { suppliers, customers, fetchPartners } = usePartnerStore()
  const warehouseName = useMemo(() => {
    if (!selectedWarehouseId) return 'Chưa chọn kho'
    return availableWarehouses.find((w) => w.id === selectedWarehouseId)?.name ?? 'Kho không tồn tại'
  }, [selectedWarehouseId, availableWarehouses])

  const [mode, setMode] = useState<HubMode>('INBOUND')
  const [rows, setRows] = useState<ScannedRow[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [selectedDestWarehouseId, setSelectedDestWarehouseId] = useState<number | null>(null)
  const [status, setStatus] = useState<HubStatus>({ kind: 'idle' })
  const [isShaking, setIsShaking] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<ApiProduct[]>([])
  const [realSuppliers, setRealSuppliers] = useState<Supplier[]>([])

  // Load master data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, options] = await Promise.all([
           productApiService.getProducts({ page: 1, limit: 1000 }), // Get all models
           productApiService.getFormOptions()
        ]);
        setAvailableProducts(productsRes.data);
      } catch (err) {
        console.error("Failed to load master data", err);
      }
    };
    loadData();
    fetchPartners(); // fetch real suppliers and customers
  }, []);

  const duplicates = useMemo(() => findDuplicates(rows), [rows])
  const imeiCount = rows.length
  
  const totalValueRaw = useMemo(() => {
     return rows.reduce((sum, r) => sum + r.price, 0);
  }, [rows]);

  const totalValueFormatted = useMemo(() => {
     if (totalValueRaw === 0) return '0 ₫';
     return totalValueRaw.toLocaleString() + ' ₫';
  }, [totalValueRaw]);

  const handleModeChange = useCallback((m: HubMode) => {
    setMode(m); setRows([]); setSelectedSupplierId(null); setSelectedCustomerId(null); setSelectedDestWarehouseId(null); setStatus({ kind: 'idle' }); setIsShaking(false)
  }, [])

  const simulateSubmit = useCallback(() => {
    setStatus({ kind: 'submitting', progress: 0 })
    let prog = 0
    const timer = setInterval(() => {
      prog += Math.random() * 22 + 8
      if (prog >= 100) {
        const verb = mode === 'INBOUND' ? 'Nhập' : 'Xuất'
        clearInterval(timer); setStatus({ kind: 'success', message: `${verb} kho thành công! Tổng trị giá ${totalValueFormatted} đã được ghi nhận.` })
        setTimeout(() => { setRows([]); setStatus({ kind: 'idle' }); }, 3000)
      } else {
        setStatus({ kind: 'submitting', progress: Math.min(Math.round(prog), 99) })
      }
    }, 200)
  }, [totalValueFormatted, mode])

  const handleConfirm = async () => {
    if (!selectedWarehouseId) {
      setStatus({ kind: 'error', message: 'Vui lòng chọn kho trước khi thực hiện.' });
      return;
    }
    if (imeiCount === 0) { 
       setStatus({ kind: 'error', message: 'Chưa có dữ liệu để xử lý.' }); 
       return; 
    }
    if (duplicates.size > 0) { 
       setStatus({ kind: 'error', message: 'Vui lòng xóa các mã IMEI bị trùng.' }); 
       setIsShaking(true); 
       setTimeout(() => setIsShaking(false), 600); 
       return; 
    }

    setStatus({ kind: 'submitting', progress: 10 });

    try {
      // Group rows by product to match backend structure
      const groupedItems = rows.reduce((acc: any, row) => {
        // Try to find real productId by name match
        const matchingProduct = availableProducts.find(p => 
           p.name.toLowerCase() === row.productName.toLowerCase() ||
           p.sku.toLowerCase() === row.productName.toLowerCase() // sometimes name is SKU in CSV
        );
        
        if (!matchingProduct) {
           throw new Error(`Sản phẩm "${row.productName}" không tồn tại trong hệ thống. Hãy đăng ký nó trước.`);
        }

        const pId = matchingProduct.id;
        if (!acc[pId]) {
           acc[pId] = { productId: pId, price: row.price, imeiList: [] };
        }
        acc[pId].imeiList.push(row.imei);
        return acc;
      }, {});

      const itemsArray = Object.values(groupedItems);
      setStatus({ kind: 'submitting', progress: 40 });

      if (mode === 'INBOUND') {
         if (!selectedSupplierId) {
            setStatus({ kind: 'error', message: 'Vui lòng chọn nhà cung cấp.' });
            return;
         }
         const payload: InboundPayload = {
            supplierId: selectedSupplierId,
            warehouseId: selectedWarehouseId,
            notes: `Nhập kho lô hàng ${imeiCount} sản phẩm từ UI Hub`,
            items: itemsArray.map((i: any) => ({
               productId: i.productId,
               unitPrice: i.price,
               imeiList: i.imeiList
            }))
         };
         await transactionApiService.createInbound(payload);
      } else if (mode === 'OUTBOUND') {
         if (!selectedCustomerId) {
            setStatus({ kind: 'error', message: 'Vui lòng chọn khách hàng.' });
            return;
         }
         const payload: OutboundPayload = {
            customerId: selectedCustomerId,
            warehouseId: selectedWarehouseId,
            notes: `Xuất kho lô hàng ${imeiCount} sản phẩm cho khách`,
            items: itemsArray.map((i: any) => ({
               productId: i.productId,
               sellingPrice: i.price,
               imeiList: i.imeiList
            }))
         };
         await transactionApiService.createOutbound(payload);
      } else if (mode === 'TRANSFER') {
         if (!selectedDestWarehouseId) {
            setStatus({ kind: 'error', message: 'Vui lòng chọn kho đích.' });
            return;
         }
         const payload = {
            sourceWarehouseId: selectedWarehouseId,
            destWarehouseId: selectedDestWarehouseId,
            notes: `Điều chuyển ${imeiCount} sản phẩm từ kho #${selectedWarehouseId} sang kho #${selectedDestWarehouseId}`,
            items: itemsArray.map((i: any) => ({
               productId: i.productId,
               imeiList: i.imeiList
            }))
         };
         await transactionApiService.createTransfer(payload);
      }

      setStatus({ kind: 'submitting', progress: 100 });
      setStatus({ kind: 'success', message: `${mode === 'INBOUND' ? 'Nhập' : mode === 'OUTBOUND' ? 'Xuất' : 'Điều chuyển'} kho thành công! Dữ liệu đã được lưu vào hệ thống.` });
      setTimeout(() => { setRows([]); setStatus({ kind: 'idle' }); }, 3000);

    } catch (err: any) {
      setStatus({ kind: 'error', message: err.message || 'Có lỗi xảy ra khi xử lý giao dịch.' });
    }
  };

  const handleClear = useCallback(() => {
    setRows([]); setStatus({ kind: 'idle' }); setIsShaking(false);
  }, [])

  const handleRemoveRow = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }, [])

  return (
    <HubPresenter
      mode={mode} warehouseName={warehouseName} rows={rows} duplicates={duplicates} status={status} selectedSupplierId={selectedSupplierId} selectedCustomerId={selectedCustomerId} selectedDestWarehouseId={selectedDestWarehouseId} availableDestWarehouses={availableWarehouses.filter(w => w.id !== selectedWarehouseId)} suppliers={suppliers} customers={customers} totalValue={totalValueFormatted} onModeChange={handleModeChange} onSupplierChange={setSelectedSupplierId} onCustomerChange={setSelectedCustomerId} onDestWarehouseChange={setSelectedDestWarehouseId} onConfirm={handleConfirm} onClear={handleClear} isShaking={isShaking} onRemoveRow={handleRemoveRow}
      onFileUpload={(file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const csvRows = content.split(/\r?\n/).map(r => r.split(',').map(c => c.trim())).filter(r => r.length > 0 && r[0] !== '');
          if (csvRows.length === 0) return;

          const header = csvRows[0].map(h => h.toLowerCase());
          const nameIdx = header.findIndex(h => h.includes('name') || h.includes('tên'));
          const priceIdx = header.findIndex(h => h.includes('price') || h.includes('giá'));
          const imeiIdx = header.findIndex(h => h.includes('imei') || h.includes('serial') || h.includes('sample'));

          const tNameIdx = nameIdx !== -1 ? nameIdx : 0;
          const tPriceIdx = priceIdx !== -1 ? priceIdx : 3;
          const tImeiIdx = imeiIdx !== -1 ? imeiIdx : csvRows[0].length - 1;

          const newScannedRows: ScannedRow[] = [];
          
          csvRows.forEach((row, idx) => {
            const isHeader = row.some(cell => {
               const c = cell.toLowerCase();
               return c === 'imei' || c === 'sku' || c === 'price' || c === 'tên sản phẩm' || c === 'product name';
            });
            if (isHeader && idx === 0) return;
            
            const name = row[tNameIdx] || 'Sản phẩm không tên';
            const price = parseInt(row[tPriceIdx]?.replace(/\D/g, '') || '0', 10);
            const imei = row[tImeiIdx];
            
            if (imei) {
              newScannedRows.push({
                id: Math.random().toString(36).substr(2, 9),
                productName: name,
                price: price,
                imei: imei
              });
            }
          });

          setRows(prev => [...prev, ...newScannedRows]);
          if (newScannedRows.some(r => duplicates.has(r.imei))) {
             setIsShaking(true); setTimeout(() => setIsShaking(false), 600);
          }
        };
        reader.readAsText(file);
      }}
    />
  )
}
