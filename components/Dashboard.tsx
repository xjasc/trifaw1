import React, { useMemo } from 'react';
import { Project, ExpenseStatus, ProjectStatus, UserRole } from '../types';
import { CATEGORIES } from '../constants';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface DashboardProps {
  projects: Project[];
  adminExpenses?: any[]; // Opcional para compatibilidade
  navigateToProject: (id: string) => void;
  navigateToProjectsList: () => void;
  userRole: UserRole;
}

// Paleta de cores distintas e profissionais para os gráficos
const CHART_COLORS = [
  '#0f766e', // teal-700
  '#1d4ed8', // blue-700
  '#b45309', // amber-700
  '#7c3aed', // violet-600
  '#be185d', // pink-700
  '#065f46', // emerald-800
  '#c2410c', // orange-700
  '#0369a1', // sky-700
  '#4338ca', // indigo-700
];

const Dashboard: React.FC<DashboardProps> = ({ projects = [], adminExpenses = [], navigateToProject }) => {

  const stats = useMemo(() => {
    // Contagens de Status
    const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE);
    const inactiveProjects = projects.filter(p => p.status === ProjectStatus.INACTIVE);
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);

    let totalBudgetActive = 0;
    let totalExpensesActive = 0;
    let totalMeasurementsActive = 0;

    // Agregadores para gráficos
    const categoryTotals: Record<string, number> = {};
    const supplierTotals: Record<string, number> = {};

    const processExpense = (e: any) => {
      if (e.status === ExpenseStatus.REALIZED) {
        const amount = Number(e.amount) || 0;

        // Categoria
        const cat = e.category || 'OUTROS';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;

        // Fornecedor
        if (e.supplier) {
          const sup = e.supplier.toUpperCase().trim();
          supplierTotals[sup] = (supplierTotals[sup] || 0) + amount;
        }
      }
    };

    // Processamento detalhado para a Tabela e KPIs (Focados em Projetos Ativos para financeiro)
    const detailedProjects = activeProjects.map(p => {
      const pBudget = Number(p.budget) || 0;

      // Somar Despesas Realizadas deste projeto para KPI
      const pExpenses = (p.expenses || [])
        .filter(e => e.status === ExpenseStatus.REALIZED)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      // Somar Medições Realizadas deste projeto
      const pMeasurements = (p.measurements || [])
        .filter(m => m.status === ExpenseStatus.REALIZED)
        .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

      const pBalance = pMeasurements - pExpenses;

      // Somar aos totais globais
      totalBudgetActive += pBudget;
      totalExpensesActive += pExpenses;
      totalMeasurementsActive += pMeasurements;

      return {
        ...p,
        stats: {
          budget: pBudget,
          expenses: pExpenses,
          measurements: pMeasurements,
          balance: pBalance,
          isPositive: pBalance >= 0
        }
      };
    });

    // Processar TODAS as despesas de TODOS os projetos para os gráficos globais
    projects.forEach(p => {
      (p.expenses || []).forEach(processExpense);
    });

    // Somar Despesas Administrativas Realizadas
    adminExpenses.forEach(processExpense);
    const totalAdminExpenses = adminExpenses
      .filter(e => e.status === ExpenseStatus.REALIZED)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    totalExpensesActive += totalAdminExpenses;

    // Formatar dados para recharts
    const categoryData = Object.entries(categoryTotals)
      .map(([id, value]) => ({
        name: CATEGORIES.find(c => c.id === id)?.label || id,
        value
      }))
      .sort((a, b) => b.value - a.value);

    const supplierData = Object.entries(supplierTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 fornecedores

    // Ordenar projetos por Budget (do maior para o menor) para a tabela
    detailedProjects.sort((a, b) => b.stats.budget - a.stats.budget);

    const contractualBalance = totalMeasurementsActive - totalExpensesActive;

    return {
      activeCount: activeProjects.length,
      inactiveCount: inactiveProjects.length,
      completedCount: completedProjects.length,
      totalBudgetActive,
      totalExpensesActive,
      totalMeasurementsActive,
      contractualBalance,
      detailedProjects,
      categoryData,
      supplierData
    };
  }, [projects, adminExpenses]);

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  }).format(val || 0);

  const formatCompact = (val: number) => new Intl.NumberFormat('pt-BR', {
    notation: "compact",
    compactDisplay: "short",
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-top-4 pb-12 relative">

      {/* SEÇÃO 1: KPIs Principais (Indicadores Solicitados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Budget Contratos Ativos */}
        <StatCard
          title="Budget Contratos"
          value={formatBRL(stats.totalBudgetActive)}
          fullValue={formatBRL(stats.totalBudgetActive)}
          icon="fa-file-signature"
          theme="stone"
        />

        {/* Medições Ativas - AZUL */}
        <StatCard
          title="Medições (Entradas)"
          value={formatBRL(stats.totalMeasurementsActive)}
          fullValue={formatBRL(stats.totalMeasurementsActive)}
          icon="fa-hand-holding-dollar"
          theme="blue"
        />

        {/* Despesas Ativas */}
        <StatCard
          title="Despesas (Saídas)"
          value={formatBRL(stats.totalExpensesActive)}
          fullValue={formatBRL(stats.totalExpensesActive)}
          icon="fa-money-bill-transfer"
          theme="amber"
        />

        {/* Saldo Contratual - VERDE (EMERALD) SE POSITIVO */}
        <StatCard
          title="Saldo (Caixa)"
          value={formatBRL(stats.contractualBalance)}
          fullValue={formatBRL(stats.contractualBalance)}
          icon="fa-scale-balanced"
          theme={stats.contractualBalance >= 0 ? "emerald" : "red"}
        />

        {/* Panorama de Projetos (Card Redesenhado com Estrutura Hierárquica e Nomenclatura Corrigida) */}
        <div className="bg-emerald-950 rounded-[1.5rem] border border-emerald-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden min-h-[128px]">

          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-emerald-950/80 pointer-events-none"></div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Parte Superior: Destaque para Ativos */}
          <div className="flex-1 p-5 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200/80">Em Execução</p>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter leading-none filter drop-shadow-lg">{stats.activeCount}</h3>
              <p className="text-[7px] text-emerald-400/60 font-bold uppercase mt-1 tracking-wider">Projetos Ativos</p>
            </div>
            {/* Ícone Hero */}
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-person-digging text-white text-lg"></i>
            </div>
          </div>

          {/* Parte Inferior: Rodapé Informativo (Concluídos e Inativos) */}
          <div className="bg-black/20 backdrop-blur-md border-t border-white/5 grid grid-cols-2 divide-x divide-white/5 relative z-10">
            {/* Concluídos */}
            <div className="p-2.5 flex items-center justify-between hover:bg-white/5 transition-colors group/sub">
              <div className="flex flex-col">
                <span className="text-[7px] font-bold uppercase text-emerald-400/70 tracking-wide mb-0.5">Projetos Concluídos</span>
                <span className="text-sm font-black text-white leading-none">{stats.completedCount}</span>
              </div>
              <i className="fa-solid fa-check-circle text-emerald-600/30 text-[10px] group-hover/sub:text-emerald-500 transition-colors"></i>
            </div>
            {/* Inativos */}
            <div className="p-2.5 flex items-center justify-between hover:bg-white/5 transition-colors group/sub">
              <div className="flex flex-col">
                <span className="text-[7px] font-bold uppercase text-stone-500 tracking-wide mb-0.5">Projetos Inativos</span>
                <span className="text-sm font-black text-stone-400 leading-none">{stats.inactiveCount}</span>
              </div>
              <i className="fa-solid fa-pause-circle text-stone-600/30 text-[10px] group-hover/sub:text-stone-500 transition-colors"></i>
            </div>
          </div>
        </div>

      </div>

      {/* SEÇÃO 2: Analíticos (Novos Gráficos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <div className="bg-[#fafaf9] p-6 rounded-[2.5rem] border border-[#e7e5e4] shadow-sm overflow-hidden min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center shadow-md">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-widest italic">Custo por Categoria</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value?: any) => formatBRL(Number(value) || 0)}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Fornecedores */}
        <div className="bg-[#fafaf9] p-6 rounded-[2.5rem] border border-[#e7e5e4] shadow-sm overflow-hidden min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center shadow-md">
              <i className="fa-solid fa-truck-field"></i>
            </div>
            <h3 className="text-xs font-black text-stone-700 uppercase tracking-widest italic">Top 5 Fornecedores</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.supplierData} layout="vertical" margin={{ left: 10, right: 60, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fontWeight: 'black', fill: '#1c1917' }} />
                <Tooltip
                  formatter={(value?: any) => formatBRL(Number(value) || 0)}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#064e3b" radius={[0, 10, 10, 0]} label={{ position: 'right', formatter: (val: any) => formatCompact(Number(val) || 0), fontSize: 10, fontWeight: 'bold', fill: '#064e3b' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: Lista Detalhada de Projetos Ativos */}
      <div className="bg-[#fafaf9] rounded-[2.5rem] border border-[#e7e5e4] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-xs font-black text-stone-700 uppercase tracking-[0.2em] italic flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center shadow-md"><i className="fa-solid fa-list-check"></i></span>
            Detalhamento de Projetos Ativos
          </h3>
          <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-4 py-1.5 rounded-full uppercase tracking-wide border border-stone-200">
            {stats.activeCount} Registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-200/50">
                <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Projeto / Cliente</th>
                <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Progresso</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-widest text-stone-400">Budget (Contrato)</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-widest text-stone-400 text-amber-700">Despesas (Saídas)</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-widest text-stone-400 text-emerald-700">Medições (Entradas)</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-widest text-stone-400">Saldo Atual</th>
                <th className="px-6 py-5 text-center text-[9px] font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-widest text-stone-400">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stats.detailedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-white transition-colors group cursor-default">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-stone-800 text-xs uppercase italic truncate max-w-[200px] group-hover:text-emerald-900 transition-colors">{project.name}</span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide mt-0.5">{project.clientName || 'Interno'}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 align-middle">
                    <div className="w-full max-w-[100px]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[8px] font-bold text-stone-400 tracking-wider">{project.physicalProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${project.physicalProgress === 100 ? 'bg-emerald-500' : 'bg-stone-600'}`} style={{ width: `${project.physicalProgress}%` }}></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-bold text-stone-600">{formatBRL(project.stats.budget)}</span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-bold text-amber-700">{formatBRL(project.stats.expenses)}</span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <span className="text-xs font-bold text-emerald-700">{formatBRL(project.stats.measurements)}</span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <span className={`text-xs font-black ${project.stats.isPositive ? 'text-emerald-900' : 'text-red-700'}`}>
                      {formatBRL(project.stats.balance)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-center align-middle">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto shadow-sm border ${project.stats.isPositive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      <i className={`fa-solid ${project.stats.isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]`}></i>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => navigateToProject(project.id)}
                      className="w-8 h-8 rounded-xl bg-stone-100 text-stone-400 hover:bg-emerald-950 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      title="Ver Detalhes"
                    >
                      <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {stats.detailedProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">
                    Nenhum projeto ativo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// Componente Auxiliar de Card (StatCard)
const StatCard = ({ title, value, fullValue, icon, theme }: { title: string, value: string, fullValue: string, icon: string, theme: 'stone' | 'emerald' | 'amber' | 'blue' | 'red' | 'dark' }) => {

  const themes = {
    stone: { bg: 'bg-white', iconBox: 'bg-stone-100 text-stone-600', text: 'text-stone-800' },
    emerald: { bg: 'bg-white', iconBox: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-800' },
    amber: { bg: 'bg-white', iconBox: 'bg-amber-50 text-amber-600', text: 'text-amber-800' },
    blue: { bg: 'bg-white', iconBox: 'bg-blue-50 text-blue-600', text: 'text-blue-800' },
    red: { bg: 'bg-white', iconBox: 'bg-red-50 text-red-600', text: 'text-red-700' },
    dark: { bg: 'bg-emerald-950', iconBox: 'bg-white/10 text-white', text: 'text-white' }
  };

  const t = themes[theme];

  return (
    <div className={`${t.bg} p-5 rounded-[1.5rem] border ${theme === 'dark' ? 'border-emerald-900' : 'border-stone-200/60'} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden min-h-[128px]`}>

      {/* Header: Icon + Title */}
      <div className="flex justify-between items-start z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${t.iconBox} transition-transform group-hover:scale-110 duration-300`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        {/* Background Icon Decoration */}
        <div className={`absolute -right-5 -top-5 text-8xl transform rotate-12 pointer-events-none transition-transform group-hover:rotate-0 opacity-[0.04] ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>

      {/* Value Section */}
      <div className="z-10 mt-auto pt-4">
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-60 ${theme === 'dark' ? 'text-emerald-300' : 'text-stone-500'}`}>
          {title}
        </p>
        <h4 className={`text-2xl md:text-3xl font-black italic tracking-tighter leading-none ${t.text}`} title={fullValue}>
          {value}
        </h4>
      </div>
    </div>
  );
};

export default Dashboard;
