/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Chat } from './components/Chat';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <div className="min-h-screen flex flex-col font-sans bg-stone-50">
        <Header />
        <main className="flex-1">
          <Chat />
        </main>
        <footer className="bg-white border-t border-stone-200 py-4 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-[10px] text-stone-400 font-sans uppercase tracking-widest">
              © {new Date().getFullYear()} Escuela Secundaria N1 "Tratado de Alcaraz"
            </p>
            <p className="text-[10px] text-stone-500 font-medium">
              Desarrollado por <span className="text-stone-900">Juan Noguera</span>
            </p>
          </div>
        </footer>
      </div>
    </SettingsProvider>
  );
}

