
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

export const CATEGORY_OBJ = [
  { id: 'materials', label: 'Materiais', color: '#022c22', icon: 'fa-boxes-stacked' },
  { id: 'labor', label: 'Mão de Obra', color: '#0f766e', icon: 'fa-users-gear' },
  { id: 'equipment', label: 'Equipamentos', color: '#b45309', icon: 'fa-tractor' },
  { id: 'rentals', label: 'Locações', color: '#78350f', icon: 'fa-truck-ramp-box' },
  { id: 'services', label: 'Serviços', color: '#451a03', icon: 'fa-handshake' },
  { id: 'others', label: 'Outros', color: '#57534e', icon: 'fa-ellipsis' }
];

export const CATEGORIES = CATEGORY_OBJ; // Alias para compatibilidade futura se necessário
export const CATEGORY_COLORS: Record<string, string> = CATEGORY_OBJ.reduce((acc, c) => ({ ...acc, [c.id]: c.color }), {});
export const CATEGORY_ICONS: Record<string, string> = CATEGORY_OBJ.reduce((acc, c) => ({ ...acc, [c.id]: c.icon }), {});

// Helper legacy para manter compatibilidade onde usa string direta (se houver, mas vamos migrar)
export const CATEGORY_LABELS: Record<string, string> = CATEGORY_OBJ.reduce((acc, c) => ({ ...acc, [c.id]: c.label }), {});


export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img src="/logo.png" alt="TRIFAW Engenharia" className="h-12 w-auto object-contain" />
  </div>
);

export const PROJECT_STAGES_DEFAULT = [
  { name: 'PRELIMINARES', weight: 3.10 },
  { name: 'INFRAESTRUTURA', weight: 7.00 },
  { name: 'SUPRAESTRUTURA', weight: 12.50 },
  { name: 'PAREDES E PAINEIS', weight: 8.00 },
  { name: 'ESQUADRIAS', weight: 4.50 },
  { name: 'VIDROS E PLÁSTICOS', weight: 0.00 },
  { name: 'COBERTURAS', weight: 5.00 },
  { name: 'IMPERMEBAILIZAÇÕES', weight: 9.00 },
  { name: 'REVESTIMENTOS INTERNOS', weight: 6.90 },
  { name: 'FORROS', weight: 1.00 },
  { name: 'REVESTIMENTOS EXTERNOS', weight: 4.00 },
  { name: 'PINTURA', weight: 3.70 },
  { name: 'PISOS', weight: 8.50 },
  { name: 'ACABAMENTOS', weight: 1.11 },
  { name: 'INST. ELÉTRICAS', weight: 3.80 },
  { name: 'INST. HIDRÁULICAS', weight: 3.70 },
  { name: 'INST. ESGOTOS E PLUV.', weight: 3.70 },
  { name: 'LOUÇAS E METAIS', weight: 4.20 },
  { name: 'COMPLEMENTOS', weight: 0.30 },
  { name: 'OUTROS SERVIÇOS.', weight: 9.99 }
];
