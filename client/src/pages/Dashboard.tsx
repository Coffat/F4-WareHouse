import React, { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Bell,
  Box,
  ChevronRight,
  Headphones,
  Home,
  LayoutDashboard,
  Package,
  PackageSearch,
  Plus,
  Search,
  Settings,
  Smartphone,
  Truck,
  Warehouse,
  Zap,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ActivityType = 'CHU KỲ LẤY HÀNG' | 'ĐANG BỔ SUNG' | 'ĐANG KIỂM KÊ' | 'NHẬP HÀNG'

type TransactionEntity = {
  id: string
  actorName: string
  actorTag: string
  actorBg: string
  activityType: ActivityType
  activityBg: string
  activityText: string
  location: string
  progressPct: number
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// ─────────────────────────────────────────────
// Rounded Bar Shape (pill/jelly top)
// ─────────────────────────────────────────────
function RoundedBar(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
}) {
  const { x, y, width, height, fill } = props
  if (x == null || y == null || width == null || height == null || height <= 0) return null
  const r = Math.min(width / 2, 20)
  return (
    <path
      d={[
        `M ${x} ${y + height}`,
        `L ${x} ${y + r}`,
        `Q ${x} ${y} ${x + r} ${y}`,
        `L ${x + width - r} ${y}`,
        `Q ${x + width} ${y} ${x + width} ${y + r}`,
        `L ${x + width} ${y + height}`,
        'Z',
      ].join(' ')}
      fill={fill}
      style={{ filter: 'drop-shadow(0 -4px 8px rgba(0,0,0,0.08))' }}
    />
  )
}

// ─────────────────────────────────────────────
// Progress Bar – candy pill shape
// ─────────────────────────────────────────────
function ProgressBar({
  value,
  colorClass,
  height = 'h-2.5',
}: {
  value: number
  colorClass: string
  height?: string
}) {
  const v = clamp(value, 0, 100)
  return (
    <div
      className={cn('w-full rounded-full overflow-hidden bg-white/50', height)}
      style={{ boxShadow: 'inset 2px 2px 5px rgba(17,24,39,0.08), inset -2px -2px 5px rgba(255,255,255,0.7)' }}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-700', colorClass)}
        style={{ width: `${v}%`, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// ClayCard wrapper
// ─────────────────────────────────────────────
function ClayCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('rounded-card p-6', className)}
      style={{
        boxShadow:
          '-10px -10px 24px rgba(255,255,255,0.95), 16px 20px 40px rgba(17,24,39,0.11), inset 0px 1px 0px rgba(255,255,255,0.92)',
      }}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// PillButton
// ─────────────────────────────────────────────
function PillButton({
  icon,
  iconBg,
  children,
  className,
}: {
  icon?: React.ReactNode
  iconBg?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      className={cn(
        'h-10 rounded-full px-4 text-[13px] font-semibold inline-flex items-center gap-2 transition-all active:scale-95',
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
// NavIcon
// ─────────────────────────────────────────────
function NavIcon({ active, label, children }: { active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className={cn(
        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95',
        active ? 'bg-lilac-clay text-slate-800' : 'bg-cream-bg text-slate-500 hover:text-slate-700',
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
// ActivityTag
// ─────────────────────────────────────────────
function ActivityTag({ label, bg, textColor }: { label: string; bg: string; textColor: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap',
        bg,
        textColor,
      )}
      style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.8), 3px 4px 10px rgba(17,24,39,0.08)' }}
    >
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────
// TxnRow
// ─────────────────────────────────────────────
function TxnRow({ txn }: { txn: TransactionEntity }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 py-3">
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-800 shrink-0', txn.actorBg)}
          style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 4px 5px 12px rgba(17,24,39,0.10)' }}
        >
          {txn.actorTag}
        </div>
        <p className="text-sm font-semibold text-slate-800 leading-tight">{txn.actorName}</p>
      </div>
      <div className="col-span-3">
        <ActivityTag label={txn.activityType} bg={txn.activityBg} textColor={txn.activityText} />
      </div>
      <div className="col-span-3">
        <p className="text-sm font-medium text-slate-700">{txn.location}</p>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar value={txn.progressPct} colorClass="bg-slate-800" height="h-2" />
        </div>
        <span className="text-[12px] font-bold text-slate-800 w-8 text-right shrink-0">{txn.progressPct}%</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ProductStockCard
// ─────────────────────────────────────────────
function ProductStockCard({
  icon,
  iconBg,
  title,
  sub,
  progressColor,
  progressValue,
  stockCount,
  soldCount,
  note,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  sub: string
  progressColor: string
  progressValue: number
  stockCount: string
  soldCount: string
  note: string
}) {
  return (
    <div
      className="rounded-card2 bg-pink-clay/55 p-5 h-full"
      style={{
        boxShadow:
          '-8px -8px 20px rgba(255,255,255,0.92), 12px 16px 34px rgba(17,24,39,0.10), inset 0px 1px 0px rgba(255,255,255,0.90)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', iconBg)}
          style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)' }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[15px] font-bold text-slate-900 leading-tight">{title}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={progressValue} colorClass={progressColor} height="h-2.5" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-none">{stockCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">máy</p>
        </div>
        <div className="w-px h-8 bg-slate-300/60" />
        <div>
          <p className="text-2xl font-bold text-pink-500 leading-none">{soldCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">đã bán</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 leading-snug">{note}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function Dashboard() {
  const chartData = useMemo(
    () => [
      { day: 'T2', v: 38, fill: 'rgba(178,242,187,0.55)' },
      { day: 'T3', v: 56, fill: 'rgba(255,180,195,0.65)' },
      { day: 'T4', v: 48, fill: 'rgba(200,168,240,0.65)' },
      { day: 'T5', v: 92, fill: 'rgba(100,220,120,0.92)' },
      { day: 'T6', v: 62, fill: 'rgba(255,190,200,0.60)' },
      { day: 'T7', v: 74, fill: 'rgba(196,155,252,0.75)' },
      { day: 'CN', v: 28, fill: 'rgba(178,242,187,0.50)' },
    ],
    [],
  )

  const transactions: TransactionEntity[] = useMemo(
    () => [
      {
        id: 't1',
        actorName: 'Agent Smith',
        actorTag: 'AG',
        actorBg: 'bg-mint-clay',
        activityType: 'CHU KỲ LẤY HÀNG',
        activityBg: 'bg-pink-clay/70',
        activityText: 'text-rose-700',
        location: 'Dãy B, Ô 14',
        progressPct: 75,
      },
      {
        id: 't2',
        actorName: 'Bot-900',
        actorTag: 'BT',
        actorBg: 'bg-lilac-clay',
        activityType: 'ĐANG BỔ SUNG',
        activityBg: 'bg-lilac-clay/60',
        activityText: 'text-purple-700',
        location: 'Dock-B-Inbound',
        progressPct: 22,
      },
      {
        id: 't3',
        actorName: 'Ops Team',
        actorTag: 'OP',
        actorBg: 'bg-sky-clay',
        activityType: 'ĐANG KIỂM KÊ',
        activityBg: 'bg-sky-200/60',
        activityText: 'text-blue-700',
        location: 'Aisle-9-F',
        progressPct: 48,
      },
      {
        id: 't4',
        actorName: 'Robot-X2',
        actorTag: 'RX',
        actorBg: 'bg-peach-clay',
        activityType: 'NHẬP HÀNG',
        activityBg: 'bg-orange-100',
        activityText: 'text-orange-700',
        location: 'Rack-12-G',
        progressPct: 92,
      },
    ],
    [],
  )

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
              <NavIcon label="Dashboard" active><LayoutDashboard className="w-5 h-5" /></NavIcon>
              <NavIcon label="Kho hàng"><Warehouse className="w-5 h-5" /></NavIcon>
              <NavIcon label="Sản phẩm"><Package className="w-5 h-5" /></NavIcon>
              <NavIcon label="Vận chuyển"><Truck className="w-5 h-5" /></NavIcon>
              <NavIcon label="Tìm kiếm"><PackageSearch className="w-5 h-5" /></NavIcon>
              <div className="flex-1" />
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Cài đặt"><Settings className="w-5 h-5" /></NavIcon>
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Top Nav Bar */}
            <header className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span
                  className="text-[11px] font-semibold text-slate-400 bg-white rounded-full px-3 py-1"
                  style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.07)' }}
                >
                  F4 Warehouse
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">Trung Tâm Điều Phối</h1>
                <p className="text-sm text-slate-500">
                  Theo dõi vận hành thời gian thực tại{' '}
                  <span className="font-semibold text-emerald-600 bg-mint-clay/40 px-2 py-0.5 rounded-full">
                    Khu A-12
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="hidden lg:flex items-center gap-2 rounded-full bg-white px-4 py-2.5 w-[280px]"
                  style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.95), 8px 12px 24px rgba(17,24,39,0.09)' }}
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-fredoka"
                    placeholder="Tìm kiếm nhanh..."
                  />
                </div>
                <PillButton className="bg-pink-clay/50 text-slate-800" iconBg="bg-pink-clay" icon={<Home className="w-3.5 h-3.5 text-rose-600" />}>
                  Chọn Kho
                </PillButton>
                <PillButton className="bg-mint-clay/60 text-slate-800" iconBg="bg-mint-clay" icon={<Plus className="w-3.5 h-3.5 text-emerald-700" />}>
                  Nhập Kho Mới
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

            {/* ══════════════════════════════════════════
                ROW 1: Chart (8 cols) + KPI pills (4 cols)
                items-start prevents height stretching → no whitespace
            ══════════════════════════════════════════ */}
            <div className="grid grid-cols-12 gap-5 items-start">

              {/* Ô 1 – Sức Khỏe Kho Hàng */}
              <div className="col-span-12 xl:col-span-8">
                <ClayCard className="bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[17px] font-bold text-slate-900 leading-tight">Sức Khỏe Kho Hàng</h2>
                      <p className="text-[12px] text-slate-500 mt-0.5">Chỉ số Lưu lượng &amp; Sức chứa</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="rounded-full bg-mint-clay px-3 py-1 text-[11px] font-bold text-slate-800"
                        style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.09)' }}
                      >
                        LIVE
                      </span>
                      <button
                        className="rounded-full bg-cream-bg px-3 py-1 text-[11px] font-semibold text-slate-600 transition-all active:scale-95"
                        style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.07)' }}
                      >
                        LAST 24H
                      </button>
                    </div>
                  </div>

                  {/* Jelly Bar Chart */}
                  <div className="mt-5 h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke="rgba(15,23,42,0.05)" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: 'rgba(100,116,139,1)', fontSize: 11, fontFamily: 'Fredoka' }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickCount={6}
                          tick={{ fill: 'rgba(148,163,184,1)', fontSize: 10, fontFamily: 'Fredoka' }}
                          tickFormatter={(v: number) => `${v}%`}
                          width={40}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(15,23,42,0.03)' }}
                          contentStyle={{
                            borderRadius: 16,
                            border: 'none',
                            boxShadow: '-6px -6px 14px rgba(255,255,255,0.95), 10px 14px 26px rgba(17,24,39,0.10)',
                            fontFamily: 'Fredoka',
                            fontSize: 13,
                          }}
                          labelStyle={{ fontWeight: 700, color: 'rgba(15,23,42,0.9)' }}
                          formatter={(v: unknown) => [`${v}%`, 'Lưu lượng']}
                        />
                        <Bar dataKey="v" shape={<RoundedBar />} radius={[12, 12, 0, 0]}>
                          {chartData.map((d) => (
                            <Cell key={d.day} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats row */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Hiệu suất', value: '84%', color: 'text-emerald-500' },
                      { label: 'Lượt lấy/giờ', value: '1.2k', color: 'text-slate-900' },
                      { label: 'Tỉ lệ lỗi', value: '0.02%', color: 'text-rose-500' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-card2 bg-cream-bg px-4 py-3 text-center"
                        style={{ boxShadow: 'inset 3px 3px 8px rgba(17,24,39,0.06), inset -3px -3px 8px rgba(255,255,255,0.80)' }}
                      >
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{s.label}</p>
                        <p className={`mt-1.5 text-[28px] font-bold leading-none ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </ClayCard>
              </div>

              {/* Ô 3 – KPI Pills (right, stacked vertically) */}
              <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
                {/* Hàng Đang Về */}
                <div
                  className="rounded-card2 bg-pink-clay/55 p-5"
                  style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.92), 12px 16px 34px rgba(17,24,39,0.10), inset 0px 1px 0px rgba(255,255,255,0.90)' }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center"
                      style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)' }}
                    >
                      <Truck className="w-5 h-5 text-slate-700 animate-float" />
                    </div>
                    <p className="text-[32px] font-bold text-slate-900 leading-none">12</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-[14px] font-bold text-slate-900">Hàng Đang Về</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">Lô hàng sẽ đến trong 2 giờ tới</p>
                  </div>
                </div>

                {/* Mật độ Lưu trữ */}
                <div
                  className="rounded-card2 bg-white p-5"
                  style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.95), 12px 16px 34px rgba(17,24,39,0.10), inset 0px 1px 0px rgba(255,255,255,0.90)' }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl bg-lilac-clay/60 flex items-center justify-center"
                      style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)' }}
                    >
                      <Warehouse className="w-5 h-5 text-slate-700" />
                    </div>
                    <p className="text-[24px] font-bold text-purple-600 leading-none">88%</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-[13px] font-bold text-slate-900">Mật độ Lưu trữ</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Mật độ cao tại Dãy-F</p>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={88} colorClass="bg-purple-400" height="h-2.5" />
                  </div>
                  <button
                    className="mt-3 w-full rounded-full bg-slate-900 text-white text-[12px] font-semibold py-2.5 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{ boxShadow: '0 4px 14px rgba(15,23,42,0.25)' }}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Tối ưu Vị trí
                  </button>
                </div>
              </div>
            </div>{/* /row1 */}

            {/* ══════════════════════════════════════════
                ROW 2: 3 Product cards equally wide
            ══════════════════════════════════════════ */}
            <div className="grid grid-cols-12 gap-5 mt-5">
              <div className="col-span-12 md:col-span-4">
                <ProductStockCard
                  icon={<Smartphone className="w-5 h-5 text-slate-700 animate-float" />}
                  iconBg="bg-white/70"
                  title="Điện thoại"
                  sub="Hàng về 12h: 5 Lô"
                  progressColor="bg-lilac-clay"
                  progressValue={72}
                  stockCount="1.250"
                  soldCount="450"
                  note="Theo dõi vận hành thời gian thực tại Khu A-12"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <ProductStockCard
                  icon={<Box className="w-5 h-5 text-slate-700 animate-float-delayed" />}
                  iconBg="bg-white/70"
                  title="Laptop"
                  sub="Hàng về 12h: 3 Lô"
                  progressColor="bg-mint-clay"
                  progressValue={58}
                  stockCount="820"
                  soldCount="310"
                  note="Mô phỏng vị trí lưu trữ thực tế trên Sơ đồ 3D"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <ProductStockCard
                  icon={<Headphones className="w-5 h-5 text-rose-500 animate-float" />}
                  iconBg="bg-pink-clay/60"
                  title="Phụ kiện"
                  sub="Hàng về 12h: 8 Lô"
                  progressColor="bg-pink-clay"
                  progressValue={36}
                  stockCount="3.400"
                  soldCount="1.200"
                  note="Theo dõi tồn kho Phụ kiện thời gian thực tại Khu A-12"
                />
              </div>
            </div>{/* /row2 */}

            {/* ══════════════════════════════════════════
                ROW 3: Hoạt Động Đang Diễn Ra
            ══════════════════════════════════════════ */}
            <div className="mt-5">
              <ClayCard className="bg-white">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[17px] font-bold text-slate-900">Hoạt Động Đang Diễn Ra</h3>
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                    Xem Lịch Sử Giao Dịch
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="mt-5 rounded-card2 bg-cream-bg px-5"
                  style={{ boxShadow: 'inset 3px 3px 8px rgba(17,24,39,0.06), inset -3px -3px 8px rgba(255,255,255,0.80)' }}
                >
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-3 pt-4 pb-3 border-b border-slate-200/50">
                    <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Nhân sự / Robot</div>
                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Loại hoạt động</div>
                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Vị trí</div>
                    <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tiến độ</div>
                  </div>
                  <div className="divide-y divide-slate-200/40">
                    {transactions.map((t) => (
                      <TxnRow key={t.id} txn={t} />
                    ))}
                  </div>
                </div>
              </ClayCard>
            </div>{/* /row3 */}

          </main>
        </div>
      </div>
    </div>
  )
}
