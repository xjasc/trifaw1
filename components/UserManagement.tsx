// VERSION: 20260216_0905_FORCE_SYNC
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users = [], onSaveUser, onDeleteUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | UserRole>('ALL');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123',
    role: UserRole.CLIENTE,
    phone: '',
    city: '',
    state: '',
    document: ''
  });

  const filteredUsers = useMemo(() => {
    if (activeTab === 'ALL') return users;
    return users.filter(user => user.role === activeTab);
  }, [users, activeTab]);

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', password: '123', role: UserRole.CLIENTE, phone: '', city: '', state: '', document: '' });
    setShowModal(true);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 11) return value.slice(0, 15);
    if (v.length <= 2) return v;
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = { id: editingUserId || `u-${Date.now()}`, ...formData };
    await onSaveUser(newUser);
    setShowModal(false);
    setEditingUserId(null);
  };

  const deleteUser = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.email === 'arao.costa@trifaw.com.br') return alert("Master Admin não pode ser removido.");
    if (window.confirm(`Excluir acesso de ${user?.name}?`)) await onDeleteUser(id);
  };

  // ESTILOS PADRONIZADOS
  const modalContainerClass = "fixed inset-0 z-[9999] flex items-center justify-center md:p-4 font-inter";
  const modalBackdropClass = "absolute inset-0 bg-stone-900/95 backdrop-blur-sm transition-opacity";
  const modalContentClass = "relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-emerald-950 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300";
  const modalHeaderClass = "relative z-10 shrink-0 py-5 px-6 md:px-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm";
  const inputClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400";
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-black text-stone-800 uppercase italic tracking-tighter">Controle de Usuários</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase mt-1 tracking-widest">Base de Dados e Acessos</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-xl border border-stone-200 overflow-x-auto no-scrollbar shadow-sm">
          {(['ALL', UserRole.ADMIN, UserRole.CLIENTE] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-950 text-white' : 'text-stone-400 hover:text-emerald-900'}`}>
              {tab === 'ALL' ? 'Todos' : tab === UserRole.ADMIN ? 'Administradores' : 'Clientes'}
            </button>
          ))}
        </div>
        <button onClick={handleOpenCreateModal} className="px-6 py-3 bg-emerald-950 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-emerald-900 transition-all">
          <i className="fa-solid fa-user-plus mr-2"></i> Cadastro de Usuários
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] flex items-start gap-4 hover:border-amber-200 transition-all group relative min-h-[140px] shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0 mt-1 ${user.role === UserRole.ADMIN ? 'bg-emerald-950' : 'bg-stone-500'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
              <div className="flex flex-col gap-1 mb-3">
                <h3 className="font-black text-stone-800 text-sm leading-tight uppercase italic truncate" title={user.name}>{user.name}</h3>
                <span className={`self-start px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${user.role === UserRole.ADMIN ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                  {user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'CLIENTE'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-stone-500 font-bold truncate lowercase flex items-center gap-2" title={user.email}>
                  <i className="fa-solid fa-envelope text-stone-300 w-3 text-center"></i> {user.email}
                </p>
                {user.phone && (
                  <p className="text-[10px] text-stone-500 font-bold truncate flex items-center gap-2">
                    <i className="fa-solid fa-phone text-stone-300 w-3 text-center"></i> {user.phone}
                  </p>
                )}
                {user.city && (
                  <p className="text-[10px] text-stone-500 font-bold truncate uppercase flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-stone-300 w-3 text-center"></i> {user.city} - {user.state}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setEditingUserId(user.id); setFormData({ ...user, password: user.password || '123', phone: user.phone || '', city: user.city || '', state: user.state || '', document: user.document || '' }); setShowModal(true); }} className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-400 hover:bg-emerald-950 hover:text-white hover:border-emerald-900 flex items-center justify-center transition-all shadow-sm">
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button onClick={() => deleteUser(user.id)} className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-400 hover:bg-red-700 hover:text-white hover:border-red-700 flex items-center justify-center transition-all shadow-sm">
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
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
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white drop-shadow-md">{editingUserId ? 'Editar' : 'Novo'} Cadastro</h2>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Gestão de Acesso ao SGI</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 border border-white/5"><i className="fa-solid fa-times text-lg"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-10">
              <form onSubmit={handleSaveUser} className="space-y-5">
                <div>
                  <label className={labelClass}>Nome Completo</label>
                  <input required type="text" placeholder="Nome Completo *" className={inputClass} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>E-mail de Acesso</label>
                    <input required type="email" placeholder="E-mail *" className={inputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Senha Provisória</label>
                    <input required type="password" placeholder="Senha *" className={inputClass} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
                <div className="relative border-t border-white/10 pt-4 mt-2">
                  <span className="absolute -top-2 left-0 bg-emerald-950 pr-2 text-[8px] font-black uppercase text-emerald-500/60 tracking-widest">Informações Complementares</span>
                </div>
                <div>
                  <label className={labelClass}>Telefone / Celular</label>
                  <input type="text" placeholder="(DD) XXXXX-XXXX" className={inputClass} value={formData.phone} maxLength={15} onChange={e => setFormData({ ...formData, phone: formatPhone(e.target.value) })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Cidade</label>
                    <input type="text" placeholder="Cidade" className={inputClass} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>UF</label>
                    <input type="text" placeholder="UF" maxLength={2} className={`${inputClass} uppercase`} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Documento (CPF/CNPJ)</label>
                  <input type="text" placeholder="CPF ou CNPJ" className={inputClass} value={formData.document} onChange={e => setFormData({ ...formData, document: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button type="button" onClick={() => setFormData({ ...formData, role: UserRole.ADMIN })} className={`py-3 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest transition-all ${formData.role === UserRole.ADMIN ? 'bg-emerald-500 text-emerald-950 border-emerald-500' : 'bg-transparent border-white/20 text-stone-400 hover:border-white/40'}`}>Administrador</button>
                  <button type="button" onClick={() => setFormData({ ...formData, role: UserRole.CLIENTE })} className={`py-3 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest transition-all ${formData.role === UserRole.CLIENTE ? 'bg-stone-100 text-stone-900 border-stone-100' : 'bg-transparent border-white/20 text-stone-400 hover:border-white/40'}`}>Cliente / Visitante</button>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4">
                  <button type="submit" className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase text-[11px] tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                    Salvar Usuário <i className="fa-solid fa-floppy-disk text-lg"></i>
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

export default UserManagement;
