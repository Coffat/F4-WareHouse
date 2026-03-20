import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  Package,
  PackageSearch,
  Plus,
  Settings,
  Truck,
  Warehouse,
} from 'lucide-react'

import Header from '../components/common/Header'
import WarehouseModal from '../components/common/WarehouseModal'
import WarehouseOperationsHub from '../components/warehouse-hub/WarehouseOperationsHub'

function NavIcon({ active, label, children, onClick }: { active?: boolean; label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
        active ? 'bg-mint-clay text-slate-800' : 'bg-cream-bg text-slate-500 hover:text-slate-700'
      }`}
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

export default function Operations() {
  const [warehouseModal, setWarehouseModal] = useState<{ open: boolean; tab: 'select' | 'create' }>({ open: false, tab: 'select' })

  return (
    <div className="min-h-screen font-fredoka bg-cream-bg">
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="shrink-0">
            <div
              className="w-[72px] rounded-[36px] bg-cream-bg px-3 py-5 flex flex-col items-center gap-5"
              style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.95), 12px 16px 36px rgba(17,24,39,0.10)' }}
            >
              <Link
                to="/"
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-mint-clay to-emerald-300 flex items-center justify-center font-bold text-slate-800 text-sm"
                style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.14)' }}
              >
                F4
              </Link>
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <Link to="/"><NavIcon label="Dashboard"><LayoutDashboard className="w-5 h-5" /></NavIcon></Link>
              <Link to="/operations"><NavIcon label="Vận hành" active><Warehouse className="w-5 h-5" /></NavIcon></Link>
              <Link to="/products"><NavIcon label="Sản phẩm"><Package className="w-5 h-5" /></NavIcon></Link>
              <NavIcon label="Vận chuyển"><Truck className="w-5 h-5" /></NavIcon>
              <NavIcon label="Tìm kiếm"><PackageSearch className="w-5 h-5" /></NavIcon>
              <div className="flex-1" />
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Cài đặt"><Settings className="w-5 h-5" /></NavIcon>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Unified Top Header — Claymorphism Edition */}
            <Header
              title="Vận Hành Tổng Thể"
              subtitle="Thực hiện các thao tác Nhập/Xuất kho hàng loạt bằng mã IMEI."
              actions={{
                secondary: {
                  label: "Chọn Kho",
                  icon: <Home className="w-4 h-4 text-[#F43F5E]" />,
                  color: "#F43F5E",
                  bgColor: "bg-[#FFE4E9]",
                  onClick: () => setWarehouseModal({ open: true, tab: 'select' })
                },
                primary: {
                  label: "Nhập Kho Mới",
                  icon: <Plus className="w-4 h-4 text-[#10B981]" />,
                  color: "#10B981",
                  bgColor: "bg-[#DCFCE7]",
                  onClick: () => setWarehouseModal({ open: true, tab: 'create' })
                }
              }}
              userInitials="VT"
            />


            <div className="max-w-[1200px] mx-auto">
              <WarehouseOperationsHub />
            </div>
          </main>
        </div>
      </div>

      <WarehouseModal 
        isOpen={warehouseModal.open} 
        onClose={() => setWarehouseModal(prev => ({ ...prev, open: false }))} 
        defaultTab={warehouseModal.tab} 
      />
    </div>
  )
}
