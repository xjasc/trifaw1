import React, { useState, useMemo } from 'react';
import { Expense, ExpenseStatus, User, UserRole, Supplier, Project } from '../types';
import { CATEGORIES } from '../constants';

interface AdminExpensesProps {
    expenses: Expense[];
    projects: Project[];
    onSaveExpense: (expense: Expense) => Promise<void>;
    onDeleteExpense: (id: string) => Promise<void>;
    currentUser: User;
    suppliers: Supplier[];
}

const AdminExpenses: React.FC<AdminExpensesProps> = ({ expenses = [], projects = [], onSaveExpense, onDeleteExpense, currentUser, suppliers = [] }) => {
    const [showModal, setShowModal] = useState(false);
    const [filterMonth, setFilterMonth] = useState<string>('ALL');
    // Removed unused isDownloading state

    // Form State
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: CATEGORIES[0].id,
        supplier: '',
        status: ExpenseStatus.REALIZED,
        date: new Date().toISOString().split('T')[0],
        attachmentUrl: '',
        stageId: '',
        projectId: ''
    });
    const [expenseFile, setExpenseFile] = useState<File | null>(null);

    const isAdmin = currentUser.role === UserRole.ADMIN;

    // Ordering and Filtering
    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses]);

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        expenses.forEach(e => {
            if (e.date) months.add(e.date.substring(0, 7));
        });
        return Array.from(months).sort().reverse();
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        if (filterMonth === 'ALL') return sortedExpenses;
        return sortedExpenses.filter(e => e.date.startsWith(filterMonth));
    }, [sortedExpenses, filterMonth]);

    const totalRealized = useMemo(() =>
        filteredExpenses.filter(e => e.status === ExpenseStatus.REALIZED).reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
        [filteredExpenses]
    );

    const totalFuture = useMemo(() =>
        filteredExpenses.filter(e => e.status === ExpenseStatus.FUTURE).reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
        [filteredExpenses]
    );

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        let attachmentUrl = formData.attachmentUrl || '';
        if (expenseFile) {
            await new Promise<void>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(expenseFile);
                reader.onload = () => {
                    attachmentUrl = reader.result as string;
                    resolve();
                };
            });
        }

        const newExpense: Expense = {
            id: `admin-e-${Date.now()}`,
            ...formData,
            amount: Number(formData.amount),
            attachmentUrl,
            createdBy: currentUser.id,
            projectId: formData.projectId || 'ADMIN' // Se não houver projeto, é administrativo puro
        };

        await onSaveExpense(newExpense);
        setShowModal(false);
        setFormData({
            description: '', amount: 0, category: CATEGORIES[0].id, supplier: '',
            status: ExpenseStatus.REALIZED, date: new Date().toISOString().split('T')[0], attachmentUrl: '',
            stageId: '', projectId: ''
        });
        setExpenseFile(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir esta despesa administrativa?')) {
            await onDeleteExpense(id);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-stone-800 uppercase italic tracking-tighter">Despesas Administrativas</h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Gestão de Custos da Empresa (Não Vinculados a Projetos)</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-950 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Nova Despesa
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fa-solid fa-money-bill-wave"></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Total Pago</span>
                    </div>
                    <h3 className="text-3xl font-black text-amber-800 italic tracking-tighter">{formatBRL(totalRealized)}</h3>
                    <p className="text-[9px] font-bold text-amber-400 mt-1 uppercase">No Período Selecionado</p>
                </div>
                <div className="bg-stone-100 p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white text-stone-600 flex items-center justify-center text-lg shadow-sm">
                            <i className="fa-regular fa-clock"></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">A Pagar (Futuro)</span>
                    </div>
                    <h3 className="text-3xl font-black text-stone-700 italic tracking-tighter">{formatBRL(totalFuture)}</h3>
                    <p className="text-[9px] font-bold text-stone-400 mt-1 uppercase">Previsão</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                <button
                    onClick={() => setFilterMonth('ALL')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterMonth === 'ALL' ? 'bg-emerald-950 text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50 border border-stone-200'}`}
                >
                    Todo o Período
                </button>
                {availableMonths.map(month => (
                    <button
                        key={month}
                        onClick={() => setFilterMonth(month)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterMonth === month ? 'bg-emerald-950 text-white shadow-md' : 'bg-white text-stone-400 hover:bg-stone-50 border border-stone-200'}`}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-stone-50 border-b border-stone-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Data</th>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Descrição</th>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Categoria</th>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-stone-400">Fornecedor</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-stone-400">Valor</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase tracking-widest text-stone-400">Status</th>
                                <th className="px-6 py-4 text-center text-[9px] font-black uppercase tracking-widest text-stone-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredExpenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-stone-600">
                                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-stone-800 text-xs uppercase">{expense.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[9px] font-black uppercase border border-stone-200">
                                            {CATEGORIES.find(c => c.id === expense.category)?.label || expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-stone-600 font-medium uppercase">
                                        {expense.supplier || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-stone-800 text-sm">
                                        {formatBRL(expense.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${expense.status === ExpenseStatus.REALIZED ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {expense.status === ExpenseStatus.REALIZED ? 'PAGO' : 'PREVISTO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                        {expense.attachmentUrl && (
                                            <a href={expense.attachmentUrl} download={`comprovante_${expense.id}`} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                                <i className="fa-solid fa-download text-xs"></i>
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(expense.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                                            <i className="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">
                                        Nenhuma despesa encontrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL NOVA DESPESA */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="text-lg font-black text-stone-800 uppercase italic">Nova Despesa Administrativa</h3>
                            <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600"><i className="fa-solid fa-xmark text-xl"></i></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Descrição</label>
                                <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all" placeholder="Ex: Conta de Luz" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Valor (R$)</label>
                                    <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Data</label>
                                    <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Categoria</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all">
                                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all">
                                        <option value={ExpenseStatus.REALIZED}>Paga / Realizada</option>
                                        <option value={ExpenseStatus.FUTURE}>A Pagar / Futura</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Projeto (Opcional)</label>
                                    <select
                                        value={formData.projectId}
                                        onChange={e => setFormData({ ...formData, projectId: e.target.value, stageId: '' })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all font-saira"
                                    >
                                        <option value="">Despesa Administrativa</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Etapa</label>
                                    <select
                                        disabled={!formData.projectId}
                                        value={formData.stageId}
                                        onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all font-saira disabled:opacity-50"
                                    >
                                        <option value="">Geral / Sem Etapa</option>
                                        {formData.projectId && projects.find(p => p.id === formData.projectId)?.stages?.map((s: any) => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Fornecedor</label>
                                <input list="suppliers-list" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 text-xs outline-none focus:border-emerald-500 transition-all" placeholder="Digite ou selecione..." />
                                <datalist id="suppliers-list">
                                    {suppliers.map(s => <option key={s.id} value={s.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1 mb-1.5 block">Comprovante / Anexo</label>
                                <input type="file" onChange={e => setExpenseFile(e.target.files?.[0] || null)} className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-500 text-xs outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200" />
                            </div>

                            <button type="submit" className="w-full py-4 mt-4 bg-emerald-950 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg active:scale-95">
                                Salvar Despesa
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExpenses;
