
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  navigateTo: (view: any, param?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigateTo, currentUser, onLogout, isOpen, onClose }) => {
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const NavItem = ({ view, icon, label }: { view: string, icon: string, label: string }) => (
    <button
      onClick={() => {
        navigateTo(view as any);
        if (window.innerWidth < 768) onClose();
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 mb-2 group relative ${
        currentView === view 
          ? 'bg-white text-emerald-950 shadow-2xl font-black scale-[1.02]' 
          : 'text-emerald-100 hover:bg-black/20 hover:text-white font-medium hover:pl-7'
      }`}
    >
      <i className={`fa-solid ${icon} w-6 text-center text-lg transition-transform ${currentView === view ? 'text-emerald-900' : 'text-emerald-300/80 group-hover:text-white'}`}></i>
      <span className="text-xs uppercase tracking-widest text-left flex-1 font-saira font-bold">{label}</span>
      {currentView === view && <div className="absolute right-3 w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>}
    </button>
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative top-0 left-0 h-full w-full md:w-72 shrink-0 flex flex-col z-50 
        transition-transform duration-300 shadow-2xl md:shadow-stone-500/20
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-emerald-950 border-r border-emerald-900/50 overflow-hidden
      `}>
        {/* Background Image Overlay - CONTINUIDADE PERFEITA */}
        <div className="absolute inset-0 z-0">
           {/* Usando bg-fixed para a imagem ficar estática em relação à viewport, alinhando com o header */}
           <div 
             className="absolute inset-0 bg-cover bg-fixed bg-left-top opacity-40 grayscale-[20%]"
             style={{ 
               backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')` 
             }}
           ></div>
           
           {/* Gradiente Verde Profundo Unificador */}
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/70 to-emerald-950/95 mix-blend-multiply"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full backdrop-blur-[2px]">
            {/* Header da Sidebar - LOGO ATUALIZADA */}
            <div className="p-8 pb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Ícone T Quadrado */}
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-xl border-b-4 border-emerald-800 shrink-0">
                   <span className="font-saira font-black text-emerald-950 text-4xl leading-none pt-1 pr-0.5">T</span>
                </div>
                {/* Texto Logo */}
                <div className="flex flex-col -space-y-1">
                  <h1 className="text-white font-saira font-black text-2xl tracking-tighter leading-none italic uppercase drop-shadow-lg">TRIFAW</h1>
                  <p className="text-emerald-400 font-saira text-[10px] font-bold tracking-[0.2em] uppercase leading-none pl-0.5 drop-shadow-md">Engenharia</p>
                </div>
              </div>
              <button onClick={onClose} className="md:hidden text-emerald-200 hover:text-white">
                 <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar space-y-8">
              <div>
                <p className="px-6 text-[9px] uppercase font-black text-emerald-400/60 tracking-widest mb-4 flex items-center gap-2 font-saira">
                   Gestão
                   <span className="h-[1px] flex-1 bg-white/10"></span>
                </p>
                {isAdmin && <NavItem view="dashboard" icon="fa-chart-pie" label="Visão Geral" />}
                <NavItem view="projects" icon="fa-building-shield" label="Meus Projetos" />
              </div>

              {isAdmin && (
                <div>
                  <p className="px-6 text-[9px] uppercase font-black text-emerald-400/60 tracking-widest mb-4 flex items-center gap-2 font-saira">
                    Administrativo
                    <span className="h-[1px] flex-1 bg-white/10"></span>
                  </p>
                  <NavItem view="suppliers" icon="fa-truck-fast" label="Fornecedores" />
                  <NavItem view="users" icon="fa-users-gear" label="Usuários" />
                </div>
              )}
            </nav>

            <div className="p-6 border-t border-white/5 bg-black/20">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-200 hover:bg-red-900/40 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest group border border-transparent hover:border-red-800/50 font-saira"
              >
                <i className="fa-solid fa-arrow-right-from-bracket group-hover:-translate-x-1 transition-transform"></i>
                <span>Sair do Sistema</span>
              </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
