// VERSION: 20260216_0905_FORCE_SYNC
import { AppData, User, Project, Supplier, UserRole } from '../types';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";

type Callback = (data: Partial<AppData>) => void;

export const api = {
  subscribeToData(callback: Callback) {
    if (!db) return () => { };

    try {
      const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback({ projects });
      }, (error) => console.error("Snapshot error (projects):", error));

      const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback({ users });
      }, (error) => console.error("Snapshot error (users):", error));

      const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => {
        const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        callback({ suppliers });
      }, (error) => console.error("Snapshot error (suppliers):", error));

      const unsubAdminExpenses = onSnapshot(collection(db, "admin_expenses"), (snapshot) => {
        const adminExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        callback({ adminExpenses });
      }, (error) => console.error("Snapshot error (admin_expenses):", error));

      return () => {
        unsubProjects();
        unsubUsers();
        unsubSuppliers();
        unsubAdminExpenses();
      };
    } catch (e) {
      console.error("Critical error subscribing to Firebase:", e);
      return () => { };
    }
  },

  async ensureMasterUser(): Promise<void> {
    try {
      const masterId = 'master-arao';
      const userDoc = await getDoc(doc(db, "users", masterId));

      if (!userDoc.exists()) {
        const master: User = {
          id: masterId,
          name: 'Arão Costa - TRIFAW',
          email: 'arao.costa@trifaw.com.br',
          password: '198615',
          role: UserRole.ADMIN
        };
        await setDoc(doc(db, "users", masterId), master);
      }
    } catch (e) {
      console.warn("Could not ensure master user, likely offline or permissions issue.");
    }
  },

  async saveProject(project: Project): Promise<void> {
    try {
      await setDoc(doc(db, "projects", project.id), project);
    } catch (e) {
      console.error("Error saving project:", e);
      throw new Error("Erro ao salvar projeto. Verifique sua conexão.");
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (e) {
      console.error("Error deleting project:", e);
      throw new Error("Erro ao excluir projeto.");
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, "users", user.id), user);
    } catch (e) {
      console.error("Error saving user:", e);
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (e) {
      console.error("Error deleting user:", e);
    }
  },

  async saveSupplier(supplier: Supplier): Promise<void> {
    try {
      await setDoc(doc(db, "suppliers", supplier.id), supplier);
    } catch (e) {
      console.error("Error saving supplier:", e);
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "suppliers", id));
    } catch (e) {
      console.error("Error deleting supplier:", e);
    }
  },

  async saveAdminExpense(expense: any): Promise<void> {
    try {
      await setDoc(doc(db, "admin_expenses", expense.id), expense);
    } catch (e) {
      console.error("Error saving admin expense:", e);
      throw new Error("Erro ao salvar despesa.");
    }
  },

  async deleteAdminExpense(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "admin_expenses", id));
    } catch (e) {
      console.error("Error deleting admin expense:", e);
      throw new Error("Erro ao excluir despesa.");
    }
  }
};