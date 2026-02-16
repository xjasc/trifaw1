
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE'
}

export enum ProjectStatus {
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO',
  COMPLETED = 'CONCLUÍDO'
}

export enum ExpenseStatus {
  REALIZED = 'PAGA/REALIZADA',
  FUTURE = 'PREVISTA/FUTURA'
}

export interface Supplier {
  id: string;
  name: string;
  document?: string; // Usado para CNPJ
  email?: string;
  phone?: string;
  category: string;
  city?: string;
  state?: string;
}

export interface Attachment {
  id: string;
  name: string;
  description?: string;
  url: string; 
  date: string;
  type: 'image' | 'document';
}

export interface PhotoTopic {
  id: string;
  title: string;
  date: string;
  photos: Attachment[];
}

export interface ProjectActivity {
  id: string;
  description: string;
  userName: string;
  date: string;
  type: 'financial' | 'status' | 'attachment' | 'progress';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  city?: string;
  state?: string;
  document?: string; // CPF ou CNPJ
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  status: ExpenseStatus;
  supplier: string;
  date: string;
  createdBy: string;
  attachmentUrl?: string; // Link para Nota Fiscal ou Recibo
}

export interface Measurement {
  id: string;
  description: string;
  amount: number;
  status: ExpenseStatus;
  supplier: string;
  date: string;
  createdBy: string;
  attachmentUrl?: string; // Novo campo para comprovante de medição
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
}

export interface ResponsibleData {
  id: string;
  name: string;
}

export interface ProjectStage {
  id: string;
  name: string;
  weight: number; // Percentage 0-100
  expectedCost: number;
  realCost: number;
  progress: number; // 0-100
}

export interface Project {
  id: string;
  projectCode?: string; // Código Internacional do Projeto
  name: string;
  description?: string; 
  budget: number;
  startDate: string;
  durationMonths?: number; // Duração em meses
  status: ProjectStatus;
  
  city?: string;
  state?: string;
  
  // Compatibilidade + Multiplos Responsáveis
  responsibleId?: string;
  responsibleName?: string;
  responsibles?: ResponsibleData[];

  // Mantendo compatibilidade com código antigo, mas adicionando suporte a lista
  clientId?: string; 
  clientName?: string;
  clientEmail?: string;
  clients?: ClientData[]; // Suporte a múltiplos clientes
  
  expenses: Expense[];
  measurements: Measurement[];
  documents: Attachment[]; // Nova seção de documentação técnica
  photoTopics: PhotoTopic[]; // Nova seção de acompanhamento agrupado
  activities: ProjectActivity[];
  physicalProgress: number; 
  createdBy: string;
  stages?: ProjectStage[]; // Nova estrutura de etapas
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  status: ExpenseStatus;
  supplier: string;
  date: string;
  createdBy: string;
  attachmentUrl?: string; // Link para Nota Fiscal ou Recibo
  stageId?: string; // Vínculo com etapa do projeto
  projectId?: string; // Opcional para despesas administrativas (sem projeto)
}

export interface AppData {
  projects: Project[];
  users: User[];
  suppliers: Supplier[];
  currentUser: User | null;
  adminExpenses: Expense[]; // Nova lista de despesas administrativas
}
