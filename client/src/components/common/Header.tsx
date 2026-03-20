import React from 'react'
import { Bell, LucideIcon, Search } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.ReactNode
  iconBg?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'pill' | 'bubble'
}

function ActionButton({ icon, iconBg, children, className, onClick, variant = 'pill' }: ActionButtonProps) {
  const isBubble = variant === 'bubble'
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative h-11 rounded-full px-5 text-[13px] font-bold inline-flex items-center gap-2.5 transition-all active:scale-90 hover:-translate-y-1 group overflow-hidden',
        isBubble ? 'animate-bounce-subtle py-1' : 'hover:scale-105',
        className
      )}
      style={{ 
        boxShadow: isBubble 
          ? '-10px -10px 20px rgba(255,255,255,0.9), 12px 16px 30px rgba(17,24,39,0.15), inset 6px 6px 14px rgba(255,255,255,0.8), inset -6px -6px 14px rgba(0,0,0,0.05)'
          : '-6px -6px 14px rgba(255,255,255,0.95), 10px 14px 28px rgba(17,24,39,0.12), inset 0px 1px 0px rgba(255,255,255,0.6)',
        background: isBubble 
          ? `linear-gradient(135deg, ${className?.includes('bg-[#DCFCE7]') ? '#DCFCE7' : '#FFE4E9'} 0%, ${className?.includes('bg-[#DCFCE7]') ? '#A7F3D0' : '#FDA4AF'} 100%)`
          : undefined
      }}
    >
      {/* Glossy overlay for bubble effect */}
      {isBubble && (
        <div className="absolute top-1 left-2 w-1/2 h-1/3 bg-white/40 rounded-full blur-[2px] pointer-events-none" />
      )}
      
      {/* Shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer-fast pointer-events-none" />

      {icon && (
        <span
          className={cn('w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 z-10', iconBg ?? 'bg-white')}
          style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.4), inset -2px -2px 5px rgba(0,0,0,0.05)' }}
        >
          {icon}
        </span>
      )}
      <span className="leading-none whitespace-nowrap z-10">{children}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Header Component
// ─────────────────────────────────────────────────────────────

interface ActionConfig {
  label: string
  icon: React.ReactNode
  color: string // e.g. "#F43F5E"
  bgColor: string // e.g. "bg-[#FFE4E9]"
  onClick?: () => void
  variant?: 'pill' | 'bubble'
}

interface HeaderProps {
  title: string
  subtitle?: React.ReactNode
  showSearch?: boolean
  searchPlaceholder?: string
  onSearchChange?: (val: string) => void
  // Unified actions for more flexibility
  actions?: {
    primary?: ActionConfig
    secondary?: ActionConfig
  }
  userInitials?: string
}

export default function Header({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = "Tìm kiếm nhanh...",
  onSearchChange,
  actions,
  userInitials = "VT"
}: HeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Left: Title & Subtitle */}
      <div className="flex flex-col items-start">
        <div 
          className="text-[10px] font-bold text-slate-400 bg-white rounded-full px-3 py-1 uppercase tracking-widest mb-2"
          style={{ boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 3px 4px 10px rgba(17,24,39,0.07)' }}
        >
          F4 Ecosystem
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
        {subtitle && (
          <div className="text-[13px] text-slate-500 mt-1.5 flex flex-col sm:flex-row sm:items-center gap-2">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        {showSearch && (
          <div
            className="hidden xl:flex items-center gap-3 rounded-full bg-white px-5 py-3 w-[260px] transition-all focus-within:ring-2 focus-within:ring-purple-200"
            style={{ boxShadow: 'inset 4px 4px 10px rgba(17,24,39,0.06), inset -4px -4px 10px rgba(255,255,255,0.8)' }}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              className="w-full bg-transparent outline-none text-[14px] text-slate-700 placeholder:text-slate-400 font-medium font-fredoka"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {actions?.secondary && (
            <ActionButton
              onClick={actions.secondary.onClick}
              className={actions.secondary.bgColor}
              icon={actions.secondary.icon}
              variant={actions.secondary.variant}
            >
              {actions.secondary.label}
            </ActionButton>
          )}

          {actions?.primary && (
            <ActionButton
              onClick={actions.primary.onClick}
              className={actions.primary.bgColor}
              icon={actions.primary.icon}
              variant={actions.primary.variant}
            >
              {actions.primary.label}
            </ActionButton>
          )}
        </div>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200/60 ml-1">
          <button
            className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all active:scale-90 hover:shadow-xl"
            style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 20px rgba(17,24,39,0.08)' }}
          >
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#FB7185] ring-4 ring-white shadow-sm" />
          </button>

          <button
            className="w-12 h-12 rounded-full bg-[#E0C3FC] flex items-center justify-center transition-all active:scale-90 hover:shadow-xl text-[15px] font-black text-slate-800"
            style={{ 
              boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 20px rgba(17,24,39,0.12), inset 0 2px 4px rgba(255,255,255,0.5)' 
            }}
          >
            {userInitials}
          </button>
        </div>
      </div>
    </header>
  )
}
