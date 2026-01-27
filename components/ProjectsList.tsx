
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, ProjectStatus, ExpenseStatus, User, UserRole, ClientData, ResponsibleData } from '../types';
import { api } from '../services/apiService';

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

// Mapa completo das principais cidades por estado
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

interface ProjectsListProps {
  projects: Project[];
  users: User[];
  onSelectProject: (id: string) => void;
  currentUser: User;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects = [], users = [], onSelectProject, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>( 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const admins = useMemo(() => (users || []).filter(u => u.role === UserRole.ADMIN), [users]);
  const clientsList = useMemo(() => (users || []).filter(u => u.role === UserRole.CLIENTE), [users]);

  // Form State
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    budget: 0, 
    startDate: new Date().toISOString().split('T')[0],
    city: '',
    state: '',
    durationMonths: 12,
    projectCode: ''
  });

  const [selectedClients, setSelectedClients] = useState<ClientData[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<ResponsibleData[]>([]);
  
  // Estado para lista de cidades dinâmica
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Gerar código do projeto ao abrir modal
  useEffect(() => {
    if (showModal) {
      const year = new Date().getFullYear();
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({ 
        ...prev, 
        projectCode: `TRF-${year}-${randomPart}`,
        state: '',
        city: ''
      }));
      setSelectedClients([]);
      setSelectedResponsibles([]);
      setAvailableCities([]);
    }
  }, [showModal]);

  // Atualizar cidades quando o estado muda
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setFormData(prev => ({ ...prev, state: newState, city: '' }));
    
    if (newState && CITIES_BY_STATE[newState]) {
      setAvailableCities(CITIES_BY_STATE[newState]);
    } else {
      setAvailableCities([]);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = filter === 'ALL' || p.status === filter;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.projectCode || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, searchTerm]);

  // -- LOGICA MULTI-SELECT CLIENTES --
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

  // -- LOGICA MULTI-SELECT RESPONSÁVEIS (RTs) --
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (selectedResponsibles.length === 0) return alert("Selecione pelo menos um Responsável Técnico.");

    setIsSubmitting(true);
    try {
      const primaryClient = selectedClients.length > 0 ? selectedClients[0] : null;
      const primaryResp = selectedResponsibles[0];

      const newProject: Project = {
        id: `p-${Date.now()}`,
        projectCode: formData.projectCode,
        name: formData.name,
        description: formData.description,
        budget: formData.budget,
        
        // Dados de RT (Lista + Primário para compatibilidade)
        responsibleId: primaryResp.id,
        responsibleName: selectedResponsibles.map(r => r.name.split(' ')[0]).join(', '),
        responsibles: selectedResponsibles,
        
        // Dados de Cliente (Lista + Primário para compatibilidade)
        clientId: primaryClient?.id || '',
        clientName: selectedClients.map(c => c.name).join(', ') || 'Projeto Interno',
        clientEmail: primaryClient?.email || '',
        clients: selectedClients,

        startDate: formData.startDate,
        durationMonths: formData.durationMonths,
        city: formData.city,
        state: formData.state,

        status: ProjectStatus.ACTIVE,
        expenses: [],
        measurements: [],
        documents: [],
        photoTopics: [],
        activities: [],
        physicalProgress: 0,
        createdBy: currentUser.id
      };

      await api.saveProject(newProject);
      setShowModal(false);
      setFormData({ 
        name: '', description: '', budget: 0, 
        startDate: new Date().toISOString().split('T')[0],
        city: '', state: '', durationMonths: 12, projectCode: ''
      });
      setSelectedClients([]);
      setSelectedResponsibles([]);
    } catch (err) {
      alert("Erro ao criar projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (window.confirm("Atenção: A exclusão é irreversível. Deseja deletar este projeto permanentemente?")) {
      try {
        await api.deleteProject(id);
      } catch (err) {
        alert("Erro ao excluir no servidor.");
      }
    }
  };

  const updateProjectStatus = async (e: React.ChangeEvent<HTMLSelectElement>, project: Project) => {
    e.stopPropagation(); // Impede abrir o projeto
    const newStatus = e.target.value as ProjectStatus;
    try {
        await api.saveProject({ ...project, status: newStatus });
    } catch (err) {
        alert("Erro ao atualizar status.");
    }
  };

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // ESTILOS DE INPUT (ALTO CONTRASTE SUAVE) - Alterado para Stone Claro
  const inputClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-400";
  const selectClass = "w-full p-3.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs outline-none focus:border-emerald-500 focus:bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20";
  // Ajuste do label para garantir leitura sobre o fundo escuro do modal
  const labelClass = "text-[9px] font-black uppercase text-emerald-200 tracking-widest ml-1 mb-1.5 block drop-shadow-sm";

  return (
    <div className="relative z-10 space-y-6 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-stretch gap-4">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
            <input type="text" placeholder="Buscar projeto, código ou cliente..." className="w-full pl-10 pr-4 py-3.5 bg-[#fafaf9]/90 backdrop-blur-sm border border-[#e7e5e4] rounded-2xl shadow-sm outline-none font-medium text-xs text-stone-700 focus:border-amber-500 transition-colors placeholder:text-stone-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex bg-[#fafaf9]/90 backdrop-blur-sm p-1.5 rounded-2xl border border-[#e7e5e4] shadow-sm overflow-x-auto no-scrollbar">
             {(['ALL', ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.INACTIVE] as const).map(s => (
               <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-[9px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${filter === s ? 'bg-emerald-950 text-white shadow-md' : 'text-stone-400 hover:text-emerald-900'}`}>
                 {s === 'ALL' ? 'Todos' : s}
               </button>
             ))}
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-amber-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg hover:bg-amber-800 transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-plus"></i> Novo Projeto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => {
          // Cálculos Financeiros e de Prazos dentro do Loop
          const realizedExpenses = (project.expenses || [])
            .filter(e => e.status === ExpenseStatus.REALIZED)
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          
          const budget = Number(project.budget) || 0;
          const balance = budget - realizedExpenses; // Saldo do Budget

          // Formatação de Datas
          const [y, m, d] = (project.startDate || '').split('-');
          const formattedStartDate = y ? `${d}/${m}/${y}` : '-';
          
          let formattedEndDate = '-';
          if (project.startDate && project.durationMonths) {
              const year = parseInt(y);
              const month = parseInt(m) - 1;
              const day = parseInt(d);
              const date = new Date(year, month, day);
              date.setMonth(date.getMonth() + project.durationMonths);
              formattedEndDate = date.toLocaleDateString('pt-BR');
          }

          return (
          <div key={project.id} className="bg-[#fafaf9]/95 backdrop-blur-sm rounded-[2rem] border border-[#e7e5e4] shadow-lg shadow-stone-900/5 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col group relative" onClick={() => onSelectProject(project.id)}>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 relative z-20">
                    {/* Status Select Badge */}
                    <div className="relative">
                        <select 
                            value={project.status} 
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateProjectStatus(e, project)}
                            className={`appearance-none px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wide border cursor-pointer outline-none transition-all hover:opacity-80
                                ${project.status === ProjectStatus.ACTIVE ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : ''}
                                ${project.status === ProjectStatus.COMPLETED ? 'bg-blue-50 text-blue-800 border-blue-100' : ''}
                                ${project.status === ProjectStatus.INACTIVE ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
                            `}
                        >
                            <option value={ProjectStatus.ACTIVE}>ATIVO</option>
                            <option value={ProjectStatus.COMPLETED}>CONCLUÍDO</option>
                            <option value={ProjectStatus.INACTIVE}>INATIVO</option>
                        </select>
                    </div>

                   {project.projectCode && <span className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wide border bg-stone-100 text-stone-500 border-stone-200">{project.projectCode}</span>}
                </div>
                {isAdmin && <button onClick={(e) => deleteProject(e, project.id)} className="text-stone-300 hover:text-red-600 transition-all px-1"><i className="fa-solid fa-trash-can text-sm"></i></button>}
              </div>
              
              <h3 className="text-lg font-black text-stone-800 mb-1 uppercase leading-tight truncate group-hover:text-emerald-900 transition-colors italic">{project.name}</h3>
              
              {/* Localização e Responsável (Mesma linha) */}
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide truncate max-w-[60%]">
                   {project.city && project.state ? `${project.city} - ${project.state}` : 'Local não informado'}
                 </p>
                 <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wide truncate flex items-center gap-1.5 shrink-0">
                   <i className="fa-solid fa-helmet-safety text-emerald-700"></i>
                   {project.responsibleName || 'S/ Resp.'}
                 </p>
              </div>
              
              <div className="mb-2">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold uppercase text-stone-400">Avanço Físico</span>
                    <span className="text-xs font-black text-emerald-800">{project.physicalProgress || 0}%</span>
                 </div>
                 <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-800 rounded-full transition-all duration-1000" style={{ width: `${project.physicalProgress || 0}%` }}></div>
                 </div>
              </div>
              
              {/* Grid de Informações Detalhadas (Simplificado e Compactado) */}
              <div className="grid grid-cols-3 gap-y-2 gap-x-2 mt-3 pt-3 border-t border-stone-100">
                  {/* Linha 1: Financeiro */}
                  <div className="col-span-1">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Custo (Budget)</p>
                       <p className="text-[10px] font-black text-stone-800 truncate" title={formatBRL(budget)}>{formatBRL(budget)}</p>
                  </div>
                  <div className="col-span-1 text-center">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Despesas</p>
                       <p className="text-[10px] font-black text-amber-700 truncate" title={formatBRL(realizedExpenses)}>{formatBRL(realizedExpenses)}</p>
                  </div>
                   <div className="col-span-1 text-right">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Saldo</p>
                       <p className={`text-[10px] font-black truncate ${balance >= 0 ? 'text-emerald-700' : 'text-red-600'}`} title={formatBRL(balance)}>{formatBRL(balance)}</p>
                  </div>
                  
                  {/* Linha 2: Cliente e Prazos (Responsável e Status removidos daqui) */}
                  <div className="col-span-1">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Cliente</p>
                       <p className="text-[9px] font-black text-stone-700 truncate" title={project.clientName || 'Interno'}>{project.clientName || 'Interno'}</p>
                  </div>
                  <div className="col-span-1 text-center">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Início</p>
                       <p className="text-[9px] font-bold text-stone-600 truncate">{formattedStartDate}</p>
                  </div>
                  <div className="col-span-1 text-right">
                       <p className="text-[8px] font-bold uppercase text-stone-400 tracking-wide">Término</p>
                       <p className="text-[9px] font-bold text-stone-600 truncate">{formattedEndDate}</p>
                  </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 text-center border-t border-stone-100 group-hover:bg-emerald-950/90 group-hover:text-white transition-colors">
               <span className="text-[9px] font-black uppercase text-stone-400 group-hover:text-white transition-colors flex items-center justify-center gap-2 tracking-widest">
                 Acessar Painel <i className="fa-solid fa-arrow-right"></i>
               </span>
            </div>
          </div>
        )})}
      </div>

      {showModal && isAdmin && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center md:p-4 font-inter">
          
          {/* Backdrop - Darker and Blurrier for Focus */}
          <div 
            className="absolute inset-0 bg-stone-900/95 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Container */}
          {/* Mobile: w-full h-full rounded-none (Fullscreen coverage) */}
          {/* Desktop: max-w-2xl rounded-2xl (Card centered) - UPDATED SIZE */}
          <div className="relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-emerald-950 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none">
               <div 
                 className="absolute inset-0 bg-cover bg-center opacity-30 grayscale-[20%]"
                 style={{ 
                   backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070')` 
                 }}
               ></div>
               <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/95 via-emerald-950/90 to-emerald-950/95 mix-blend-multiply"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 shrink-0 py-5 px-6 md:px-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic text-white drop-shadow-md">Novo Projeto</h2>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md mt-1">Iniciando novo empreendimento</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-10 h-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 md:p-10">
                    <form onSubmit={handleAddProject} className="space-y-6">
                        
                        {/* Linha 1: Código e Nome */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className={labelClass}>Código do Projeto</label>
                                <input type="text" readOnly className={`${inputClass} bg-stone-200/50 opacity-80 cursor-not-allowed`} value={formData.projectCode} />
                            </div>
                            <div className="md:col-span-3">
                                <label className={labelClass}>Nome do Projeto / Empreendimento</label>
                                <input required type="text" placeholder="Ex: Residencial Alphaville..." className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                        </div>
                        
                        {/* Linha 2: Detalhes */}
                        <div>
                            <label className={labelClass}>Detalhes do Projeto</label>
                            <textarea rows={3} placeholder="Descreva o escopo e objetivos da obra..." className={inputClass} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>

                        {/* Linha 3: Localidade (Dropdowns) */}
                        <div className="grid grid-cols-3 gap-4">
                             <div>
                                <label className={labelClass}>UF (Estado)</label>
                                <div className="relative">
                                    <select required className={selectClass} value={formData.state} onChange={handleStateChange}>
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
                                    <select required disabled={!formData.state} className={`${selectClass} ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                        <option value="" className="text-stone-400">{formData.state ? 'Selecione a cidade...' : 'Selecione UF primeiro'}</option>
                                        {availableCities.map(city => (
                                            <option key={city} value={city} className="text-stone-800">{city}</option>
                                        ))}
                                        {formData.state && <option value="Outra" className="text-stone-800 italic">Outra cidade...</option>}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none"></i>
                                </div>
                             </div>
                        </div>

                        {/* Linha 4: Responsáveis (Multi-Select) e Duração */}
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
                                        {selectedResponsibles.length === 0 && <span className="text-stone-400 text-[10px] p-1.5 italic">Selecione os engenheiros...</span>}
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
                                <label className={labelClass}>Duração Prevista (Meses)</label>
                                <input required type="number" min="1" placeholder="12" className={inputClass} value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        {/* Linha 5: Multi-Clientes */}
                        <div>
                            <label className={labelClass}>Clientes (Proprietários)</label>
                            <div className="bg-stone-100 border border-stone-300 rounded-xl p-2 mb-2">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedClients.map(client => (
                                        <span key={client.id} className="bg-stone-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-2 shadow-sm">
                                            {client.name}
                                            <button type="button" onClick={() => removeClient(client.id)} className="hover:text-red-300"><i className="fa-solid fa-times"></i></button>
                                        </span>
                                    ))}
                                    {selectedClients.length === 0 && <span className="text-stone-400 text-[10px] p-1.5 italic">Nenhum cliente selecionado</span>}
                                </div>
                                <div className="relative">
                                    <select onChange={handleAddClient} className={`w-full bg-white text-stone-800 text-xs p-2 rounded-lg outline-none appearance-none cursor-pointer border border-stone-200 focus:border-emerald-500`}>
                                        <option value="">+ Adicionar Cliente</option>
                                        {clientsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Linha 6: Budget e Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Budget Estimado (R$)</label>
                                <input required type="number" placeholder="0,00" className={inputClass} value={formData.budget} onChange={e => setFormData({...formData, budget: parseFloat(e.target.value)})} />
                            </div>
                            <div>
                                <label className={labelClass}>Data de Início</label>
                                <input required type="date" className={inputClass} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>
                        </div>

                         {/* Botão Movido para Dentro do Form */}
                        <div className="pt-6 mt-4 border-t border-white/5">
                            <button onClick={handleAddProject} disabled={isSubmitting} className={`w-full py-4 bg-stone-100 text-emerald-950 font-black uppercase rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.1)] text-[11px] tracking-widest ${isSubmitting ? 'opacity-50' : 'hover:bg-stone-200'} transition-all transform active:scale-[0.98] border border-stone-200 flex items-center justify-center gap-2`}>
                                {isSubmitting ? 'Processando...' : 'CADASTRAR PROJETO'} <i className="fa-solid fa-check text-lg"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectsList;
