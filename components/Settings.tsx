
import React, { useRef, useState } from 'react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onUpdateData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  // Helper safe stringify function to handle circular references from Firestore objects
  const safeStringify = (obj: any, space = 2) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return; // Remove circular reference
        }
        seen.add(value);
      }
      return value;
    }, space);
  };

  const exportData = () => {
    try {
      // Use safeStringify instead of JSON.stringify to prevent crash
      const dataStr = safeStringify(data, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `TRIFAW_SGI_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setStatusMsg({ text: 'Backup gerado e baixado com sucesso!', type: 'success' });
      setTimeout(() => setStatusMsg({ text: '', type: null }), 5000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: 'Erro ao gerar backup (Referência Circular detectada e tratada).', type: 'error' });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as AppData;
        
        // Verificação básica de integridade
        if (parsed.users && parsed.projects) {
          if (window.confirm("Atenção: A importação irá substituir TODOS os dados atuais deste navegador pelos dados do arquivo. Deseja prosseguir?")) {
            onUpdateData(parsed);
            setStatusMsg({ text: 'Dados importados com sucesso! A aplicação foi atualizada.', type: 'success' });
          }
        } else {
          throw new Error('Formato de arquivo inválido.');
        }
      } catch (err) {
        setStatusMsg({ text: 'Erro ao importar arquivo. Certifique-se de que é um backup válido do TRIFAW SGI.', type: 'error' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none mb-4">Sistema & Portabilidade</h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-12">Gerencie seus dados e realize backups de segurança</p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl mb-12">
            <div className="flex gap-4">
              <i className="fa-solid fa-circle-info text-amber-500 text-xl mt-1"></i>
              <div>
                <h4 className="font-black text-amber-900 text-xs uppercase tracking-widest mb-2">Nota de Portabilidade</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Atualmente, seus dados são salvos <b>localmente neste navegador</b>. Para acessar as mesmas informações em outro computador ou navegador, você deve exportar um backup aqui e importá-lo no outro dispositivo.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* EXPORT */}
            <div className="bg-[#fdfbf7] p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center group hover:border-green-300 transition-all">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 text-green-900 text-3xl transform group-hover:-rotate-6 transition-transform">
                <i className="fa-solid fa-cloud-arrow-down"></i>
              </div>
              <h3 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg mb-3">Exportar Backup</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-8 leading-relaxed">Gere um arquivo com todos os projetos, gastos e usuários para levar a outro computador.</p>
              <button 
                onClick={exportData}
                className="w-full py-4 bg-green-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg hover:bg-green-800 active:scale-95 transition-all"
              >
                Gerar Arquivo .JSON
              </button>
            </div>

            {/* IMPORT */}
            <div className="bg-[#fdfbf7] p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center group hover:border-blue-300 transition-all">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 text-blue-900 text-3xl transform group-hover:rotate-6 transition-transform">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h3 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg mb-3">Importar Dados</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-8 leading-relaxed">Carregue um arquivo de backup para restaurar as informações neste navegador atual.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-blue-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg hover:bg-blue-800 active:scale-95 transition-all"
              >
                Selecionar Arquivo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={importData} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>

          {statusMsg.text && (
            <div className={`mt-12 p-5 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest animate-in fade-in zoom-in duration-300 ${
              statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <i className={`fa-solid ${statusMsg.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'} mr-3`}></i>
              {statusMsg.text}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-4">Integridade do SGI</span>
           <div className="flex items-center gap-4">
              <h4 className="text-2xl font-black text-gray-900 italic">{data.projects?.length || 0}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Projetos Registrados</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-4">Acessos Cadastrados</span>
           <div className="flex items-center gap-4">
              <h4 className="text-2xl font-black text-gray-900 italic">{data.users?.length || 0}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Usuários no Banco</p>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-4">Data do Sistema</span>
           <div className="flex items-center gap-4">
              <h4 className="text-xl font-black text-gray-900 italic">{new Date().toLocaleDateString('pt-BR')}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Sessão Atual</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
