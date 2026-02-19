// VERSION: 20260216_0905_FORCE_SYNC
import React, { useState, useMemo, useEffect } from 'react';
import { Project, Expense, ExpenseStatus, ProjectStatus, User, UserRole, Attachment, Measurement, Supplier, PhotoTopic, ClientData, ResponsibleData, ProjectStage } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, PROJECT_STAGES_DEFAULT } from '../constants';
import { api } from '../services/apiService';
import JSZip from 'jszip';
import AdminExpenses from './AdminExpenses';

// Dados estáticos para Dropdowns
const BRAZIL_STATES = [
    { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

const CITIES_BY_STATE: Record<string, string[]> = {
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Brasileia', 'Senador Guiomard', 'Plácido de Castro', 'Xapuri', 'Mâncio Lima'],
    'AL': ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo', 'São Miguel dos Campos', 'Campo Alegre', 'Coruripe', 'Delmiro Gouveia'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão', 'Porto Grande', 'Tartarugalzinho', 'Pedra Branca do Amapari', 'Vitória do Jari', 'Calçoene'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari', 'Tabatinga', 'Maués', 'Tefé', 'Manicoré', 'Humaitá'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas', 'Barreiras', 'Alagoinhas'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'],
    'DF': ['Brasília', 'Ceilândia', 'Samambaia', 'Taguatinga', 'Plano Piloto', 'Planaltina', 'Águas Claras', 'Recanto das Emas', 'Gama', 'Guará'],
    'ES': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Guarapari', 'Colatina', 'Aracruz'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Águas Lindas de Goiás', 'Luziânia', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
    'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Paço do Lumiar', 'Codó', 'Açailândia', 'Bacabal', 'Balsas'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Primavera do Leste', 'Barra do Garças'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Sidrolândia', 'Naviraí', 'Nova Andradina', 'Aquidauana', 'Maracaju'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal', 'Abaetetuba', 'Cametá', 'Marituba', 'São Félix do Xingu'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa', 'Cabedelo', 'Cajazeiras', 'Guarabira', 'Sapé'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior', 'União', 'Altos', 'Esperantina'],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Macaé', 'Magé'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'São José de Mipibu'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Passo Fundo'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal', 'Rolim de Moura', 'Jaru', 'Guajará-Mirim', 'Machadinho d\'Oeste', 'Buritis'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Pacaraima', 'Cantá', 'Mucajaí', 'Alto Alegre', 'Amajari', 'Bonfim', 'Normandia'],
    'SC': ['Joinville', 'Florianópolis', 'Blumenau', 'São José', 'Itajaí', 'Chapecó', 'Palhoça', 'Criciúma', 'Jaraguá do Sul', 'Lages'],
    'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'São José dos Campos', 'Santo André', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá', 'São José do Rio Preto', 'Mogi das Cruzes', 'Santos'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão', 'Estância', 'Tobias Barreto', 'Simão Dias', 'Itabaianinha', 'Poço Verde'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins', 'Araguatins', 'Colinas do Tocantins', 'Guaraí', 'Tocantinópolis', 'Dianópolis']
};

interface ProjectDetailsProps {
    project: Project;
    users: User[];
    suppliers: Supplier[];
    onUpdateProject: (project: Project) => void;
    currentUser: User;
    globalExpenses: Expense[];
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, users = [], suppliers = [], onUpdateProject, currentUser, globalExpenses = [] }) => {
    if (!project) return null;

    const [activeTab, setActiveTab] = useState<'dashboard' | 'despesas' | 'admin-expenses' | 'measurements' | 'documentation' | 'photos'>('dashboard');
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

    const toggleStageExpansion = (stageName: string) => {
        const newSet = new Set(expandedStages);
        if (newSet.has(stageName)) newSet.delete(stageName);
        else newSet.add(stageName);
        setExpandedStages(newSet);
    };
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showAttachModal, setShowAttachModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [entryType, setEntryType] = useState<'EXPENSE' | 'MEASUREMENT'>('EXPENSE');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

    // -- STATES DE VISUALIZAÇÃO (LIGHTBOX E DOCUMENTOS) --
    const [lightbox, setLightbox] = useState<{ isOpen: boolean, photos: Attachment[], index: number }>({ isOpen: false, photos: [], index: 0 });
    const [viewingDoc, setViewingDoc] = useState<Attachment | null>(null);

    // Estados para Edição de Anexos (Fotos/Docs)
    const [editingAttachment, setEditingAttachment] = useState<{ id: string, description: string, topicId?: string } | null>(null);

    // Filtro de Mês para Despesas e Medições
    const [filterMonth, setFilterMonth] = useState<string>('ALL');
    const [isDownloading, setIsDownloading] = useState(false);

    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isMasterAdmin = currentUser.email === 'arao.costa@trifaw.com.br';

    const admins = useMemo(() => (users || []).filter(u => u.role === UserRole.ADMIN), [users]);
    const clientsList = useMemo(() => (users || []).filter(u => u.role === UserRole.CLIENTE), [users]);

    // Estados para Edição de Projeto
    const [projectFormData, setProjectFormData] = useState({
        name: '',
        description: '',
        budget: 0,
        startDate: new Date().toISOString().split('T')[0],
        city: '',
        state: '',
        durationMonths: 12,
        status: ProjectStatus.ACTIVE
    });

    const [selectedClients, setSelectedClients] = useState<ClientData[]>([]);
    const [selectedResponsibles, setSelectedResponsibles] = useState<ResponsibleData[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    // KEYBOARD NAVIGATION FOR LIGHTBOX
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightbox.isOpen) {
                if (e.key === 'ArrowRight') handleNextPhoto();
                if (e.key === 'ArrowLeft') handlePrevPhoto();
                if (e.key === 'Escape') setLightbox(prev => ({ ...prev, isOpen: false }));
            }
            if (viewingDoc && e.key === 'Escape') {
                setViewingDoc(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, viewingDoc]);

    // Inicializar dados de edição quando o modal abrir
    useEffect(() => {
        if (showEditProjectModal) {
            setProjectFormData({
                name: project.name || '',
                description: project.description || '',
                budget: project.budget || 0,
                startDate: project.startDate || new Date().toISOString().split('T')[0],
                city: project.city || '',
                state: project.state || '',
                durationMonths: project.durationMonths || 12,
                status: project.status || ProjectStatus.ACTIVE
            });

            // Carregar listas
            setSelectedClients(project.clients || (project.clientId ? [{ id: project.clientId, name: project.clientName || '', email: project.clientEmail || '' }] : []));
            setSelectedResponsibles(project.responsibles || (project.responsibleId ? [{ id: project.responsibleId, name: project.responsibleName || '' }] : []));

            // Carregar cidades
            if (project.state && CITIES_BY_STATE[project.state]) {
                setAvailableCities(CITIES_BY_STATE[project.state]);
            } else {
                setAvailableCities([]);
            }
        }
    }, [showEditProjectModal, project]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newState = e.target.value;
        setProjectFormData(prev => ({ ...prev, state: newState, city: '' }));

        if (newState && CITIES_BY_STATE[newState]) {
            setAvailableCities(CITIES_BY_STATE[newState]);
        } else {
            setAvailableCities([]);
        }
    };

    const handleAddClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        if (!clientId) return;
        const client = clientsList.find(c => c.id === clientId);
        if (client && !selectedClients.find(sc => sc.id === clientId)) {
            setSelectedClients(prev => [...prev, { id: client.id, name: client.name, email: client.email }]);
        }
        e.target.value = "";
    };
    const removeClient = (id: string) => setSelectedClients(prev => prev.filter(c => c.id !== id));

    const handleAddResponsible = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const respId = e.target.value;
        if (!respId) return;
        const resp = admins.find(a => a.id === respId);
        if (resp && !selectedResponsibles.find(sr => sr.id === respId)) {
            setSelectedResponsibles(prev => [...prev, { id: resp.id, name: resp.name }]);
        }
        e.target.value = "";
    };
    const removeResponsible = (id: string) => setSelectedResponsibles(prev => prev.filter(r => r.id !== id));

    // Form Data para despesas/medições
    const [formData, setFormData] = useState({
        description: '', amount: 0, category: CATEGORIES[0].id, supplier: '', status: ExpenseStatus.REALIZED, date: new Date().toISOString().split('T')[0], attachmentUrl: '', stageId: ''
    });
    const [expenseFile, setExpenseFile] = useState<File | null>(null);

    const [topicFormData, setTopicFormData] = useState({ title: '', date: new Date().toISOString().split('T')[0] });
    const [attachData, setAttachData] = useState<{ file: File | null, description: string, type: 'document' | 'photo' }>({ file: null, description: '', type: 'photo' });

    // Listas Ordenadas
    const sortedExpenses = useMemo(() => [...(project.expenses || [])].sort((a: Expense, b: Expense) => new Date(a.date).getTime() - new Date(b.date).getTime()), [project.expenses]);
    const sortedMeasurements = useMemo(() => [...(project.measurements || [])].sort((a: Measurement, b: Measurement) => new Date(a.date).getTime() - new Date(b.date).getTime()), [project.measurements]);

    // Lista de Meses Disponíveis para Filtro (Baseado na aba ativa)
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        const sourceList = activeTab === 'measurements' ? sortedMeasurements : sortedExpenses;

        sourceList.forEach((e: Expense | Measurement) => {
            if (e.date) {
                months.add(e.date.substring(0, 7)); // YYYY-MM
            }
        });
        // Ordenar do mais recente para o mais antigo para facilitar a seleção
        return Array.from(months).sort().reverse();
    }, [sortedExpenses, sortedMeasurements, activeTab]);

    // Itens Filtrados pelo Mês (Despesas ou Medições)
    const filteredList = useMemo(() => {
        const sourceList = activeTab === 'measurements' ? sortedMeasurements : sortedExpenses;
        if (filterMonth === 'ALL') return sourceList;
        return sourceList.filter((e: Expense | Measurement) => e.date.startsWith(filterMonth));
    }, [sortedExpenses, sortedMeasurements, filterMonth, activeTab]);

    const measurements = useMemo(() => [...(project.measurements || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [project.measurements]);
    const photoTopics = project.photoTopics || [];
    const documents = project.documents || [];

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    const estimatedEndDate = useMemo(() => {
        if (!project.startDate || !project.durationMonths) return null;
        const start = new Date(project.startDate);
        const end = new Date(start.setMonth(start.getMonth() + project.durationMonths));
        return end.toLocaleDateString('pt-BR');
    }, [project.startDate, project.durationMonths]);

    const dateLabel = useMemo(() => {
        if (project.status === ProjectStatus.COMPLETED) return "Término";
        return "Previsão de Término";
    }, [project.status]);

    // ANÁLISE PROFUNDA DOS DADOS FINANCEIROS
    const projectStats = useMemo(() => {
        const realizedExpenses = sortedExpenses.filter((e: Expense) => e.status === ExpenseStatus.REALIZED).reduce((acc: number, e: Expense) => acc + (Number(e.amount) || 0), 0);
        const futureExpenses = sortedExpenses.filter((e: Expense) => e.status === ExpenseStatus.FUTURE).reduce((acc: number, e: Expense) => acc + (Number(e.amount) || 0), 0);

        const realizedBilling = measurements.filter((m: Measurement) => m.status === ExpenseStatus.REALIZED).reduce((acc: number, m: Measurement) => acc + (Number(m.amount) || 0), 0);
        const futureBilling = measurements.filter((m: Measurement) => m.status === ExpenseStatus.FUTURE).reduce((acc: number, m: Measurement) => acc + (Number(m.amount) || 0), 0);

        const currentBalance = realizedBilling - realizedExpenses;

        // Saldo Projetado = (Recebido + A Receber) - (Pago + A Pagar)
        const projectedBalance = (realizedBilling + futureBilling) - (realizedExpenses + futureExpenses);

        return {
            realizedExpenses, futureExpenses,
            realizedBilling, futureBilling,
            currentBalance, projectedBalance,
        };
    }, [sortedExpenses, measurements, project.budget]);

    // --- GERENCIAMENTO DE ETAPAS (CUSTOMIZÁVEL) ---
    const [localStages, setLocalStages] = useState<ProjectStage[]>(() => {
        if (project.stages && project.stages.length > 0) {
            return project.stages;
        }
        return PROJECT_STAGES_DEFAULT.map(s => ({
            id: s.name,
            name: s.name,
            weight: s.weight,
            expectedCost: 0,
            realCost: 0,
            progress: 0
        }));
    });

    const [showStagesAccordion, setShowStagesAccordion] = useState(false);

    // Sincronizar se o projeto atualizar externamente
    useEffect(() => {
        if (project.stages && project.stages.length > 0) {
            setLocalStages(project.stages);
        }
    }, [project.stages]);

    // CÁLCULO DAS ETAPAS DO PROJETO (ORÇADO vs REALIZADO) - VALORES MANUAIS
    const projectStages = useMemo(() => {
        return localStages.map((stage) => {
            const stageId = stage.name;

            // Somar despesas desta etapa (locais do projeto + globais vinculadas)
            const stageExpenses = (project.expenses || []).filter(e => e.stageId === stageId);
            const stageGlobalExpenses = (globalExpenses || []).filter(e => e.projectId === project.id && e.stageId === stageId);

            const realCost = [...stageExpenses, ...stageGlobalExpenses].reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

            // Retornamos o que está no localStages (manual) + o realCost calculado + avanço financeiro automático
            const financialProgress = stage.expectedCost > 0 ? Math.min((realCost / stage.expectedCost) * 100, 100) : (realCost > 0 ? 100 : 0);

            return {
                ...stage,
                realCost,
                financialProgress
            };
        });
    }, [localStages, project.expenses, globalExpenses, project.id]);

    const handleStageWeightChange = (index: number, newWeight: string) => {
        let weight = parseFloat(newWeight.replace(',', '.'));
        if (isNaN(weight)) weight = 0;

        const newStages = [...localStages];
        newStages[index] = {
            ...newStages[index],
            weight,
            expectedCost: (weight / 100) * project.budget
        };
        setLocalStages(newStages);
    };

    const handleStageExpectedCostChange = (index: number, newCost: string) => {
        let cost = parseFloat(newCost.replace(',', '.'));
        if (isNaN(cost)) cost = 0;

        const newStages = [...localStages];
        const newWeight = project.budget > 0 ? (cost / project.budget) * 100 : 0;

        newStages[index] = {
            ...newStages[index],
            expectedCost: cost,
            weight: newWeight
        };
        setLocalStages(newStages);
    };

    const handleStageProgressChange = (index: number, newProgress: string) => {
        let progress = parseFloat(newProgress.replace(',', '.'));
        if (isNaN(progress)) progress = 0;
        progress = Math.max(0, Math.min(100, progress));

        const updatedStages = [...localStages];
        updatedStages[index] = { ...updatedStages[index], progress };
        setLocalStages(updatedStages);
    };

    // Cálculo do Avanço Físico Geral Ponderado
    const totalPhysicalProgress = useMemo(() => {
        const total = projectStages.reduce((acc, stage) => {
            return acc + (stage.progress * (stage.weight / 100));
        }, 0);
        return Math.round(total);
    }, [projectStages]);

    const saveStagesChanges = async () => {
        try {
            await api.saveProject({
                ...project,
                stages: localStages,
                physicalProgress: totalPhysicalProgress
            });
            alert("Etapas e avanço global atualizados com sucesso!");
        } catch (err) { console.error("Erro ao salvar etapas", err); alert("Erro ao salvar."); }
    };

    const handleUpdateProjectInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedResponsibles.length === 0) return alert("Selecione pelo menos um Responsável Técnico.");
        try {
            const primaryClient = selectedClients.length > 0 ? selectedClients[0] : null;
            const primaryResp = selectedResponsibles[0];
            const updated = {
                ...project, ...projectFormData,
                responsibleId: primaryResp.id,
                responsibleName: selectedResponsibles.map(r => r.name.split(' ')[0]).join(', '),
                responsibles: selectedResponsibles,
                clientId: primaryClient?.id || '',
                clientName: selectedClients.map(c => c.name).join(', ') || 'Projeto Interno',
                clientEmail: primaryClient?.email || '',
                clients: selectedClients,
                stages: localStages // Persistindo as etapas atuais
            };
            await api.saveProject(updated);
            setShowEditProjectModal(false);
        } catch (err) { alert("Erro ao atualizar."); }
    };

    const handleSaveTopic = async () => {
        if (!topicFormData.title) return alert("Título obrigatório");
        try {
            const newTopic: PhotoTopic = {
                id: `topic-${Date.now()}`,
                title: topicFormData.title,
                date: topicFormData.date,
                photos: []
            };
            const updatedTopics = [...(project.photoTopics || []), newTopic];
            await api.saveProject({ ...project, photoTopics: updatedTopics });
            setShowTopicModal(false);
            setTopicFormData({ title: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) { alert("Erro ao criar álbum."); }
    };

    const removeTopic = async (id: string) => {
        if (window.confirm("Excluir álbum?")) {
            const updated = photoTopics.filter(t => t.id !== id);
            await api.saveProject({ ...project, photoTopics: updated });
        }
    };

    // --- LOGICA DE EXCLUSÃO E EDIÇÃO DE FOTOS E DOCUMENTOS ---

    const handleDeletePhoto = async (topicId: string, photoId: string) => {
        if (!isAdmin) return;
        if (window.confirm("Deseja realmente excluir esta foto?")) {
            try {
                const updatedTopics = project.photoTopics.map(topic => {
                    if (topic.id === topicId) {
                        return {
                            ...topic,
                            photos: topic.photos.filter(p => p.id !== photoId)
                        };
                    }
                    return topic;
                });
                await api.saveProject({ ...project, photoTopics: updatedTopics });
            } catch (err) { alert("Erro ao excluir foto."); }
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!isAdmin) return;
        if (window.confirm("Deseja realmente excluir este documento?")) {
            try {
                const updatedDocs = project.documents.filter(d => d.id !== docId);
                await api.saveProject({ ...project, documents: updatedDocs });
            } catch (err) { alert("Erro ao excluir documento."); }
        }
    };

    const openEditAttachment = (attachment: Attachment, topicId?: string) => {
        if (!isAdmin) return;
        setEditingAttachment({
            id: attachment.id,
            description: attachment.description || attachment.name || '',
            topicId
        });
    };

    const handleSaveAttachmentChanges = async () => {
        if (!editingAttachment) return;
        try {
            if (editingAttachment.topicId) {
                // Editando Foto dentro de Tópico
                const updatedTopics = project.photoTopics.map(topic => {
                    if (topic.id === editingAttachment.topicId) {
                        return {
                            ...topic,
                            photos: topic.photos.map(p => p.id === editingAttachment.id ? { ...p, description: editingAttachment.description } : p)
                        };
                    }
                    return topic;
                });
                await api.saveProject({ ...project, photoTopics: updatedTopics });
            } else {
                // Editando Documento
                const updatedDocs = project.documents.map(d => d.id === editingAttachment.id ? { ...d, description: editingAttachment.description } : d);
                await api.saveProject({ ...project, documents: updatedDocs });
            }
            setEditingAttachment(null);
        } catch (err) {
            alert("Erro ao salvar alterações.");
        }
    };

    // --- NAVEGAÇÃO LIGHTBOX ---
    const handleNextPhoto = () => {
        if (!lightbox.isOpen) return;
        setLightbox(prev => ({
            ...prev,
            index: (prev.index + 1) % prev.photos.length
        }));
    };

    const handlePrevPhoto = () => {
        if (!lightbox.isOpen) return;
        setLightbox(prev => ({
            ...prev,
            index: (prev.index - 1 + prev.photos.length) % prev.photos.length
        }));
    };

    // --- ABERTURA DO VISUALIZADOR DE DOCUMENTOS ---
    const handleOpenDoc = (doc: Attachment) => {
        setViewingDoc(doc);
    };

    const deleteExpense = async (id: string, createdBy: string) => {
        const canDelete = isMasterAdmin || createdBy === currentUser.id;
        if (!canDelete) return alert("Você só pode excluir registros criados por você.");
        if (window.confirm("Deseja excluir esta despesa permanentemente?")) {
            const updatedExpenses = (project.expenses || []).filter(e => e.id !== id);
            try {
                await api.saveProject({ ...project, expenses: updatedExpenses });
            } catch (err) { alert("Erro ao excluir."); }
        }
    };

    const deleteMeasurement = async (id: string, createdBy: string) => {
        const canDelete = isMasterAdmin || createdBy === currentUser.id;
        if (!canDelete) return alert("Você só pode excluir registros criados por você.");
        if (window.confirm("Deseja excluir esta medição permanentemente?")) {
            const updatedMeasurements = (project.measurements || []).filter(m => m.id !== id);
            try {
                await api.saveProject({ ...project, measurements: updatedMeasurements });
            } catch (err) { alert("Erro ao excluir."); }
        }
    };

    const handleBatchDownload = async () => {
        setIsDownloading(true);
        try {
            const zip = new JSZip();
            let count = 0;

            // Determina qual lista usar com base na aba ativa
            // O `filteredList` já contém os itens corretos filtrados por mês
            // Precisamos apenas fazer cast para acessar attachmentUrl com segurança se for genérico
            const itemsToDownload = filteredList;

            itemsToDownload.forEach((item: any) => {
                if (item.attachmentUrl && item.attachmentUrl.startsWith('data:')) {
                    try {
                        const matches = item.attachmentUrl.match(/^data:(.+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const mimeType = matches[1];
                            const base64Data = matches[2];
                            const extension = mimeType.split('/')[1] || 'bin';

                            const safeDesc = item.description.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
                            const fileName = `${item.date}_${safeDesc}.${extension}`;

                            zip.file(fileName, base64Data, { base64: true });
                            count++;
                        }
                    } catch (e) {
                        console.error("Erro ao processar anexo", e);
                    }
                }
            });

            if (count === 0) {
                alert("Nenhum anexo encontrado para o período selecionado nesta aba.");
                setIsDownloading(false);
                return;
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            const filterName = filterMonth === 'ALL' ? 'TODOS' : filterMonth;
            const typeName = activeTab === 'measurements' ? 'FATURAMENTO' : 'DESPESAS';
            a.download = `${typeName}_${project.name.replace(/[^a-z0-9]/gi, '_')}_${filterName}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Erro ao gerar arquivo ZIP.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSaveEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let updatedProject = { ...project };
            let attachmentUrl = formData.attachmentUrl || '';

            // Processar upload de arquivo se houver
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

            if (entryType === 'EXPENSE') {
                const newE: Expense = {
                    id: editingItemId || `e-${Date.now()}`,
                    ...formData,
                    attachmentUrl,
                    createdBy: editingItemId ? (project.expenses.find(e => e.id === editingItemId)?.createdBy || currentUser.id) : currentUser.id
                };
                updatedProject.expenses = editingItemId ? (project.expenses || []).map(ex => ex.id === editingItemId ? newE : ex) : [...(project.expenses || []), newE];
            } else {
                const newM: Measurement = {
                    id: editingItemId || `m-${Date.now()}`,
                    description: formData.description,
                    amount: formData.amount,
                    status: formData.status,
                    date: formData.date,
                    supplier: '', // Medição não tem fornecedor
                    attachmentUrl, // Salvar anexo na medição
                    createdBy: editingItemId ? (project.measurements.find(m => m.id === editingItemId)?.createdBy || currentUser.id) : currentUser.id
                };
                updatedProject.measurements = editingItemId ? (project.measurements || []).map(m => m.id === editingItemId ? newM : m) : [...(project.measurements || []), newM];
            }
            await api.saveProject(updatedProject);
            setShowEntryModal(false);
            setEditingItemId(null);
            setExpenseFile(null);
        } catch (err) { alert("Erro ao salvar."); }
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document', topicId?: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachData({ file, description: '', type });
            setActiveTopicId(topicId || null);
            setShowAttachModal(true);
        }
    };

    // Reusable Classes
    const modalContainerClass = "fixed inset-0 z-[9999] flex items-center justify-center md:p-4 font-inter";
    const modalBackdropClass = "absolute inset-0 bg-stone-900/95 backdrop-blur-sm transition-opacity";
    const modalContentClass = "relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-emerald-950 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300";
    const modalHeaderClass = "relative z-10 shrink-0 py-5 px-6 md:px-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm";
    const inputClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400";
    const selectClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20";
    const labelClass = "text-[9px] font-black uppercase text-emerald-200 tracking-widest ml-1 mb-1.5 block drop-shadow-sm";

    const ModalBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale-[20%]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-950/90 to-emerald-950/95 mix-blend-multiply"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
            {/* HEADER DO PROJETO - Mantido */}
            <div className="bg-[#fafaf9] p-6 rounded-[2rem] shadow-sm border border-[#e7e5e4] flex flex-col gap-4">
                {/* ... Header Content ... */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[9px] font-black uppercase border border-stone-200">{project.projectCode || 'SEM CÓDIGO'}</span>
                            {project.city && <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide flex items-center gap-1"><i className="fa-solid fa-location-dot"></i> {project.city} - {project.state}</span>}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl md:text-2xl font-black text-stone-800 uppercase italic tracking-tighter break-words leading-tight">{project.name}</h2>
                            {isAdmin && <button onClick={() => setShowEditProjectModal(true)} className="text-[8px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-700 hover:text-white transition-all shrink-0"><i className="fa-solid fa-gear"></i> EDITAR</button>}
                        </div>

                        <div className="flex flex-col gap-1 mt-3 text-[9px] font-black uppercase text-stone-400 tracking-wide">
                            <div className="flex items-start gap-2">
                                <span className="min-w-[80px]">Proprietários:</span>
                                <div className="flex flex-wrap gap-1">
                                    {project.clients && project.clients.length > 0 ? (
                                        project.clients.map(c => <span key={c.id} className="text-stone-700 bg-stone-100 px-1.5 rounded">{c.name}</span>)
                                    ) : (
                                        <span className="text-stone-700">{project.clientName || 'Interno'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="min-w-[80px]">Resp. Técnico:</span>
                                <div className="flex flex-wrap gap-1">
                                    {project.responsibles && project.responsibles.length > 0 ? (
                                        project.responsibles.map(r => <span key={r.id} className="text-emerald-800 bg-emerald-50 px-1.5 rounded">{r.name}</span>)
                                    ) : (
                                        <span className="text-emerald-800">{project.responsibleName}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={`px-4 py-2 text-white rounded-xl shadow-sm ${project.status === ProjectStatus.ACTIVE ? 'bg-emerald-950' :
                            project.status === ProjectStatus.COMPLETED ? 'bg-blue-900' :
                                'bg-amber-700'
                            }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{project.status}</span>
                        </div>
                        {estimatedEndDate && (
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase text-stone-400 tracking-widest">{dateLabel}</p>
                                <p className="text-xs font-bold text-emerald-800">{estimatedEndDate}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- BARRA DE PROGRESSO & ETAPAS (REFORMULADA - ACORDEÃO) --- */}
                <div className="bg-white p-4 rounded-2xl border border-stone-200 transition-all duration-300">
                    {/* Barra Principal (Resumo) */}
                    <div className="flex justify-between items-center px-1 mb-2">
                        <button
                            onClick={() => setShowStagesAccordion(!showStagesAccordion)}
                            className="flex items-center gap-2 group outline-none"
                        >
                            <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest group-hover:text-emerald-700 transition-colors">Avanço Físico Geral</span>
                            <i className={`fa-solid fa-chevron-down text-stone-300 text-[10px] transition-transform duration-300 ${showStagesAccordion ? 'rotate-180 text-emerald-600' : ''}`}></i>
                        </button>
                        <span className="text-lg font-black text-emerald-900 italic">{totalPhysicalProgress}%</span>
                    </div>

                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200 mb-2">
                        <div className="h-full bg-emerald-800 rounded-full transition-all duration-1000" style={{ width: `${totalPhysicalProgress}%` }}></div>
                        {/* Slider global desativado para privilegiar cálculo por etapas */}
                        <div className="absolute inset-0 w-full opacity-0 pointer-events-none" title="Avanço calculado pelas etapas"></div>
                    </div>

                    {/* Accordion de Etapas */}
                    {showStagesAccordion && (
                        <div className="mt-6 pt-4 border-t border-stone-100 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Detalhamento por Etapas</h4>
                                    <p className="text-[9px] text-stone-400 max-w-md">Edite os pesos das etapas para recalcular o custo esperado. Os valores realizados são automáticos com base nas despesas.</p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={saveStagesChanges}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wide transition-colors border border-emerald-200"
                                    >
                                        <i className="fa-solid fa-floppy-disk mr-1"></i> Salvar Etapas
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-stone-100">
                                <table className="w-full">
                                    <thead className="bg-stone-50">
                                        <tr className="border-b border-stone-200">
                                            <th className="w-10"></th>
                                            <th className="text-left py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider">Etapa</th>
                                            <th className="text-center py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-16">Peso (%)</th>
                                            <th className="text-right py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-24">Custo Esp.</th>
                                            <th className="text-right py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-24">Custo Real</th>
                                            <th className="text-center py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-16">Saldo</th>
                                            <th className="text-center py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-32">Av. Finan</th>
                                            <th className="text-center py-2 px-3 text-[8px] font-black uppercase text-stone-400 tracking-wider w-24">Av. Físico</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-50">
                                        {projectStages.map((stage, idx) => {
                                            const isOverBudget = stage.realCost > stage.expectedCost;
                                            return (
                                                <React.Fragment key={idx}>
                                                    <tr className={`hover:bg-stone-50/50 transition-colors ${expandedStages.has(stage.name) ? 'bg-emerald-50/30' : ''}`}>
                                                        <td className="py-2 px-3 text-center">
                                                            <button
                                                                onClick={() => toggleStageExpansion(stage.name)}
                                                                className="w-6 h-6 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center text-stone-400"
                                                            >
                                                                <i className={`fa-solid fa-chevron-${expandedStages.has(stage.name) ? 'up' : 'down'} text-[8px]`}></i>
                                                            </button>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[8px] font-bold text-stone-300 w-4">{idx + 1}</span>
                                                                <span className="text-[10px] font-black uppercase text-stone-700 tracking-tight">{stage.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            {isAdmin ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={stage.weight}
                                                                    onChange={(e) => handleStageWeightChange(idx, e.target.value)}
                                                                    className="w-12 text-center bg-white border border-stone-200 rounded px-1 py-1 text-[9px] font-black text-stone-700 focus:border-emerald-500 outline-none"
                                                                />
                                                            ) : (
                                                                <span className="text-[9px] font-black text-stone-500">{stage.weight.toFixed(1)}%</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-3 text-right">
                                                            {isAdmin ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={stage.expectedCost}
                                                                    onChange={(e) => handleStageExpectedCostChange(idx, e.target.value)}
                                                                    className="w-20 text-right bg-white border border-stone-200 rounded px-1 py-1 text-[9px] font-black text-stone-700 focus:border-emerald-500 outline-none"
                                                                />
                                                            ) : (
                                                                <span className="text-[9px] font-black text-stone-600 font-mono">{formatBRL(stage.expectedCost)}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-3 text-right">
                                                            <span className={`text-[9px] font-black font-mono ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                                                                {formatBRL(stage.realCost)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${isOverBudget ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                                                <i className={`fa-solid fa-circle-${isOverBudget ? 'minus' : 'plus'}`}></i>
                                                                {isOverBudget ? '-' : '+'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {/* Barra Financeira (Automática) */}
                                                            <div className="flex flex-col gap-0.5 w-full">
                                                                <div className="flex justify-between items-center text-[7px] font-black uppercase text-stone-400">
                                                                    <span>Finan.</span>
                                                                    <span className={stage.financialProgress > 100 ? 'text-red-600' : 'text-emerald-600'}>{stage.financialProgress.toFixed(0)}%</span>
                                                                </div>
                                                                <div className="h-1 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                                                                    <div className={`h-full transition-all duration-500 ${stage.financialProgress > 100 ? 'bg-red-500' : 'bg-emerald-600'}`} style={{ width: `${Math.min(stage.financialProgress, 100)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {/* Barra Física (Manual) */}
                                                            <div className="flex flex-col gap-0.5 w-full">
                                                                <div className="flex justify-between items-center text-[7px] font-black uppercase text-stone-400">
                                                                    <span>Fis.</span>
                                                                    <span className="text-stone-700">{stage.progress.toFixed(0)}%</span>
                                                                </div>
                                                                {isAdmin ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        step="1"
                                                                        value={stage.progress}
                                                                        onChange={(e) => handleStageProgressChange(idx, e.target.value)}
                                                                        className="w-full text-center bg-white border border-stone-200 rounded px-1 py-0.5 text-[9px] font-black text-stone-700 focus:border-emerald-500 outline-none"
                                                                    />
                                                                ) : (
                                                                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                                                                        <div className="h-full bg-stone-700 transition-all duration-500" style={{ width: `${stage.progress}%` }}></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedStages.has(stage.name) && (
                                                        <tr>
                                                            <td colSpan={8} className="bg-stone-50/50 p-0">
                                                                <div className="px-10 py-4 border-l-2 border-emerald-500 ml-5 animate-in slide-in-from-left-2 transition-all">
                                                                    <h5 className="text-[8px] font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                        <i className="fa-solid fa-list-check"></i> Detalhamento de Despesas - {stage.name}
                                                                    </h5>
                                                                    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
                                                                        <table className="w-full text-left">
                                                                            <thead className="bg-stone-100/50 text-[7px] font-black uppercase text-stone-400">
                                                                                <tr>
                                                                                    <th className="py-1.5 px-3">Data</th>
                                                                                    <th className="py-1.5 px-3">Descrição</th>
                                                                                    <th className="py-1.5 px-3">Fornecedor</th>
                                                                                    <th className="py-1.5 px-3 text-right">Valor</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-stone-100">
                                                                                {[...(project.expenses || []), ...(globalExpenses || []).filter(ge => ge.projectId === project.id)].filter(e => e.stageId === stage.name).length === 0 ? (
                                                                                    <tr>
                                                                                        <td colSpan={4} className="py-4 text-center text-[9px] font-bold text-stone-400 italic">Nenhuma despesa vinculada a esta etapa.</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    [...(project.expenses || []), ...(globalExpenses || []).filter(ge => ge.projectId === project.id)]
                                                                                        .filter(e => e.stageId === stage.name)
                                                                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                                                        .map((exp, eidx) => (
                                                                                            <tr key={eidx} className="text-[9px] hover:bg-stone-50 transition-colors">
                                                                                                <td className="py-2 px-3 text-stone-500">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                                                                                <td className="py-2 px-3 font-bold text-stone-700">{exp.description}</td>
                                                                                                <td className="py-2 px-3 text-stone-500 font-bold">{exp.supplier}</td>
                                                                                                <td className="py-2 px-3 text-right font-black text-emerald-700">{formatBRL(exp.amount)}</td>
                                                                                            </tr>
                                                                                        ))
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-stone-50 border-t border-stone-200">
                                        <tr>
                                            <td colSpan={2} className="py-2 px-3 text-[9px] font-black uppercase text-stone-600">Total</td>
                                            <td className="py-2 px-3 text-center text-[9px] font-black text-stone-600">
                                                {projectStages.reduce((acc, s) => acc + s.weight, 0).toFixed(2)}%
                                            </td>
                                            <td className="py-2 px-3 text-right text-[9px] font-bold text-emerald-800">{formatBRL(project.budget || 0)}</td>
                                            <td className="py-2 px-3 text-right text-[9px] font-bold text-emerald-800">{formatBRL(projectStages.reduce((acc, s) => acc + s.realCost, 0))}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TABS NAVEGAÇÃO */}
            <div className="sticky top-2 z-40">
                <div className="relative bg-[#e6e4e0]/95 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-stone-300 flex overflow-x-auto gap-2 items-center justify-center no-scrollbar">
                    {(isAdmin ? ['dashboard', 'despesas', 'admin-expenses', 'measurements', 'documentation', 'photos'] : ['photos', 'documentation']).map((tab: any) => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setFilterMonth('ALL'); }} className={`flex-none py-2.5 px-6 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-emerald-950 text-white shadow-md' : 'text-stone-500 hover:text-emerald-900 hover:bg-white/50'}`}>
                            {tab === 'dashboard' ? 'Financeiro' : tab === 'despesas' ? 'Despesas' : tab === 'admin-expenses' ? 'Despesas Adm' : tab === 'measurements' ? 'Faturamento' : tab === 'documentation' ? 'Documentos' : 'Relatório Fotográfico'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'dashboard' && isAdmin && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* 1. INDICADORES PRINCIPAIS (REALIZADO E ORÇAMENTO) */}
                        <div>
                            <h3 className="px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-cash-register"></i> Indicadores Principais (Realizado)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Budget */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-stone-100 border border-stone-200 shadow-sm transition-all hover:shadow-lg group min-h-[140px]">
                                    <div className="absolute -right-4 -top-4 text-8xl opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform text-stone-900 pointer-events-none">
                                        <i className="fa-solid fa-file-invoice"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white text-stone-700">
                                                <i className="fa-solid fa-file-invoice"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Orçamento Contratual</span>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-stone-800">{formatBRL(Number(project.budget))}</h3>
                                            <p className="text-[9px] font-bold text-stone-400 mt-1 uppercase">Valor Total do Projeto</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Entradas (Recebido) */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-blue-50 border border-blue-100 shadow-sm transition-all hover:shadow-lg group min-h-[140px]">
                                    <div className="absolute -right-4 -top-4 text-8xl opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform text-blue-900 pointer-events-none">
                                        <i className="fa-solid fa-arrow-trend-up"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white text-blue-700">
                                                <i className="fa-solid fa-arrow-trend-up"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Entradas (Recebido)</span>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-blue-800">{formatBRL(projectStats.realizedBilling)}</h3>
                                            <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase">Total Faturado</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Saídas (Pago) */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-amber-50 border border-amber-100 shadow-sm transition-all hover:shadow-lg group min-h-[140px]">
                                    <div className="absolute -right-4 -top-4 text-8xl opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform text-amber-900 pointer-events-none">
                                        <i className="fa-solid fa-arrow-trend-down"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white text-amber-700">
                                                <i className="fa-solid fa-arrow-trend-down"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Saídas (Pago)</span>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-amber-800">{formatBRL(projectStats.realizedExpenses)}</h3>
                                            <p className="text-[9px] font-bold text-amber-400 mt-1 uppercase">Despesas Totais</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Saldo Atual (NOVO) */}
                                <div className={`relative overflow-hidden rounded-[2rem] p-6 border shadow-sm transition-all hover:shadow-lg group min-h-[140px] ${projectStats.currentBalance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className={`absolute -right-4 -top-4 text-8xl opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform pointer-events-none ${projectStats.currentBalance >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                        <i className="fa-solid fa-scale-balanced"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white ${projectStats.currentBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                <i className="fa-solid fa-scale-balanced"></i>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${projectStats.currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Saldo Atual (Caixa)</span>
                                        </div>
                                        <div>
                                            <h3 className={`text-3xl lg:text-4xl font-black italic tracking-tighter ${projectStats.currentBalance >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{formatBRL(projectStats.currentBalance)}</h3>
                                            <p className={`text-[9px] font-bold mt-1 uppercase ${projectStats.currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Recebido - Pago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. INDICADORES SECUNDÁRIOS (PROVISÕES E FUTURO) */}
                        <div>
                            <h3 className="px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-binoculars"></i> Provisões e Futuro
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {/* A Receber (Futuro) */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-[#f0f9ff] border border-blue-100 shadow-sm transition-all hover:shadow-lg group min-h-[120px]">
                                    <div className="absolute -right-4 -top-4 text-7xl opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform text-blue-900 pointer-events-none">
                                        <i className="fa-regular fa-calendar-check"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white text-blue-500">
                                                <i className="fa-regular fa-calendar-check"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">A Receber (Futuro)</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-blue-900/80">{formatBRL(projectStats.futureBilling)}</h3>
                                    </div>
                                </div>

                                {/* A Pagar (Futuro) */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-[#fffbeb] border border-amber-100 shadow-sm transition-all hover:shadow-lg group min-h-[120px]">
                                    <div className="absolute -right-4 -top-4 text-7xl opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform text-amber-900 pointer-events-none">
                                        <i className="fa-regular fa-clock"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm bg-white text-amber-500">
                                                <i className="fa-regular fa-clock"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">A Pagar (Futuro)</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-amber-900/80">{formatBRL(projectStats.futureExpenses)}</h3>
                                    </div>
                                </div>

                                {/* Saldo Final Projetado (NOVO LUGAR) */}
                                <div className="relative overflow-hidden rounded-[2rem] p-6 bg-purple-50 border border-purple-100 shadow-sm transition-all hover:shadow-lg group min-h-[120px]">
                                    <div className="absolute -right-4 -top-4 text-7xl opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform text-purple-900 pointer-events-none">
                                        <i className="fa-solid fa-bullseye"></i>
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-white text-purple-700 flex items-center justify-center text-lg shadow-sm">
                                                <i className="fa-solid fa-bullseye"></i>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Saldo Final Projetado</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-purple-900">{formatBRL(projectStats.projectedBalance)}</h3>
                                            <p className="text-[9px] font-bold text-purple-400 mt-1 uppercase">Lucro Estimado ao Final</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>



                )}

                {/* --- DESPESAS (LINHA DO TEMPO COMPACTA) --- */}
                {
                    activeTab === 'despesas' && isAdmin && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {/* Header de Ações: Filtro Mês + Downloads + Novo */}
                            <div className="bg-[#fafaf9] p-2 rounded-2xl border border-[#e7e5e4] shadow-sm flex flex-col md:flex-row gap-2 items-center justify-between">

                                {/* Scroll Horizontal de Meses */}
                                <div className="flex-1 w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 px-1 py-1">
                                    <button
                                        onClick={() => setFilterMonth('ALL')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterMonth === 'ALL' ? 'bg-emerald-950 text-white shadow-md' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                                    >
                                        Todos
                                    </button>
                                    {availableMonths.map(month => {
                                        const [y, m] = month.split('-');
                                        const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
                                        return (
                                            <button
                                                key={month}
                                                onClick={() => setFilterMonth(month)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${filterMonth === month ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                                            >
                                                {monthName} {y}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto px-1">
                                    <button
                                        onClick={handleBatchDownload}
                                        disabled={isDownloading}
                                        className="flex-1 md:flex-none px-4 py-2 bg-stone-100 text-stone-600 font-bold uppercase text-[9px] rounded-xl hover:bg-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide border border-stone-200"
                                    >
                                        {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-zipper"></i>}
                                        Baixar Notas
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItemId(null);
                                            setEntryType('EXPENSE');
                                            setFormData({ description: '', amount: 0, category: CATEGORIES[0].id, supplier: '', status: ExpenseStatus.REALIZED, date: new Date().toISOString().split('T')[0], attachmentUrl: '', stageId: '' });
                                            setExpenseFile(null);
                                            setShowEntryModal(true);
                                        }}
                                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-950 text-white font-black uppercase text-[9px] rounded-xl shadow-md hover:bg-emerald-900 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide"
                                    >
                                        <i className="fa-solid fa-plus"></i> Novo
                                    </button>
                                </div>
                            </div>

                            {/* Linha do Tempo de Despesas - Estilo Compacto (Feed) */}
                            <div className="relative border-l-2 border-stone-200 ml-4 space-y-3 pl-6 py-2 animate-in fade-in duration-500">
                                {filteredList.length === 0 && (
                                    <p className="text-stone-400 font-bold uppercase text-[10px] italic">Nenhuma despesa encontrada para este filtro.</p>
                                )}

                                {(filteredList as Expense[]).map(exp => {
                                    const categoryColor = CATEGORY_COLORS[exp.category] || '#57534e';
                                    const icon = CATEGORY_ICONS[exp.category] || 'fa-receipt';
                                    const isRealized = exp.status === ExpenseStatus.REALIZED;
                                    const canDelete = isMasterAdmin || exp.createdBy === currentUser.id;
                                    const dateObj = new Date(exp.date);

                                    return (
                                        <div key={exp.id} className="relative group">
                                            {/* Dot na Linha do Tempo */}
                                            <div
                                                className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                                                style={{ backgroundColor: categoryColor }}
                                            ></div>

                                            {/* Card Compacto - Linha Única/Dupla */}
                                            <div className="bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all overflow-hidden flex items-center p-3 gap-3">

                                                {/* Data Compacta */}
                                                <div className="flex flex-col items-center justify-center px-2 py-1 bg-stone-50 rounded-lg border border-stone-100 min-w-[50px]">
                                                    <span className="text-[10px] font-black text-stone-700 leading-none">{dateObj.getDate().toString().padStart(2, '0')}</span>
                                                    <span className="text-[7px] font-bold text-stone-400 uppercase leading-none mt-0.5">{dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                                </div>

                                                {/* Ícone Categoria */}
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-sm shrink-0" style={{ backgroundColor: categoryColor }}>
                                                    <i className={`fa-solid ${icon}`}></i>
                                                </div>

                                                {/* Detalhes Centrais */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-stone-800 text-[11px] uppercase truncate">{exp.description}</h4>
                                                        {exp.attachmentUrl && (
                                                            <span title="Com anexo" className="text-stone-300 text-[9px]"><i className="fa-solid fa-paperclip"></i></span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-stone-400">
                                                        <span className="truncate max-w-[120px]">{exp.supplier || 'N/A'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                                        <span style={{ color: categoryColor }}>{exp.category}</span>
                                                    </div>
                                                </div>

                                                {/* Valor e Status */}
                                                <div className="text-right shrink-0">
                                                    <div className="font-black text-emerald-950 italic text-xs">{formatBRL(exp.amount)}</div>
                                                    <div className={`text-[7px] font-black uppercase mt-0.5 ${isRealized ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {isRealized ? 'Pago' : 'Prev.'}
                                                    </div>
                                                </div>

                                                {/* Botões de Ação Compactos (Hover) */}
                                                <div className="flex items-center gap-1 pl-2 border-l border-stone-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItemId(exp.id);
                                                            setEntryType('EXPENSE');
                                                            setFormData({
                                                                description: exp.description,
                                                                amount: exp.amount,
                                                                category: exp.category,
                                                                supplier: exp.supplier,
                                                                status: exp.status,
                                                                date: exp.date,
                                                                attachmentUrl: exp.attachmentUrl || '',
                                                                stageId: exp.stageId || ''
                                                            });
                                                            setExpenseFile(null);
                                                            setShowEntryModal(true);
                                                        }}
                                                        className="w-7 h-7 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-emerald-700 transition-colors flex items-center justify-center"
                                                        title="Ver Detalhes / Editar"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                                    </button>

                                                    {canDelete && (
                                                        <button
                                                            onClick={() => deleteExpense(exp.id, exp.createdBy)}
                                                            className="w-7 h-7 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                                                            title="Excluir"
                                                        >
                                                            <i className="fa-solid fa-trash text-[10px]"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'measurements' && isAdmin && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {/* Header de Ações: Filtro Mês + Downloads + Novo */}
                            <div className="bg-[#fafaf9] p-2 rounded-2xl border border-[#e7e5e4] shadow-sm flex flex-col md:flex-row gap-2 items-center justify-between">

                                {/* Scroll Horizontal de Meses (Reutilizado) */}
                                <div className="flex-1 w-full overflow-x-auto no-scrollbar flex items-center gap-1.5 px-1 py-1">
                                    <button
                                        onClick={() => setFilterMonth('ALL')}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterMonth === 'ALL' ? 'bg-emerald-950 text-white shadow-md' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                                    >
                                        Todos
                                    </button>
                                    {availableMonths.map(month => {
                                        const [y, m] = month.split('-');
                                        const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
                                        return (
                                            <button
                                                key={month}
                                                onClick={() => setFilterMonth(month)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${filterMonth === month ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'border-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-600'}`}
                                            >
                                                {monthName} {y}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto px-1">
                                    <button
                                        onClick={handleBatchDownload}
                                        disabled={isDownloading}
                                        className="flex-1 md:flex-none px-4 py-2 bg-stone-100 text-stone-600 font-bold uppercase text-[9px] rounded-xl hover:bg-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide border border-stone-200"
                                    >
                                        {isDownloading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-zipper"></i>}
                                        Baixar Notas
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItemId(null);
                                            setEntryType('MEASUREMENT');
                                            setFormData({ description: '', amount: 0, category: '', supplier: '', status: ExpenseStatus.REALIZED, date: new Date().toISOString().split('T')[0], attachmentUrl: '', stageId: '' });
                                            setExpenseFile(null);
                                            setShowEntryModal(true);
                                        }}
                                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-950 text-white font-black uppercase text-[9px] rounded-xl shadow-md hover:bg-emerald-900 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide"
                                    >
                                        <i className="fa-solid fa-plus"></i> Novo
                                    </button>
                                </div>
                            </div>

                            {/* Linha do Tempo de Medições */}
                            <div className="relative border-l-2 border-stone-200 ml-4 space-y-3 pl-6 py-2 animate-in fade-in duration-500">
                                {filteredList.length === 0 && (
                                    <p className="text-stone-400 font-bold uppercase text-[10px] italic">Nenhuma medição encontrada para este filtro.</p>
                                )}

                                {(filteredList as Measurement[]).map(meas => {
                                    const isRealized = meas.status === ExpenseStatus.REALIZED;
                                    const canDelete = isMasterAdmin || meas.createdBy === currentUser.id;
                                    const dateObj = new Date(meas.date);
                                    // Cor baseada no status: Verde se realizado, Azul se futuro (entrada)
                                    const statusColor = isRealized ? '#059669' : '#3b82f6';

                                    return (
                                        <div key={meas.id} className="relative group">
                                            {/* Dot na Linha do Tempo */}
                                            <div
                                                className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                                                style={{ backgroundColor: statusColor }}
                                            ></div>

                                            {/* Card Compacto */}
                                            <div className="bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all overflow-hidden flex items-center p-3 gap-3">

                                                {/* Data Compacta */}
                                                <div className="flex flex-col items-center justify-center px-2 py-1 bg-stone-50 rounded-lg border border-stone-100 min-w-[50px]">
                                                    <span className="text-[10px] font-black text-stone-700 leading-none">{dateObj.getDate().toString().padStart(2, '0')}</span>
                                                    <span className="text-[7px] font-bold text-stone-400 uppercase leading-none mt-0.5">{dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                                </div>

                                                {/* Ícone Faturamento */}
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-sm shrink-0" style={{ backgroundColor: statusColor }}>
                                                    <i className="fa-solid fa-file-invoice-dollar"></i>
                                                </div>

                                                {/* Detalhes Centrais */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-stone-800 text-[11px] uppercase truncate">{meas.description}</h4>
                                                        {meas.attachmentUrl && (
                                                            <span title="Com anexo" className="text-stone-300 text-[9px]"><i className="fa-solid fa-paperclip"></i></span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-stone-400">
                                                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                                        <span>Faturamento</span>
                                                    </div>
                                                </div>

                                                {/* Valor e Status */}
                                                <div className="text-right shrink-0">
                                                    <div className="font-black text-emerald-950 italic text-xs">{formatBRL(meas.amount)}</div>
                                                    <div className={`text-[7px] font-black uppercase mt-0.5 ${isRealized ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                        {isRealized ? 'Recebido' : 'Previsto'}
                                                    </div>
                                                </div>

                                                {/* Botões de Ação Compactos (Hover) */}
                                                <div className="flex items-center gap-1 pl-2 border-l border-stone-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItemId(meas.id);
                                                            setEntryType('MEASUREMENT');
                                                            setFormData({
                                                                description: meas.description,
                                                                amount: meas.amount,
                                                                status: meas.status,
                                                                date: meas.date,
                                                                category: '', supplier: '',
                                                                attachmentUrl: meas.attachmentUrl || '',
                                                                stageId: ''
                                                            });
                                                            setExpenseFile(null);
                                                            setShowEntryModal(true);
                                                        }}
                                                        className="w-7 h-7 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-emerald-700 transition-colors flex items-center justify-center"
                                                        title="Ver Detalhes / Editar"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                                    </button>

                                                    {canDelete && (
                                                        <button
                                                            onClick={() => deleteMeasurement(meas.id, meas.createdBy)}
                                                            className="w-7 h-7 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                                                            title="Excluir"
                                                        >
                                                            <i className="fa-solid fa-trash text-[10px]"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }

                {/* FOTOS - COM CORREÇÃO NO EVENTO DE CLIQUE */}
                {
                    activeTab === 'photos' && (
                        <div className="space-y-8">
                            <div className="bg-[#fafaf9] p-6 rounded-[2rem] text-center flex flex-col items-center gap-3 shadow-sm border border-[#e7e5e4]">
                                <h3 className="text-lg font-black uppercase italic text-stone-800">Acompanhamento Fotográfico</h3>
                                {isAdmin && <button onClick={() => setShowTopicModal(true)} className="px-6 py-3 bg-emerald-950 text-white text-[9px] font-black uppercase rounded-xl shadow-md hover:bg-emerald-900 transition-transform active:scale-95 tracking-widest"><i className="fa-solid fa-plus-circle mr-2"></i> Novo Álbum</button>}
                            </div>
                            <div className="space-y-8">
                                {photoTopics.map((topic, topicIdx) => (
                                    <div key={topic.id} className="bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] shadow-sm">
                                        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-4">
                                            <div>
                                                <div className="flex items-center gap-3"><h4 className="text-lg font-black text-stone-900 uppercase italic tracking-tighter">{topic.title}</h4>{isAdmin && <button onClick={() => removeTopic(topic.id)} className="text-red-400 hover:text-red-600 transition-colors"><i className="fa-solid fa-trash-can text-sm"></i></button>}</div>
                                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">Ref: {new Date(topic.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            {isAdmin && <label className="px-4 py-2 bg-stone-200 text-stone-700 text-[8px] font-black uppercase rounded-lg cursor-pointer hover:bg-emerald-950 hover:text-white transition-all shadow-sm">Add Fotos<input type="file" multiple className="hidden" onChange={(e) => handleFileSelection(e, 'photo', topic.id)} /></label>}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {(topic.photos || []).map((photo, photoIdx) => (
                                                <div key={photo.id} onClick={() => setLightbox({ isOpen: true, photos: topic.photos, index: photoIdx })} className="group cursor-pointer relative overflow-hidden rounded-xl">
                                                    <div className="relative aspect-square bg-stone-100 border border-stone-200 shadow-sm overflow-hidden">
                                                        <img src={photo.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        {/* Overlay de Ações (Editar/Excluir) - CORREÇÃO DE CLIQUE: Removido stopPropagation do container */}
                                                        {isAdmin && (
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openEditAttachment(photo, topic.id); }}
                                                                    className="w-8 h-8 rounded-full bg-white text-stone-600 hover:text-emerald-700 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                                                                    title="Editar Legenda"
                                                                >
                                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(topic.id, photo.id); }}
                                                                    className="w-8 h-8 rounded-full bg-white text-stone-600 hover:text-red-600 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                                                                    title="Excluir Foto"
                                                                >
                                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[7px] font-black text-stone-500 mt-1.5 text-center uppercase truncate">{photo.description || 'S/ Legenda'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'documentation' && (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="bg-[#fafaf9] p-6 rounded-[2rem] border border-[#e7e5e4] flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-black uppercase italic text-stone-800">Acervo Técnico</h3>
                                {isAdmin && <label className="px-5 py-3 bg-emerald-950 text-white text-[9px] font-black uppercase rounded-xl cursor-pointer hover:bg-emerald-900 transition-transform active:scale-95 shadow-md tracking-widest">Anexar PDF<input type="file" className="hidden" onChange={(e) => handleFileSelection(e, 'document')} /></label>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="bg-[#fafaf9] p-4 rounded-xl border border-[#e7e5e4] shadow-sm flex items-center justify-between group hover:bg-white transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleOpenDoc(doc)}>
                                            <div className="w-10 h-10 bg-red-50 text-red-700 rounded-lg flex items-center justify-center text-lg border border-red-100 shrink-0"><i className="fa-solid fa-file-pdf"></i></div>
                                            <div className="min-w-0">
                                                <p className="font-black text-[10px] uppercase text-stone-800 truncate group-hover:text-emerald-800 transition-colors">{doc.description || doc.name}</p>
                                                <p className="text-[8px] text-stone-400 font-bold uppercase">{new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Botão de Visualização */}
                                            <button onClick={() => handleOpenDoc(doc)} className="w-8 h-8 rounded-lg bg-stone-100 text-stone-400 hover:bg-blue-100 hover:text-blue-700 transition-all flex items-center justify-center" title="Visualizar Documento">
                                                <i className="fa-solid fa-eye text-[10px]"></i>
                                            </button>

                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => openEditAttachment(doc)} className="w-8 h-8 rounded-lg bg-stone-100 text-stone-400 hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center justify-center"><i className="fa-solid fa-pen text-[10px]"></i></button>
                                                    <button onClick={() => handleDeleteDocument(doc.id)} className="w-8 h-8 rounded-lg bg-stone-100 text-stone-400 hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center"><i className="fa-solid fa-trash text-[10px]"></i></button>
                                                </>
                                            )}
                                            <a href={doc.url} download className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-emerald-950 hover:text-white transition-all"><i className="fa-solid fa-download text-xs"></i></a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {activeTab === 'admin-expenses' && isAdmin && (
                    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                        <AdminExpenses
                            expenses={globalExpenses.filter(e => e.projectId === project.id)}
                            projects={[]}
                            onSaveExpense={async (expense: Expense) => { await api.saveAdminExpense({ ...expense, projectId: project.id }); }}
                            onDeleteExpense={async (id: string) => { await api.deleteAdminExpense(id); }}
                            currentUser={currentUser}
                            suppliers={suppliers}
                        />
                    </div>
                )}
            </div >

            {/* MODAL DE EDIÇÃO DE ANEXO (LEGENDA) */}
            {
                editingAttachment && (
                    <div className={modalContainerClass}>
                        <div className={modalBackdropClass} onClick={() => setEditingAttachment(null)}></div>
                        <div className={modalContentClass}>
                            <ModalBackground />
                            <div className={modalHeaderClass}>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic text-white drop-shadow-md">Editar Legenda</h3>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Alterar descrição do arquivo</p>
                                </div>
                                <button onClick={() => setEditingAttachment(null)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><i className="fa-solid fa-times text-lg"></i></button>
                            </div>
                            <div className="flex-1 p-6 md:p-8 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClass}>Descrição / Legenda</label>
                                        <input
                                            type="text"
                                            placeholder="Descreva o arquivo..."
                                            className={inputClass}
                                            value={editingAttachment.description}
                                            onChange={e => setEditingAttachment({ ...editingAttachment, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <button
                                            onClick={handleSaveAttachmentChanges}
                                            className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-lg text-[11px] tracking-widest hover:bg-stone-200 transition-all"
                                        >
                                            Salvar Alterações <i className="fa-solid fa-check ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* NOVO: LIGHTBOX (VISUALIZADOR DE FOTOS) COM NAVEGAÇÃO */}
            {
                lightbox.isOpen && lightbox.photos.length > 0 && (
                    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col justify-center items-center animate-in fade-in duration-300">
                        {/* Header Lightbox */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
                                {lightbox.index + 1} / {lightbox.photos.length}
                            </span>
                            <button
                                onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
                                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        {/* Main Image */}
                        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">

                            {/* Botão Anterior */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                                className="absolute left-2 md:left-8 z-20 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-sm"
                            >
                                <i className="fa-solid fa-chevron-left text-lg"></i>
                            </button>

                            <img
                                src={lightbox.photos[lightbox.index].url}
                                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
                                alt="Foto do Projeto"
                            />

                            {/* Botão Próximo */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                                className="absolute right-2 md:right-8 z-20 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-sm"
                            >
                                <i className="fa-solid fa-chevron-right text-lg"></i>
                            </button>
                        </div>

                        {/* Caption Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center z-20">
                            <p className="text-white font-bold text-sm md:text-base uppercase tracking-wider drop-shadow-md">
                                {lightbox.photos[lightbox.index].description || 'Sem legenda'}
                            </p>
                            <p className="text-white/50 text-[10px] font-bold uppercase mt-1">
                                {new Date(lightbox.photos[lightbox.index].date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                )
            }

            {/* NOVO: VISUALIZADOR DE DOCUMENTOS (Maximizado) */}
            {
                viewingDoc && (
                    <div className="fixed inset-0 z-[10000] bg-stone-900/95 backdrop-blur-sm flex items-center justify-center p-0 animate-in fade-in duration-300">
                        <div className="bg-white w-[98vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                            {/* Header Viewer */}
                            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-stone-800 uppercase truncate max-w-md">{viewingDoc.description || viewingDoc.name}</h3>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase">Visualização de Arquivo</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={viewingDoc.url} download className="px-4 py-2 bg-emerald-950 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-900 transition-all flex items-center gap-2">
                                        <i className="fa-solid fa-download"></i> Baixar
                                    </a>
                                    <button onClick={() => setViewingDoc(null)} className="w-9 h-9 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all">
                                        <i className="fa-solid fa-xmark text-lg"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Content Viewer */}
                            <div className="flex-1 bg-stone-200 overflow-hidden flex items-center justify-center relative">
                                {viewingDoc.url.includes('application/pdf') || viewingDoc.url.match(/\.pdf$/i) ? (
                                    <iframe src={viewingDoc.url} className="w-full h-full" title="PDF Viewer"></iframe>
                                ) : viewingDoc.type === 'image' || viewingDoc.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    <img src={viewingDoc.url} className="max-w-full max-h-full object-contain" alt="Documento" />
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400 text-3xl">
                                            <i className="fa-solid fa-file-circle-question"></i>
                                        </div>
                                        <h4 className="text-stone-700 font-bold uppercase mb-2">Visualização indisponível</h4>
                                        <p className="text-stone-500 text-xs mb-6">Este formato de arquivo não pode ser visualizado diretamente no navegador.</p>
                                        <a href={viewingDoc.url} download className="text-emerald-700 font-black uppercase text-xs hover:underline">Clique para baixar o arquivo</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showEditProjectModal && (
                    <div className={modalContainerClass}>
                        <div className={modalBackdropClass} onClick={() => setShowEditProjectModal(false)}></div>
                        <div className={modalContentClass}>
                            <ModalBackground />
                            <div className={modalHeaderClass}>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white drop-shadow-md">Editar Projeto</h2>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Alterar dados do empreendimento</p>
                                </div>
                                <button onClick={() => setShowEditProjectModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 text-emerald-200 hover:bg-white/20 transition-colors"><i className="fa-solid fa-times text-lg"></i></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                                <form onSubmit={handleUpdateProjectInfo} className="space-y-6 pb-6 relative z-10">
                                    {/* Linha 1: Código (readonly) */}
                                    <div>
                                        <label className={labelClass}>Código do Projeto</label>
                                        <input type="text" readOnly className={`${inputClass} opacity-50 cursor-not-allowed`} value={project.projectCode} />
                                    </div>

                                    {/* Linha 2: Nome */}
                                    <div>
                                        <label className={labelClass}>Nome do Projeto / Empreendimento</label>
                                        <input required type="text" placeholder="Nome" className={inputClass} value={projectFormData.name} onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })} />
                                    </div>

                                    {/* Linha 3: Descrição */}
                                    <div>
                                        <label className={labelClass}>Detalhes do Projeto</label>
                                        <textarea rows={3} placeholder="Descrição" className={inputClass} value={projectFormData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>

                                    {/* Linha 4: Localidade */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelClass}>UF (Estado)</label>
                                            <div className="relative">
                                                <select required className={selectClass} value={projectFormData.state} onChange={handleStateChange}>
                                                    <option value="" className="text-stone-400">UF...</option>
                                                    {BRAZIL_STATES.map(st => (
                                                        <option key={st.uf} value={st.uf} className="text-stone-800">{st.uf}</option>
                                                    ))}
                                                </select>
                                                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelClass}>Cidade</label>
                                            <div className="relative">
                                                <select required disabled={!projectFormData.state} className={`${selectClass} ${!projectFormData.state ? 'opacity-50 cursor-not-allowed' : ''}`} value={projectFormData.city} onChange={e => setProjectFormData({ ...projectFormData, city: e.target.value })}>
                                                    <option value="" className="text-stone-400">{projectFormData.state ? 'Selecione a cidade...' : 'Selecione UF'}</option>
                                                    {availableCities.map(city => (
                                                        <option key={city} value={city} className="text-stone-800">{city}</option>
                                                    ))}
                                                    {projectFormData.state && <option value="Outra" className="text-stone-800 italic">Outra cidade...</option>}
                                                </select>
                                                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linha 5: Responsáveis (Multi-select) e Duração */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Responsáveis Técnicos</label>
                                            <div className="bg-stone-100 border border-stone-300 rounded-xl p-2 mb-1">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedResponsibles.map(resp => (
                                                        <span key={resp.id} className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                                                            {resp.name.split(' ')[0]}
                                                            <button type="button" onClick={() => removeResponsible(resp.id)} className="hover:text-red-200"><i className="fa-solid fa-times"></i></button>
                                                        </span>
                                                    ))}
                                                    {selectedResponsibles.length === 0 && <span className="text-stone-400 text-[10px] p-1.5 italic">Selecione...</span>}
                                                </div>
                                                <div className="relative">
                                                    <select onChange={handleAddResponsible} className={`w-full bg-white text-stone-800 text-xs p-2 rounded-lg outline-none appearance-none cursor-pointer border border-stone-200 focus:border-emerald-500`}>
                                                        <option value="">+ Adicionar RT</option>
                                                        {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Duração (Meses)</label>
                                            <input required type="number" min="1" className={inputClass} value={projectFormData.durationMonths} onChange={e => setProjectFormData({ ...projectFormData, durationMonths: parseInt(e.target.value) })} />
                                        </div>
                                    </div>

                                    {/* Linha 6: Clientes (Multi-select) */}
                                    <div>
                                        <label className={labelClass}>Clientes (Proprietários)</label>
                                        <div className="bg-stone-100 border border-stone-300 rounded-xl p-2 mb-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedClients.map(client => (
                                                    <span key={client.id} className="bg-stone-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                                                        {client.name}
                                                        <button type="button" onClick={() => removeClient(client.id)} className="hover:text-red-300"><i className="fa-solid fa-times"></i></button>
                                                    </span>
                                                ))}
                                                {selectedClients.length === 0 && <span className="text-stone-400 text-[10px] p-1.5 italic">Selecione...</span>}
                                            </div>
                                            <div className="relative">
                                                <select onChange={handleAddClient} className={`w-full bg-white text-stone-800 text-xs p-2 rounded-lg outline-none appearance-none cursor-pointer border border-stone-200 focus:border-emerald-500`}>
                                                    <option value="">+ Adicionar Cliente</option>
                                                    {clientsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linha 7: Budget e Data e Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Budget Estimado (R$)</label>
                                            <input type="number" placeholder="Budget" className={inputClass} value={projectFormData.budget} onChange={e => setProjectFormData({ ...projectFormData, budget: parseFloat(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Data Início</label>
                                            <input type="date" className={inputClass} value={projectFormData.startDate} onChange={e => setProjectFormData({ ...projectFormData, startDate: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Status do Projeto</label>
                                        <div className="relative">
                                            <select className={selectClass} value={projectFormData.status} onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value as ProjectStatus })}>
                                                <option value={ProjectStatus.ACTIVE} className="text-stone-800">Ativo</option>
                                                <option value={ProjectStatus.COMPLETED} className="text-stone-800">Concluído</option>
                                                <option value={ProjectStatus.INACTIVE} className="text-stone-800">Inativo</option>
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                        </div>
                                    </div>

                                    {/* Botão de Salvar */}
                                    <div className="pt-4 border-t border-white/5">
                                        <button onClick={handleUpdateProjectInfo} className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.1)] text-[11px] tracking-widest hover:bg-stone-200 transition-all transform active:scale-[0.98] border border-stone-200 flex items-center justify-center gap-2">
                                            Salvar Alterações <i className="fa-solid fa-check text-lg"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MODAL LANÇAMENTO FINANCEIRO - Stylized Theme */}
            {
                showEntryModal && (
                    <div className={modalContainerClass}>
                        <div className={modalBackdropClass} onClick={() => setShowEntryModal(false)}></div>
                        <div className={modalContentClass}>
                            <ModalBackground />

                            <div className={modalHeaderClass}>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black uppercase italic text-white drop-shadow-md">Lançamento</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${entryType === 'EXPENSE' ? 'text-emerald-400' : 'text-amber-400'} drop-shadow-md`}>
                                        {entryType === 'EXPENSE' ? 'Nova Despesa (Saída)' : 'Nova Medição (Entrada)'}
                                    </p>
                                </div>
                                <button onClick={() => setShowEntryModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><i className="fa-solid fa-times text-lg"></i></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                                <form onSubmit={handleSaveEntry} className="space-y-6 pb-6 relative z-10">

                                    {entryType === 'EXPENSE' ? (
                                        <>
                                            <div>
                                                <label className={labelClass}>Descrição da Despesa</label>
                                                <input required type="text" placeholder="Ex: Cimento CP-II" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Valor (R$)</label>
                                                    <input required type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Data da Despesa</label>
                                                    <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Categoria</label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.category}
                                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                            className={selectClass}
                                                        >
                                                            {CATEGORIES.map((cat) => (
                                                                <option key={cat.id} value={cat.id} className="text-stone-800">
                                                                    {cat.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Fornecedor</label>
                                                    <div className="relative">
                                                        <select className={selectClass} value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}>
                                                            <option value="" className="text-stone-400">Selecione...</option>
                                                            {suppliers.map(s => <option key={s.id} value={s.name} className="text-stone-800">{s.name}</option>)}
                                                        </select>
                                                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Seleção de Etapa do Projeto */}
                                            <div>
                                                <label className={labelClass}>Etapa do Projeto (Vínculo)</label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.stageId || ''}
                                                        onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
                                                        className={selectClass}
                                                    >
                                                        <option value="" className="text-stone-400">Sem etapa específica (Despesa Geral)</option>
                                                        {projectStages.map((stage) => (
                                                            <option key={stage.name} value={stage.name} className="text-stone-800">
                                                                {stage.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                                </div>
                                            </div>

                                            {/* Novo Campo de Status */}
                                            <div>
                                                <label className={labelClass}>Status do Pagamento</label>
                                                <div className="relative">
                                                    <select
                                                        className={selectClass}
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
                                                    >
                                                        <option value={ExpenseStatus.REALIZED} className="text-stone-800">✅ Despesa Paga / Realizada</option>
                                                        <option value={ExpenseStatus.FUTURE} className="text-stone-800">📅 Despesa Prevista / Futura</option>
                                                    </select>
                                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                                </div>
                                            </div>

                                            {/* Anexo Nota Fiscal */}
                                            <div>
                                                <label className={labelClass}>Nota Fiscal / Comprovante</label>
                                                <div className="border border-stone-300 border-dashed rounded-xl p-4 bg-stone-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-emerald-400 transition-colors">
                                                    <input
                                                        type="file"
                                                        id="expense-file"
                                                        className="hidden"
                                                        onChange={(e) => setExpenseFile(e.target.files?.[0] || null)}
                                                        accept="image/*,application/pdf"
                                                    />
                                                    <label htmlFor="expense-file" className="cursor-pointer text-center w-full">
                                                        {expenseFile ? (
                                                            <span className="text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
                                                                <i className="fa-solid fa-check-circle"></i> {expenseFile.name}
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-stone-400 font-bold text-xs flex items-center gap-2">
                                                                    <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                                                                    Clique para anexar comprovante
                                                                </span>
                                                                {formData.attachmentUrl && (
                                                                    <a href={formData.attachmentUrl} target="_blank" className="text-[9px] text-blue-600 font-bold mt-2 hover:underline z-20 relative" onClick={(e) => e.stopPropagation()}>
                                                                        (Ver atual)
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Campos para Medição (Entrada) - Agora com mais detalhes
                                        <>
                                            <div>
                                                <label className={labelClass}>Descrição da Medição</label>
                                                <input required type="text" placeholder="Ex: Medição 01 - Fundação" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Valor Medido (R$)</label>
                                                    <input required type="number" step="0.01" placeholder="0,00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Data de Referência</label>
                                                    <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClass} />
                                                </div>
                                            </div>

                                            {/* Status do Recebimento */}
                                            <div>
                                                <label className={labelClass}>Status do Faturamento</label>
                                                <div className="relative">
                                                    <select
                                                        className={selectClass}
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
                                                    >
                                                        <option value={ExpenseStatus.REALIZED} className="text-stone-800">✅ Fatura Paga / Recebida</option>
                                                        <option value={ExpenseStatus.FUTURE} className="text-stone-800">📅 Fatura Emitida / A Receber</option>
                                                    </select>
                                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                                </div>
                                            </div>

                                            {/* Anexo da Medição */}
                                            <div>
                                                <label className={labelClass}>Comprovante / Nota Fiscal</label>
                                                <div className="border border-stone-300 border-dashed rounded-xl p-4 bg-stone-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-emerald-400 transition-colors">
                                                    <input
                                                        type="file"
                                                        id="measurement-file" // ID único
                                                        className="hidden"
                                                        onChange={(e) => setExpenseFile(e.target.files?.[0] || null)}
                                                        accept="image/*,application/pdf"
                                                    />
                                                    <label htmlFor="measurement-file" className="cursor-pointer text-center w-full">
                                                        {expenseFile ? (
                                                            <span className="text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
                                                                <i className="fa-solid fa-check-circle"></i> {expenseFile.name}
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-stone-400 font-bold text-xs flex items-center gap-2">
                                                                    <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                                                                    Anexar NF ou Comprovante
                                                                </span>
                                                                {formData.attachmentUrl && (
                                                                    <a href={formData.attachmentUrl} target="_blank" className="text-[9px] text-blue-600 font-bold mt-2 hover:underline z-20 relative" onClick={(e) => e.stopPropagation()}>
                                                                        (Ver atual)
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Botão Salvar Registro */}
                                    <div className="pt-4 border-t border-white/5">
                                        <button onClick={handleSaveEntry} className={`w-full py-4 font-black uppercase rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all text-[11px] tracking-widest flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 ${entryType === 'EXPENSE' ? 'text-emerald-950' : 'text-amber-900'}`}>
                                            Salvar Registro <i className="fa-solid fa-floppy-disk text-lg"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ... Resto dos Modais ... */}
            {
                showTopicModal && (
                    <div className={modalContainerClass}>
                        <div className={modalBackdropClass} onClick={() => setShowTopicModal(false)}></div>
                        <div className={modalContentClass}>
                            {/* ... Content ... */}
                            <ModalBackground />
                            <div className={modalHeaderClass}>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic text-white drop-shadow-md">Novo Álbum</h3>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Relatório Fotográfico</p>
                                </div>
                                <button onClick={() => setShowTopicModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><i className="fa-solid fa-times text-lg"></i></button>
                            </div>
                            <div className="flex-1 p-6 md:p-8 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClass}>Título do Álbum / Etapa</label>
                                        <input type="text" placeholder="Ex: Fundação e Baldrames" className={inputClass} value={topicFormData.title} onChange={e => setTopicFormData({ ...topicFormData, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Data de Referência</label>
                                        <input type="date" className={inputClass} value={topicFormData.date} onChange={e => setTopicFormData({ ...topicFormData, date: e.target.value })} />
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <button onClick={handleSaveTopic} className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-lg text-[11px] tracking-widest hover:bg-stone-200 transition-all">
                                            Criar Álbum <i className="fa-solid fa-check ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showAttachModal && (
                    <div className={modalContainerClass}>
                        <div className={modalBackdropClass} onClick={() => setShowAttachModal(false)}></div>
                        <div className={modalContentClass}>
                            <ModalBackground />
                            <div className={modalHeaderClass}>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic text-white drop-shadow-md">Anexar Arquivo</h3>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">{attachData.type === 'photo' ? 'Upload de Imagem' : 'Documento Técnico'}</p>
                                </div>
                                <button onClick={() => setShowAttachModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20"><i className="fa-solid fa-times text-lg"></i></button>
                            </div>
                            <div className="flex-1 p-6 md:p-8 relative z-10">
                                <div className="space-y-6">
                                    <div className="p-4 bg-black/30 rounded-xl border border-white/10 text-center">
                                        <p className="text-white text-xs font-bold">{attachData.file?.name}</p>
                                        <p className="text-emerald-400 text-[9px] uppercase mt-1">{(attachData.file?.size || 0) / 1024 > 1024 ? `${((attachData.file?.size || 0) / 1024 / 1024).toFixed(2)} MB` : `${((attachData.file?.size || 0) / 1024).toFixed(2)} KB`}</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Descrição / Legenda (Opcional)</label>
                                        <input type="text" placeholder="Descreva o arquivo..." className={inputClass} value={attachData.description} onChange={e => setAttachData({ ...attachData, description: e.target.value })} />
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <button
                                            onClick={async () => {
                                                if (!attachData.file) return;
                                                try {
                                                    const reader = new FileReader();
                                                    reader.readAsDataURL(attachData.file);
                                                    reader.onload = async () => {
                                                        const url = reader.result as string;
                                                        const newAtt: Attachment = {
                                                            id: `att-${Date.now()}`,
                                                            name: attachData.file?.name || 'Arquivo',
                                                            description: attachData.description,
                                                            url: url,
                                                            date: new Date().toISOString(),
                                                            type: attachData.type === 'photo' ? 'image' : 'document'
                                                        };

                                                        if (attachData.type === 'photo' && activeTopicId) {
                                                            const topics = [...(project.photoTopics || [])];
                                                            const topicIndex = topics.findIndex(t => t.id === activeTopicId);
                                                            if (topicIndex >= 0) {
                                                                topics[topicIndex].photos.push(newAtt);
                                                                await api.saveProject({ ...project, photoTopics: topics });
                                                            }
                                                        } else {
                                                            const docs = [...(project.documents || []), newAtt];
                                                            await api.saveProject({ ...project, documents: docs });
                                                        }
                                                        setShowAttachModal(false);
                                                    };
                                                } catch (err) { alert("Erro ao anexar."); }
                                            }}
                                            className="w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-lg text-[11px] tracking-widest hover:bg-stone-200 transition-all"
                                        >
                                            Confirmar Upload <i className="fa-solid fa-cloud-arrow-up ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ProjectDetails;