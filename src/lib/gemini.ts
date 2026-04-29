import { GoogleGenAI } from "@google/genai";

// Función para obtener la API Key con mayor compatibilidad
const getApiKey = () => {
  // En Vite, las variables VITE_ se acceden así
  const viteKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (viteKey && viteKey !== 'YOUR_API_KEY_HERE') return viteKey;
  
  // Fallback para procesos (como en AI Studio)
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  return '';
};

const apiKey = getApiKey();
const genAI = new GoogleGenAI({ apiKey });

// Instrucción de sistema para el asistente
const SYSTEM_INSTRUCTION = `
Eres el asistente virtual oficial de la Escuela Secundaria N1 "Tratado de Alcaraz" (Alcaraz, Entre Ríos, Argentina).
Tu misión es asistir a los docentes en tareas pedagógicas, administrativas y normativas.

INFORMACIÓN DEL CONTEXTO:
- Institución: Escuela Secundaria N1 "Tratado de Alcaraz".
- Dependencia: Consejo General de Educación (CGE) de Entre Ríos.

REGLAS DE ORO:
1. Siempre cita el número de Resolución (ej. Res. 1582/11 CGE).
2. Si no encuentras la información, sé honesto y sugiere consultar con secretaría.
3. Estilo: Profesional, empático y respetuoso.

IDENTIDAD: Recurso Digital de Apoyo para la Gestión Docente.
`;

export async function chatWithGemini(messages: { role: 'user' | 'assistant', content: string }[]) {
  if (!apiKey) {
    throw new Error("API Key de Gemini no configurada. Configure VITE_GEMINI_API_KEY en su hosting.");
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
