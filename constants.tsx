
import React from 'react';

export const COLORS = {
  primary: '#022c22', // Deep Forest (Emerald 950)
  primaryDark: '#011c16', 
  primaryLight: '#065f46', // Emerald 800
  secondary: '#fafaf9', // Stone 50
  accent: '#b45309', // Copper (Amber 700)
  copperLight: '#fff7ed', // Orange 50
  danger: '#991b1b', // Red 800
  warning: '#d97706', // Amber 600
  info: '#1e3a8a', // Blue 900
  textMuted: '#57534e', // Stone 500
  textMain: '#1c1917', // Stone 900
  bgLight: '#e6e4e0', // Concrete Base
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Materiais': '#022c22',    // Deep Forest
  'Mão de Obra': '#0f766e',  // Teal Deep
  'Equipamentos': '#b45309', // Copper/Terra
  'Locações': '#78350f',     // Dark Earth
  'Serviços': '#451a03',     // Bronze Dark
  'Outros': '#57534e'        // Stone
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Materiais': 'fa-boxes-stacked',
  'Mão de Obra': 'fa-users-gear',
  'Equipamentos': 'fa-tractor',
  'Locações': 'fa-truck-ramp-box',
  'Serviços': 'fa-handshake',
  'Outros': 'fa-ellipsis'
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {/* Ícone T Quadrado */}
    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-xl border-b-4 border-emerald-800">
        <span className="font-['Saira'] font-black text-emerald-950 text-4xl leading-none pt-1">T</span>
    </div>
    {/* Texto */}
    <div className="flex flex-col -space-y-1">
      <h1 className="text-white font-['Saira'] font-black text-2xl tracking-tighter leading-none italic uppercase">
        TRIFAW
      </h1>
      <div className="mt-0">
        <span className="text-emerald-400 font-['Saira'] text-[10px] font-bold tracking-[0.2em] uppercase block leading-none pl-0.5">ENGENHARIA</span>
      </div>
    </div>
  </div>
);
