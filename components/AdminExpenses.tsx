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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterMonth, setFilterMonth] = useState<string>('ALL');

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

    const handleOpenModal = (expense?: Expense) => {
        if (expense) {
            setEditingId(expense.id);
            setFormData({
                description: expense.description || '',
                amount: expense.amount || 0,
                category: expense.category || CATEGORIES[0].id,
                supplier: expense.supplier || '',
                status: expense.status || ExpenseStatus.REALIZED,
                date: expense.date || new Date().toISOString().split('T')[0],
                attachmentUrl: expense.attachmentUrl || '',
                stageId: expense.stageId || '',
                projectId: expense.projectId || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                description: '', amount: 0, category: CATEGORIES[0].id, supplier: '',
                status: ExpenseStatus.REALIZED, date: new Date().toISOString().split('T')[0], attachmentUrl: '',
                stageId: '', projectId: ''
            });
        }
        setExpenseFile(null);
        setShowModal(true);
    };

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

        const expenseToSave: Expense = {
            id: editingId || `admin-e-${Date.now()}`,
            ...formData,
            amount: Number(formData.amount),
            attachmentUrl,
            createdBy: currentUser.id,
            projectId: formData.projectId || 'ADMIN'
        };

        await onSaveExpense(expenseToSave);
        setShowModal(false);
        setEditingId(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir esta despesa administrativa?')) {
            await onDeleteExpense(id);
        }
    };

    // Reusable Classes (Standardized with ProjectDetails)
    const modalContainerClass = "fixed inset-0 z-[9999] flex items-center justify-center md:p-4 font-inter";
    const modalBackdropClass = "absolute inset-0 bg-stone-900/95 backdrop-blur-sm transition-opacity";
    const modalContentClass = "relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-emerald-950 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300";
    const modalHeaderClass = "relative z-10 shrink-0 py-5 px-6 md:px-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm";
    const inputClass = "w-full p-3.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400";
    const selectClass = "w-full p-3.5 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 shadow-sm";
    const labelClass = "text-[9px] font-black uppercase text-emerald-200 tracking-widest ml-1 mb-1.5 block drop-shadow-sm";

    const ModalBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale-[20%]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-950/90 to-emerald-950/95 mix-blend-multiply"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-stone-800 uppercase italic tracking-tighter">Despesas Administrativas</h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Gestão de Custos da Empresa (Não Vinculados a Projetos)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
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
                                        <button onClick={() => handleOpenModal(expense)} className="w-8 h-8 rounded-lg bg-stone-100 text-stone-400 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center justify-center">
                                            <i className="fa-solid fa-pen text-[10px]"></i>
                                        </button>
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

            {/* MODAL PADRONIZADO */}
            {showModal && (
                <div className={modalContainerClass}>
                    <div className={modalBackdropClass} onClick={() => setShowModal(false)}></div>
                    <div className={modalContentClass}>
                        <ModalBackground />
                        <div className={modalHeaderClass}>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight drop-shadow-md">
                                    {editingId ? 'Editar Despesa' : 'Nova Despesa Administrativa'}
                                </h3>
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Custo de Operação Central</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 text-emerald-200 hover:bg-white/20 transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Descrição da Despesa</label>
                                    <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} placeholder="Ex: Conta de Luz, Aluguel..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Valor (R$)</label>
                                        <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Data do Registro</label>
                                        <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className={labelClass}>Categoria</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={selectClass}>
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 bottom-3.5 pointer-events-none text-stone-400"><i className="fa-solid fa-chevron-down text-[10px]"></i></div>
                                    </div>
                                    <div className="relative">
                                        <label className={labelClass}>Status do Pagamento</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })} className={selectClass}>
                                            <option value={ExpenseStatus.REALIZED}>Paga / Realizada</option>
                                            <option value={ExpenseStatus.FUTURE}>A Pagar / Futura</option>
                                        </select>
                                        <div className="absolute right-4 bottom-3.5 pointer-events-none text-stone-400"><i className="fa-solid fa-chevron-down text-[10px]"></i></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className={labelClass}>Vincular a Projeto (Opcional)</label>
                                        <select
                                            value={formData.projectId}
                                            onChange={e => setFormData({ ...formData, projectId: e.target.value, stageId: '' })}
                                            className={selectClass}
                                        >
                                            <option value="">Apenas Administrativa</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <div className="absolute right-4 bottom-3.5 pointer-events-none text-stone-400"><i className="fa-solid fa-chevron-down text-[10px]"></i></div>
                                    </div>
                                    <div className="relative">
                                        <label className={labelClass}>Etapa do Projeto</label>
                                        <select
                                            disabled={!formData.projectId}
                                            value={formData.stageId}
                                            onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                                            className={`${selectClass} disabled:opacity-50`}
                                        >
                                            <option value="">Geral / Sem Etapa</option>
                                            {formData.projectId && projects.find(p => p.id === formData.projectId)?.stages?.map((s: any) => (
                                                <option key={s.name} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 bottom-3.5 pointer-events-none text-stone-400"><i className="fa-solid fa-chevron-down text-[10px]"></i></div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Fornecedor / Beneficiário</label>
                                    <input list="admin-suppliers-list" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className={inputClass} placeholder="Digite ou selecione..." />
                                    <datalist id="admin-suppliers-list">
                                        {suppliers.map(s => <option key={s.id} value={s.name} />)}
                                    </datalist>
                                </div>

                                <div>
                                    <label className={labelClass}>Comprovante / Anexo</label>
                                    <div className="relative group">
                                        <input type="file" onChange={e => setExpenseFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full p-4 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center gap-3 group-hover:bg-white/10 group-hover:border-emerald-500/50 transition-all">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black text-white uppercase tracking-wider">{expenseFile ? expenseFile.name : 'Clique para selecionar'}</p>
                                                <p className="text-[9px] font-bold text-emerald-300/50 uppercase tracking-widest mt-1">PDF, JPG, PNG (MÁX 5MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="submit" className="flex-1 py-4 bg-emerald-500 text-emerald-950 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-950/20">
                                        {editingId ? 'Salvar Alterações' : 'Confirmar Registro'}
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

export default AdminExpenses;
