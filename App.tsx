// VERSION: 20260216_0905_FORCE_SYNC
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, User, Project, UserRole, Supplier, Expense } from './types';
import { api } from './services/apiService';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProjectsList from './components/ProjectsList.tsx';
import ProjectDetails from './components/ProjectDetails.tsx';
import UserManagement from './components/UserManagement.tsx';
import SupplierManagement from './components/SupplierManagement.tsx';
import AdminExpenses from './components/AdminExpenses.tsx';
import Login from './components/Login.tsx';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({
    projects: [],
    users: [],
    suppliers: [],
    currentUser: null,
    adminExpenses: []
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'project-details' | 'users' | 'suppliers' | 'admin-expenses'>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const initConnection = async () => {
      try {
        setIsLoading(true);
        await api.ensureMasterUser();
        unsubscribe = api.subscribeToData((updates) => {
          setData(prev => ({ ...prev, ...updates }));
          setIsLoading(false);
        });
      } catch (error: any) {
        setInitError(error.message || "Falha na conexão com o banco de dados TRIFAW.");
        setIsLoading(false);
      }
    };
    initConnection();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const isAdmin = data.currentUser?.role === UserRole.ADMIN;

  const handleLogin = (user: User) => {
    setData(prev => ({ ...prev, currentUser: user }));
    setActiveProjectId(null);
    setCurrentView(user.role === UserRole.ADMIN ? 'dashboard' : 'projects');
  };

  const handleLogout = () => {
    setData(prev => ({ ...prev, currentUser: null }));
    setActiveProjectId(null);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };


  const navigateTo = (view: 'dashboard' | 'projects' | 'project-details' | 'users' | 'suppliers' | 'admin-expenses', projectId: string | null = null) => {
    if (!data.currentUser) return;

    if (!isAdmin && (view === 'dashboard' || view === 'users' || view === 'suppliers')) {
      setCurrentView('projects');
      setActiveProjectId(null);
      return;
    }

    if (view !== 'project-details') {
      setActiveProjectId(null);
    } else if (projectId) {
      setActiveProjectId(projectId);
    }

    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleProjects = useMemo(() => {
    if (!data.currentUser) return [];
    if (data.currentUser.role === UserRole.ADMIN) return data.projects;
    return data.projects.filter(p => p.clientEmail === data.currentUser?.email);
  }, [data.projects, data.currentUser]);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return data.projects.find(p => p.id === activeProjectId) || null;
  }, [data.projects, activeProjectId]);

  if (initError) {
    return (
      <div className="h-screen w-full bg-[#f5f5f4] flex flex-col items-center justify-center p-6 text-center font-saira">
        <div className="w-20 h-20 bg-stone-200 text-red-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-stone-300">
          <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-stone-900 uppercase italic tracking-tighter mb-4">Erro Crítico SGI</h2>
        <p className="text-stone-600 mb-8 max-w-md font-sans">Falha na conexão com o sistema central. Tente novamente.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-emerald-950 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-emerald-900 transition-all">
          <i className="fa-solid fa-rotate mr-2"></i> Reiniciar SGI
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-emerald-950 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-700 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-saira font-black text-white text-4xl pt-1">T</span>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-white font-saira font-black uppercase tracking-[0.2em] italic text-xl">TRIFAW</h2>
          <p className="text-emerald-500 font-saira text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  if (!data.currentUser) {
    return <Login users={data.users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-inter">
      <Sidebar
        currentView={currentView}
        navigateTo={navigateTo}
        currentUser={data.currentUser}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area - Fundo Global Aplicado (engineering-bg) */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full engineering-bg">

        {/* HEADER UNIFICADO VISUALMENTE COM A SIDEBAR */}
        <header className="h-16 md:h-20 bg-emerald-950 border-b border-emerald-900/50 flex items-center justify-between px-4 md:px-8 shrink-0 z-20 shadow-lg gap-4 relative overflow-hidden">

          {/* Background Image CONTINUAÇÃO EXATA */}
          <div className="absolute inset-0 z-0">
            {/* bg-fixed garante que a imagem esteja na mesma posição da sidebar */}
            <div
              className="absolute inset-0 bg-cover bg-fixed bg-left-top opacity-30 grayscale-[20%]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')`
              }}
            ></div>

            {/* Gradiente similar ao da sidebar, mas horizontal para o header */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-950/95 mix-blend-multiply"></div>
          </div>

          {/* Conteúdo do Header (z-10 para ficar acima da textura) */}
          <div className="relative z-10 flex w-full items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              {currentView === 'project-details' ? (
                <button
                  onClick={() => navigateTo('projects')}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-white bg-white/10 border border-white/10 rounded-xl hover:bg-white hover:text-emerald-950 transition-all shadow-sm shrink-0 backdrop-blur-sm"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
              ) : (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-white bg-white/10 border border-white/10 rounded-xl shrink-0 backdrop-blur-sm"
                >
                  <i className="fa-solid fa-bars-staggered"></i>
                </button>
              )}

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.15em] truncate drop-shadow-md font-saira">
                    TRIFAW ENGENHARIA
                  </p>
                </div>
                <p className="text-sm md:text-base font-black text-white uppercase truncate leading-tight italic tracking-normal drop-shadow-lg font-saira">
                  {currentView === 'dashboard' && 'Painel Geral Estratégico'}
                  {currentView === 'projects' && 'Gerenciamento de Projetos'}
                  {currentView === 'project-details' && (activeProject?.name || 'Detalhes Técnicos')}
                  {currentView === 'users' && 'Gestão de Acessos'}
                  {currentView === 'suppliers' && 'Catálogo de Fornecedores'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-4">
              <div className="text-right hidden md:flex flex-col justify-center min-w-0 pr-1">
                <p className="text-[11px] md:text-sm font-black text-white leading-tight uppercase tracking-tight truncate max-w-[200px] drop-shadow-md font-saira">
                  {data.currentUser.name}
                </p>
                <p className="text-[8px] text-emerald-300 font-bold uppercase tracking-widest mt-0.5 opacity-90 font-saira">
                  {data.currentUser.role}
                </p>
              </div>
              {/* Avatar Invertido para destaque no fundo escuro */}
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-white flex items-center justify-center text-emerald-950 font-black text-sm shadow-xl shadow-black/20 shrink-0 border border-white/20 font-saira">
                {data.currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {currentView === 'dashboard' && isAdmin && (
            <Dashboard
              projects={data.projects}
              adminExpenses={data.adminExpenses}
              navigateToProject={(id: string) => navigateTo('project-details', id)}
              navigateToProjectsList={() => setCurrentView('projects')}
              userRole={data.currentUser?.role as UserRole}
            />
          )}
          {currentView === 'projects' && (
            <ProjectsList
              projects={visibleProjects}
              users={data.users}
              onSelectProject={(id: string) => navigateTo('project-details', id)}
              currentUser={data.currentUser}
            />
          )}
          {currentView === 'project-details' && activeProject && (
            <ProjectDetails
              project={activeProject}
              users={data.users}
              suppliers={data.suppliers}
              onUpdateProject={(p: Project) => api.saveProject(p)}
              currentUser={data.currentUser}
              globalExpenses={data.adminExpenses}
            />
          )}
          {currentView === 'users' && isAdmin && (
            <UserManagement
              users={data.users}
              onSaveUser={(user: User) => api.saveUser(user)}
              onDeleteUser={(id: string) => api.deleteUser(id)}
            />
          )}
          {currentView === 'suppliers' && isAdmin && (
            <SupplierManagement
              suppliers={data.suppliers}
              onSaveSupplier={(supplier: Supplier) => api.saveSupplier(supplier)}
              onDeleteSupplier={(id: string) => api.deleteSupplier(id)}
            />
          )}
          {currentView === 'admin-expenses' && isAdmin && (
            <AdminExpenses
              expenses={data.adminExpenses}
              projects={data.projects}
              onSaveExpense={(newExpense: Expense) => api.saveAdminExpense(newExpense)}
              onDeleteExpense={(id: string) => api.deleteAdminExpense(id)}
              currentUser={data.currentUser}
              suppliers={data.suppliers}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
