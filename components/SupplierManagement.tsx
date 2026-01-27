
import React, { useState } from 'react';
import { Supplier } from '../types';
import { api } from '../services/apiService';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ suppliers = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', category: 'Materiais', email: '', phone: '', document: '', city: '', state: ''
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'Materiais', email: '', phone: '', document: '', city: '', state: '' });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = { id: editingId || `sup-${Date.now()}`, ...formData };
    await api.saveSupplier(newSup);
    setShowModal(false);
  };

  const deleteSupplier = async (id: string) => {
    if (window.confirm("Atenção: Excluir este fornecedor permanentemente do catálogo?")) await api.deleteSupplier(id);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 11) return value.slice(0, 15);
    if (v.length <= 2) return v;
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  };

  // ESTILOS PADRONIZADOS
  const modalContainerClass = "fixed inset-0 z-[9999] flex items-center justify-center md:p-4 font-inter";
  const modalBackdropClass = "absolute inset-0 bg-stone-900/95 backdrop-blur-sm transition-opacity";
  const modalContentClass = "relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-emerald-950 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300";
  const modalHeaderClass = "relative z-10 shrink-0 py-5 px-6 md:px-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm";
  const inputClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400";
  const selectClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20";
  const labelClass = "text-[9px] font-black uppercase text-emerald-200 tracking-widest ml-1 mb-1.5 block drop-shadow-sm";

  const ModalBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 grayscale-[20%]"
            style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')` 
            }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-950/90 to-emerald-950/95 mix-blend-multiply"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Cabeçalho Stone */}
      <div className="bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-stone-800 uppercase italic leading-none tracking-tighter">Gestão de Fornecedores</h2>
        </div>
        <button onClick={handleOpenCreate} className="w-full md:w-auto px-6 py-3 bg-amber-700 text-white font-black uppercase text-[10px] rounded-xl shadow-lg hover:bg-amber-800 transition-all active:scale-95 tracking-widest">
          <i className="fa-solid fa-truck mr-2"></i> Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-[#fafaf9] p-4 rounded-[2rem] border border-[#e7e5e4] shadow-sm flex flex-col group hover:shadow-lg hover:border-emerald-200 transition-all relative overflow-hidden">
             {/* Background Icon Decorativo */}
             <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.05] group-hover:opacity-[0.1] transition-all pointer-events-none transform -rotate-12 text-stone-900">
               <i className={`fa-solid ${CATEGORY_ICONS[sup.category] || 'fa-truck'}`}></i>
             </div>

             {/* Topo: Ícone + Info Principal + Botões de Ação */}
             <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base text-white shadow-md shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[sup.category] || '#022c22' }}
                    >
                       <i className={`fa-solid ${CATEGORY_ICONS[sup.category] || 'fa-truck'}`}></i>
                    </div>
                    <div className="min-w-0">
                       <h3 className="font-black text-stone-800 text-xs truncate uppercase italic leading-tight" title={sup.name}>{sup.name}</h3>
                       <span 
                        className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                        style={{ backgroundColor: `${CATEGORY_COLORS[sup.category]}15`, color: CATEGORY_COLORS[sup.category] }}
                       >
                         {sup.category}
                       </span>
                    </div>
                </div>

                {/* Botões de Ação no Topo - Compactos */}
                <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => { setEditingId(sup.id); setFormData({...sup, email: sup.email || '', phone: sup.phone || '', document: sup.document || '', city: sup.city || '', state: sup.state || ''}); setShowModal(true); }} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-400 hover:bg-emerald-950 hover:text-white hover:border-emerald-900 flex items-center justify-center transition-all shadow-sm">
                      <i className="fa-solid fa-pen text-[10px]"></i>
                    </button>
                    <button onClick={() => deleteSupplier(sup.id)} className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-400 hover:bg-red-700 hover:text-white hover:border-red-700 flex items-center justify-center transition-all shadow-sm">
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                </div>
             </div>

             {/* Detalhes do Fornecedor - Grid Compacto */}
             <div className="grid grid-cols-1 2xl:grid-cols-2 gap-x-2 gap-y-1 relative z-10 pt-2 border-t border-stone-200">
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-600 truncate" title="Documento">
                 <i className="fa-solid fa-id-card w-3 text-center text-stone-300"></i> {sup.document || '-'}
               </div>
               
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-500 truncate" title="Telefone">
                 <i className="fa-solid fa-phone w-3 text-center text-stone-300"></i> {sup.phone || '-'}
               </div>
               
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-500 truncate" title="E-mail">
                 <i className="fa-solid fa-envelope w-3 text-center text-stone-300"></i> {sup.email || '-'}
               </div>
               
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-500 uppercase truncate" title="Localização">
                 <i className="fa-solid fa-location-dot w-3 text-center text-stone-300"></i> {sup.city ? `${sup.city} - ${sup.state}` : '-'}
               </div>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={modalContainerClass}>
            <div className={modalBackdropClass} onClick={() => setShowModal(false)}></div>
            <div className={modalContentClass}>
                <ModalBackground />
                <div className={modalHeaderClass}>
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white drop-shadow-md">{editingId ? 'Editar' : 'Novo'} Fornecedor</h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Catálogo de Parceiros</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 border border-white/5"><i className="fa-solid fa-times text-lg"></i></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-10">
                    <form onSubmit={handleSave} className="space-y-5">
                    
                    <div>
                        <label className={labelClass}>Fornecedor / Razão Social</label>
                        <input required type="text" placeholder="Nome Completo *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                    </div>
                    
                    <div>
                        <label className={labelClass}>Especialidade</label>
                        <div className="relative">
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={selectClass}>
                                <option value="Materiais" className="text-stone-800">Materiais</option>
                                <option value="Mão de Obra" className="text-stone-800">Mão de Obra</option>
                                <option value="Equipamentos" className="text-stone-800">Equipamentos</option>
                                <option value="Locações" className="text-stone-800">Locações</option>
                                <option value="Serviços" className="text-stone-800">Serviços</option>
                                <option value="Outros" className="text-stone-800">Outros</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Documento (CPF/CNPJ)</label>
                        <input type="text" placeholder="CNPJ / Documento" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className={inputClass} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>E-mail</label>
                            <input type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefone</label>
                            <input 
                                type="text" 
                                placeholder="(XX) XXXXX-XXXX" 
                                value={formData.phone} 
                                maxLength={15}
                                onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                                className={inputClass} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Cidade</label>
                            <input type="text" placeholder="Cidade" className={inputClass} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>UF</label>
                            <input type="text" placeholder="UF" maxLength={2} className={`${inputClass} uppercase`} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <button type="submit" className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] tracking-widest transition-all hover:bg-stone-200 text-[11px] flex items-center justify-center gap-2">
                            Salvar Fornecedor <i className="fa-solid fa-floppy-disk text-lg"></i>
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
