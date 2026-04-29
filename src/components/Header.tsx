import React, { useState } from 'react';
import { School, Info, ExternalLink, Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { AdminPanel } from './AdminPanel';

export const Header: React.FC = () => {
  const { settings } = useSettings();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center min-w-[48px] min-h-[48px]">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <School className="w-8 h-8 text-stone-700" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-stone-900 leading-tight">
              {settings.institutionName}
            </h1>
            <p className="text-xs font-sans text-stone-500 uppercase tracking-widest font-medium whitespace-nowrap">
              Asistente Virtual para Docentes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {(settings.repos || []).map((repo, idx) => (
            <a 
              key={idx}
              href={repo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {repo.label || 'Repositorio'}
            </a>
          ))}
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="p-1.5 text-stone-300 hover:text-stone-600 transition-colors focus:outline-none"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </header>
  );
};
