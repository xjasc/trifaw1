// VERSION: 20260216_0905_FORCE_SYNC
import { AppData, UserRole, ProjectStatus, ExpenseStatus } from '../types';

const STORAGE_KEY = 'trifaw_sgi_data_v6';

const INITIAL_DATA: AppData = {
  projects: [],
  users: [
    {
      id: 'master-arao',
      name: 'Arão Costa - TRIFAW',
      email: 'arao.costa@trifaw.com.br',
      password: '198615',
      role: UserRole.ADMIN
    }
  ],
  suppliers: [],
  currentUser: null,
  adminExpenses: []
};

export const loadData = (): AppData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.users || parsed.users.length === 0) {
        return INITIAL_DATA;
      }
      if (!parsed.suppliers) parsed.suppliers = [];
      if (!parsed.adminExpenses) parsed.adminExpenses = [];
      return parsed;
    } catch (e) {
      console.error("Erro ao carregar dados do LocalStorage", e);
    }
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
