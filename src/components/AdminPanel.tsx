import React, { useState } from 'react';
import { X, Lock, Save, Globe, Image, Building, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings, Repository } from '../context/SettingsContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [form, setForm] = useState(settings);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password for the demo
    if (password === 'alcaraz2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    onClose();
    // Reset auth for next time
    setIsAuthenticated(false);
    setPassword('');
  };

  const addRepository = () => {
    setForm({
      ...form,
      repos: [...form.repos, { label: '', url: '' }]
    });
  };

  const removeRepository = (index: number) => {
    setForm({
      ...form,
      repos: form.repos.filter((_, i) => i !== index)
    });
  };

  const updateRepository = (index: number, field: keyof Repository, value: string) => {
    const newRepos = [...form.repos];
    newRepos[index] = { ...newRepos[index], [field]: value };
    setForm({ ...form, repos: newRepos });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <h2 className="font-serif font-semibold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Panel de Administración
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {!isAuthenticated ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-sm text-stone-600 mb-4">
                  Ingrese la contraseña administrativa para realizar cambios.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-stone-200 outline-none transition-all"
                    placeholder="••••••••"
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white py-2 rounded-lg font-medium hover:bg-stone-800 transition-colors"
                >
                  Acceder
                </button>
              </form>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase mb-1">
                      <Building className="w-3 h-3" />
                      Nombre de la Institución
                    </label>
                    <input
                      type="text"
                      value={form.institutionName}
                      onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase">
                        <Globe className="w-3 h-3" />
                        Repositorios
                      </label>
                      <button 
                        type="button" 
                        onClick={addRepository}
                        className="text-[10px] bg-stone-100 px-2 py-1 rounded border border-stone-200 hover:bg-stone-200 flex items-center gap-1 font-semibold uppercase text-stone-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Añadir
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(form.repos || []).map((repo, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative group">
                          <button 
                            type="button"
                            onClick={() => removeRepository(idx)}
                            className="absolute top-2 right-2 p-1 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <input
                              type="text"
                              value={repo.label}
                              placeholder="Etiqueta (ej. PEI 2024)"
                              onChange={(e) => updateRepository(idx, 'label', e.target.value)}
                              className="w-full bg-transparent border-b border-stone-200 py-1 text-sm focus:border-stone-400 outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="url"
                              value={repo.url}
                              placeholder="URL del Drive o sitio web"
                              onChange={(e) => updateRepository(idx, 'url', e.target.value)}
                              className="w-full bg-transparent border-b border-stone-200 py-1 text-xs focus:border-stone-400 outline-none font-mono"
                            />
                          </div>
                        </div>
                      ))}
                      {form.repos.length === 0 && (
                        <p className="text-xs text-stone-400 italic text-center py-4">No hay repositorios configurados.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase mb-1">
                      <Image className="w-3 h-3" />
                      URL del Logo (Opcional)
                    </label>
                    <input
                      type="url"
                      value={form.logoUrl || ''}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value || null })}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 flex gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsAuthenticated(false)}
                    className="flex-1 px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
