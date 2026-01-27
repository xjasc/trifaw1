
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 bg-emerald-950">
      {/* Background com Imagem Clara e Máscara Suave */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070" 
          className="w-full h-full object-cover opacity-50 grayscale-[10%]"
          alt="modern construction engineering"
        />
        {/* Gradiente sutil que não esconde a imagem */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/40 to-emerald-950/80"></div>
      </div>
      
      {/* Bloco de Marca Compacto e Unificado - NOVA LOGO */}
      <div className="z-10 mb-8 md:mb-10 text-center animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-b-4 border-green-800">
             {/* Logotipo T Quadrado */}
            <span className="text-emerald-950 font-saira text-6xl md:text-7xl font-black leading-none pt-2">T</span>
          </div>
          <div className="flex flex-col -space-y-2 mt-2">
            {/* Nome da empresa ampliado e quadrado */}
            <h1 className="text-4xl md:text-6xl font-saira font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-xl">
              TRIFAW
            </h1>
            <p className="text-green-400 font-saira text-xs md:text-sm font-bold tracking-[0.4em] uppercase pl-1 drop-shadow-md">
              ENGENHARIA
            </p>
          </div>
        </div>
      </div>
      
      {/* Bloco de Acesso */}
      <div className="w-full max-w-[380px] z-10 animate-in fade-in zoom-in duration-500 delay-150">
        <div className="bg-gray-100/95 backdrop-blur-sm rounded-[2rem] shadow-2xl px-8 py-12 md:px-10 md:py-14 border border-white/40">
          
          <div className="mb-8 text-center">
            <h2 className="text-lg md:text-xl font-saira font-black text-emerald-950 tracking-tight uppercase italic">Acesso Restrito</h2>
            <div className="h-1 w-10 bg-emerald-600 mx-auto mt-2 rounded-full"></div>
            <p className="text-[9px] text-stone-500 font-bold uppercase mt-2 tracking-widest bg-stone-200/50 py-1 rounded-md inline-block px-3 font-saira">Identifique-se</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-emerald-700 tracking-widest ml-1 font-saira">E-mail</label>
              <div className="relative">
                <i className="fa-solid fa-user-shield absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50"></i>
                <input 
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-bold text-emerald-950 text-sm placeholder:text-emerald-900/20 font-inter"
                  placeholder="Seu e-mail de acesso"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-emerald-700 tracking-widest ml-1 font-saira">Chave</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50"></i>
                <input 
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-bold text-emerald-950 text-sm placeholder:text-emerald-900/20 font-inter"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[9px] font-black uppercase flex items-center gap-3 animate-shake border border-red-100 font-saira">
                <i className="fa-solid fa-circle-exclamation text-base"></i>
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full py-4 bg-emerald-900 text-white font-black uppercase tracking-[0.15em] text-[11px] rounded-xl shadow-lg flex items-center justify-center gap-3 mt-4 hover:bg-emerald-800 transition-all active:scale-[0.98] font-saira"
            >
              Autenticar Usuário
              <i className="fa-solid fa-shield-halved"></i>
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-[8px] text-emerald-800/40 font-black uppercase tracking-[0.3em] font-saira">
              © TRIFAW ENGENHARIA • 2026
            </p>
          </div>
        </div>
      </div>
      
      {/* Rodapé Decorativo Minimalista */}
      <div className="mt-8 flex items-center gap-3 opacity-10 z-10">
        <div className="h-[1px] w-8 bg-white"></div>
        <i className="fa-solid fa-hard-hat text-white text-[12px]"></i>
        <div className="h-[1px] w-8 bg-white"></div>
      </div>
    </div>
  );
};

export default Login;
