import React, { useEffect, useState } from 'react';
import { usePartnerStore } from '../store/usePartnerStore';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Package, LayoutDashboard, Warehouse, PackageSearch, Truck, Users, Settings, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';

// ─────────────────────────────────────────────
// Helpers & CSS Constants
// ─────────────────────────────────────────────
const shadowClay = 'shadow-[12px_12px_24px_#e0ddd7,-12px_-12px_24px_#ffffff]';
const innerShadowClay = 'shadow-[inset_8px_8px_12px_rgba(255,255,255,0.5),inset_-8px_-8px_12px_rgba(0,0,0,0.05)]';
const squishyPress = 'active:scale-95 transition-transform duration-200';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
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
        active ? 'bg-[#B2F2BB] text-slate-800' : 'bg-[#FDFBF7] text-slate-500 hover:text-slate-700',
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
// PartnerFormFactory
// ─────────────────────────────────────────────
const PartnerFormFactory = ({ type, onClose, onSubmit }: { type: 'supplier' | 'customer', onClose: () => void, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    phone: '',
    email: '',
    address: '',
    customer_type: 'RETAIL',
    tax_code: '', // Mock for supplier factory pattern demonstration
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'supplier') {
      onSubmit({
        company_name: formData.company_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      });
    } else {
      onSubmit({
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        customer_type: formData.customer_type,
      });
    }
  };

  return (
    <div className={`p-8 rounded-[32px] ${innerShadowClay} bg-[#FDFBF7] w-full max-w-md mx-auto`}
      style={{ boxShadow: '-18px -18px 44px rgba(255,255,255,0.96), 28px 36px 72px rgba(17,24,39,0.16)' }}>
      <h3 className="text-2xl font-bold mb-6 text-[#4A4A4A]">Thêm mới {type === 'supplier' ? 'Nhà cung cấp' : 'Khách hàng'}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {type === 'supplier' ? (
          <>
            <input name="company_name" placeholder="Tên công ty" required onChange={handleChange} className="p-4 rounded-full border-none outline-none focus:ring-2 focus:ring-[#B2F2BB] bg-[#FDFBF7]" style={{ boxShadow: innerShadowClay }} />
            <input name="tax_code" placeholder="Mã số thuế" onChange={handleChange} className="p-4 rounded-full border-none outline-none focus:ring-2 focus:ring-[#B2F2BB] bg-[#FDFBF7]" style={{ boxShadow: innerShadowClay }} />
          </>
        ) : (
          <>
            <input name="full_name" placeholder="Họ tên" required onChange={handleChange} className="p-4 rounded-full border-none outline-none focus:ring-2 focus:ring-[#FFD1DC] bg-[#FDFBF7]" style={{ boxShadow: innerShadowClay }} />
            <select name="customer_type" onChange={handleChange} className="p-4 rounded-full border-none outline-none focus:ring-2 focus:ring-[#FFD1DC] bg-[#FDFBF7] cursor-pointer" style={{ boxShadow: innerShadowClay }}>
              <option value="RETAIL">Khách hàng Bán Lẻ</option>
              <option value="WHOLESALE">Khách hàng Bán Buôn</option>
            </select>
          </>
        )}
        <input name="phone" placeholder="Số điện thoại" required onChange={handleChange} className={`p-4 rounded-full border-none outline-none focus:ring-2 ${type==='supplier'?'focus:ring-[#B2F2BB]':'focus:ring-[#FFD1DC]'} bg-[#FDFBF7]`} style={{ boxShadow: innerShadowClay }} />
        <input name="email" type="email" placeholder="Email (Tùy chọn)" onChange={handleChange} className={`p-4 rounded-full border-none outline-none focus:ring-2 ${type==='supplier'?'focus:ring-[#B2F2BB]':'focus:ring-[#FFD1DC]'} bg-[#FDFBF7]`} style={{ boxShadow: innerShadowClay }} />
        <input name="address" placeholder="Địa chỉ (Tùy chọn)" onChange={handleChange} className={`p-4 rounded-full border-none outline-none focus:ring-2 ${type==='supplier'?'focus:ring-[#B2F2BB]':'focus:ring-[#FFD1DC]'} bg-[#FDFBF7]`} style={{ boxShadow: innerShadowClay }} />
        
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={onClose} className={`flex-1 py-4 px-6 rounded-full font-bold text-slate-600 bg-white ${squishyPress}`} style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.95), 8px 10px 22px rgba(17,24,39,0.09)' }}>
            Hủy
          </button>
          <button type="submit" className={`flex-1 py-4 px-6 rounded-full font-bold text-[#4A4A4A] bg-${type === 'supplier' ? '[#B2F2BB]' : '[#FFD1DC]'} ${squishyPress}`} style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.13)' }}>
            Lưu ngay
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function PartnerManagementPage() {
  const { suppliers, customers, isLoading, fetchPartners, addSupplier, addCustomer } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'supplier' | 'customer'>('supplier');
  const [showForm, setShowForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAdd = async (data: any) => {
    try {
      if (activeTab === 'supplier') {
        await addSupplier(data);
      } else {
        await addCustomer(data);
      }
      setShowForm(false);
    } catch (error) {
      alert("Lỗi khi thêm: " + error);
    }
  };

  const getCardColor = () => activeTab === 'supplier' ? 'bg-[#B2F2BB]' : 'bg-[#FFD1DC]';

  const dataList = activeTab === 'supplier' ? suppliers : customers;

  return (
    <div className="min-h-screen font-fredoka" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="shrink-0">
            <div
              className="w-[72px] rounded-[36px] bg-[#FDFBF7] px-3 py-5 flex flex-col items-center gap-5"
              style={{ boxShadow: '-8px -8px 20px rgba(255,255,255,0.95), 12px 16px 36px rgba(17,24,39,0.10)' }}
            >
              <Link
                to="/"
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B2F2BB] to-emerald-300 flex items-center justify-center font-bold text-slate-800 text-sm active:scale-95 transition-transform"
                style={{ boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 6px 8px 18px rgba(17,24,39,0.14)' }}
              >
                F4
              </Link>
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <Link to="/"><NavIcon label="Dashboard"><LayoutDashboard className="w-5 h-5" /></NavIcon></Link>
              <Link to="/operations"><NavIcon label="Kho hàng"><Warehouse className="w-5 h-5" /></NavIcon></Link>
              <Link to="/products"><NavIcon label="Sản phẩm"><Package className="w-5 h-5" /></NavIcon></Link>
              <Link to="/confirmation"><NavIcon label="Vận chuyển"><Truck className="w-5 h-5" /></NavIcon></Link>
              <Link to="/trace"><NavIcon label="Tìm kiếm"><PackageSearch className="w-5 h-5" /></NavIcon></Link>
              <Link to="/partners"><NavIcon label="Đối tác" active><Users className="w-5 h-5" /></NavIcon></Link>
              <div className="flex-1" />
              <div className="w-full h-px bg-slate-200/60 rounded-full" />
              <NavIcon label="Cài đặt"><Settings className="w-5 h-5" /></NavIcon>
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────── */}
          <main className="flex-1 min-w-0">

            <Header
              title="Quản Lý Đối Tác"
              subtitle="Hệ sinh thái liên kết Master Data toàn hệ thống"
              showSearch
              actions={{
                primary: {
                  label: "Thêm Đối Tác",
                  icon: <Plus className="w-4 h-4 text-[#10B981]" />,
                  color: "#10B981",
                  bgColor: "bg-[#DCFCE7]",
                  onClick: () => setShowForm(true)
                }
              }}
              userInitials="VT"
            />

            {/* TAB SECTION */}
            <div className="flex gap-6 mb-8 mt-6">
              <button 
                onClick={() => setActiveTab('supplier')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'supplier' ? `bg-[#B2F2BB] text-[#4A4A4A]` : `bg-white text-slate-500`} ${squishyPress}`}
                style={{ boxShadow: activeTab === 'supplier' ? innerShadowClay : '-6px -6px 14px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.1)' }}
              >
                Nhà cung cấp
              </button>
              <button 
                onClick={() => setActiveTab('customer')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'customer' ? `bg-[#FFD1DC] text-[#4A4A4A]` : `bg-white text-slate-500`} ${squishyPress}`}
                style={{ boxShadow: activeTab === 'customer' ? innerShadowClay : '-6px -6px 14px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.1)' }}
              >
                Khách hàng
              </button>
            </div>

            {/* LIST SECTION (Bento Grid) */}
            {isLoading ? (
              <div className="flex items-center justify-center p-20 text-slate-500"><p>Đang tải dữ liệu đối tác...</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dataList.map((partner) => (
                  <div 
                    key={partner.id} 
                    onClick={() => setSelectedPartner(partner)}
                    className={`p-6 rounded-[32px] cursor-pointer ${getCardColor()} hover:-translate-y-2 transition-transform duration-300 relative group`}
                    style={{ boxShadow: '-10px -10px 24px rgba(255,255,255,0.95), 16px 20px 40px rgba(17,24,39,0.11), inset 0px 1px 0px rgba(255,255,255,0.92)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mb-4" style={{ boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)' }}>
                       {activeTab === 'supplier' ? <Package className="text-emerald-700" /> : <Users className="text-pink-600" />}
                    </div>
                    <h3 className="text-[17px] font-bold text-slate-900 mb-1 truncate">
                      {partner.company_name || partner.full_name}
                    </h3>
                    <p className="text-slate-600 text-[13px] mb-4 flex items-center gap-1"><Phone size={14}/> {partner.phone || 'Chưa cập nhật'}</p>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6">
                       <button className={`w-8 h-8 flex items-center justify-center bg-white rounded-full ${squishyPress}`} style={{boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)'}} onClick={(e) => { e.stopPropagation(); /* handle edit */ }}>
                          <Edit2 size={14} className="text-slate-600" />
                       </button>
                       <button className={`w-8 h-8 flex items-center justify-center bg-white rounded-full ${squishyPress}`} style={{boxShadow: '-3px -3px 8px rgba(255,255,255,0.85), 4px 5px 12px rgba(17,24,39,0.09)'}} onClick={(e) => { e.stopPropagation(); /* handle delete */ }}>
                          <Trash2 size={14} className="text-rose-500" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </main>
        </div>
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PartnerFormFactory type={activeTab} onClose={() => setShowForm(false)} onSubmit={handleAdd} />
        </div>
      )}

      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className={`w-full max-w-2xl p-8 rounded-[32px] bg-[#FDFBF7] max-h-[90vh] overflow-y-auto`}
             style={{ boxShadow: '-18px -18px 44px rgba(255,255,255,0.96), 28px 36px 72px rgba(17,24,39,0.16)' }}>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${activeTab === 'supplier' ? 'bg-[#B2F2BB]/50' : 'bg-[#FFD1DC]/50'}`} style={{ boxShadow: '-6px -6px 14px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.10)' }}>
                  {activeTab === 'supplier' ? <Package className="w-8 h-8 text-emerald-700" /> : <Users className="w-8 h-8 text-pink-600" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                     {selectedPartner.company_name || selectedPartner.full_name}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-bold ${activeTab === 'supplier' ? 'bg-[#B2F2BB] text-emerald-900' : 'bg-[#FFD1DC] text-pink-900'}`}>
                    {activeTab === 'supplier' ? 'Nhà cung cấp' : selectedPartner.customer_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="flex items-center gap-3 text-slate-700 bg-white p-4 rounded-2xl" style={{ boxShadow: 'inset 2px 2px 5px rgba(17,24,39,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)' }}>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><Phone size={14} className="text-slate-500" /></div>
                    <span className="font-semibold">{selectedPartner.phone || 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-700 bg-white p-4 rounded-2xl" style={{ boxShadow: 'inset 2px 2px 5px rgba(17,24,39,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)' }}>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><Mail size={14} className="text-slate-500" /></div>
                    <span className="font-semibold">{selectedPartner.email || 'N/A'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-700 bg-white p-4 rounded-2xl col-span-2" style={{ boxShadow: 'inset 2px 2px 5px rgba(17,24,39,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)' }}>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><MapPin size={14} className="text-slate-500" /></div>
                    <span className="font-semibold">{selectedPartner.address || 'N/A'}</span>
                 </div>
              </div>

              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                 <Package className="w-5 h-5 text-slate-500" /> Lịch sử giao dịch gần đây (Top 10)
              </h3>
              
              <div className="flex flex-col gap-3">
                 {selectedPartner.transactions?.length > 0 ? selectedPartner.transactions.map((tx: any) => (
                    <div key={tx.id} className={`p-4 rounded-2xl flex justify-between items-center bg-white`} style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.07)' }}>
                       <div>
                          <p className="font-bold text-slate-900">{tx.code}</p>
                          <p className="text-[12px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-emerald-600">{Number(tx.total_amount).toLocaleString()}đ</p>
                          <p className="text-[10px] font-bold tracking-widest uppercase mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block">{tx.type} • {tx.status}</p>
                       </div>
                    </div>
                 )) : <div className="text-center py-8 opacity-50"><Package size={40} className="mx-auto mb-2" /><p className="font-medium">Chưa có giao dịch nào.</p></div>}
              </div>

              <button onClick={() => setSelectedPartner(null)} className={`mt-8 w-full py-4 rounded-full font-bold text-slate-900 bg-[#E0C3FC] ${squishyPress}`} style={{ boxShadow: '-5px -5px 12px rgba(255,255,255,0.9), 8px 10px 22px rgba(17,24,39,0.13)' }}>
                 Đóng lại
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
