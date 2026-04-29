import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message } from '../types';
import { chatWithGemini } from '../lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual oficial de la Escuela Secundaria N1 "Tratado de Alcaraz". Estoy aquí para ayudarte con consultas pedagógicas y administrativas basándome en nuestra normativa institucional. ¿En qué puedo asistirte hoy?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = [
    "¿Cuáles son las pautas de evaluación del CGE?",
    "¿Dónde encuentro el cronograma de exámenes?",
    "Normativa sobre licencias docentes",
    "Requisitos para el registro de asistencia"
  ];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (text === input) setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(messages.concat(userMessage).map(m => ({
        role: m.role,
        content: m.content
      })));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'No pude procesar tu solicitud.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "";
      const isMissingKey = errorMsg.includes("API Key");
      const isQuotaExceeded = errorMsg.includes("429") || errorMsg.includes("quota");
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isMissingKey 
          ? '⚠️ **Error de Configuración:** La API Key no está configurada correctamente. Asegúrate de configurar `VITE_GEMINI_API_KEY` en tu hosting.'
          : isQuotaExceeded
          ? '⚠️ **Límite Excedido:** Se ha alcanzado el límite de consultas gratuitas para este modelo. Por favor, intenta de nuevo en unos minutos.'
          : 'Hubo un error al conectar con el asistente. Por favor, intenta de nuevo más tarde.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#FDFCFB]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-6 space-y-8 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-10">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  "flex flex-col gap-2 group",
                  message.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "flex items-center gap-2 mb-1",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border",
                    message.role === 'user' 
                      ? "bg-stone-900 border-stone-800" 
                      : "bg-white border-stone-200"
                  )}>
                    {message.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-stone-600" />
                    )}
                  </div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-stone-400">
                    {message.role === 'user' ? 'Tú' : 'Asistente Institucional'}
                  </span>
                </div>
                
                <div className={cn(
                  "max-w-[90%] md:max-w-[80%] px-5 py-4 rounded-2xl shadow-sm transition-all duration-300",
                  message.role === 'user' 
                    ? "bg-white text-stone-900 rounded-tr-none border border-stone-200 group-hover:border-stone-300 group-hover:shadow-md" 
                    : "bg-stone-50/50 text-stone-900 rounded-tl-none border border-stone-200/60 backdrop-blur-sm group-hover:bg-white group-hover:border-stone-300 group-hover:shadow-md"
                )}>
                  <div className="prose prose-stone prose-sm max-w-none markdown-body leading-relaxed">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div className={cn(
                    "text-[9px] mt-3 font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 1 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-12"
            >
              <div className="md:col-span-2 text-center mb-2">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-[0.2em]">Consultas Sugeridas</p>
              </div>
              {presets.map((preset, idx) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="text-left p-5 bg-white border border-stone-100 rounded-2xl text-sm text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:shadow-md transition-all group flex justify-between items-center"
                >
                  <span className="group-hover:text-stone-900">{preset}</span>
                  <div className="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Send className="w-3 h-3 text-stone-400" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start gap-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-stone-100 border border-stone-200">
                  <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                </div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-stone-400">
                  Pensando...
                </span>
              </div>
              <div className="bg-stone-50/50 border border-stone-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-4">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="w-1.5 h-1.5 bg-stone-300 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-stone-300 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-stone-300 rounded-full"
                  />
                </div>
                <span className="text-xs text-stone-400 font-medium italic">Consultando normativa vigente...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta aquí..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-6 pr-24 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:bg-white transition-all text-sm placeholder:text-stone-400"
            />
            <div className="absolute right-3 flex items-center gap-1">
              <button 
                className="p-2 text-stone-300 hover:text-stone-500 transition-colors"
                title="Adjuntar documento"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all flex items-center justify-center",
                  input.trim() && !isLoading
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-200 scale-100 hover:scale-105 active:scale-95"
                    : "bg-stone-100 text-stone-300 cursor-not-allowed"
                )}
              >
                <Send className={cn("w-5 h-5", input.trim() && !isLoading && "fill-current")} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-stone-400 mt-4 max-w-lg mx-auto leading-relaxed tracking-wide">
            Este recurso utiliza IA para asistir la gestión docente. 
            Contraste siempre con las <span className="text-stone-600 font-medium italic">Resoluciones oficiales del CGE</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
