// api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Recuperamos la clave de las variables de entorno de Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuración del contexto (Lo he movido aquí para limpiar tu frontend)
const systemContext = `
Eres el asistente virtual experto de Bombetec, una empresa líder en bombeos de hormigón con sede en Toledo, España.
Tu tono es profesional, cercano y eficiente. Usas emojis ocasionalmente (🏗️, 🚛, ✅) pero sin excederte.

INFORMACIÓN CLAVE DE LA EMPRESA:
- Ubicación: Toledo y alrededores.
- Servicios: Bombeo de hormigón, pavimentación industrial, cimentaciones, losas, y trabajos en zonas de difícil acceso (calles estrechas, cascos antiguos) y gran altura.
- Flota: Camiones bomba modernos de última generación y equipos para accesos difíciles.
- Contacto: Teléfono 607 342 012, email bombetec@hotmail.com.
- Horario: Lunes a Jueves de 9:00 a 18:00 y Viernes de 9:00 a 13:00.

REGLAS DE RESPUESTA:
1. Si preguntan PRECIOS: Di amablemente que dependen del volumen (m³) y la ubicación exacta. Anímales a llamar al teléfono o usar el formulario de contacto para un presupuesto personalizado. NO inventes precios.
2. Si preguntan ZONAS: Confirma que trabajas en la provincia de Toledo y alrededores. Si preguntan por una zona muy lejana (ej. Barcelona, León, Sevilla), di que nuestra base está en Toledo y operamos principalmente en la zona centro.
3. Si preguntan si eres un robot: Di que eres el asistente IA de Bombetec.
4. Responde siempre en Español.
5. Sé muy conciso. No escribas parrafadas enormes. LONGITUD MÁXIMA: 2 o 3 frases cortas. (Máx 40 palabras).
6. No tienes por qué presentarte en cada una de las respuestas.
7. NO des fechas de reserva, remite al teléfono/contacto.
`;

export default async function handler(req, res) {
    // Configuración CORS (Importante para que tu web pueda hablar con este archivo)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 1. Verificamos la clave
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Falta la API Key en Vercel");
        }

        // 2. Inicializamos Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        // 3. USAMOS EL MODELO ESTÁNDAR QUE NO FALLA
        // Si flash te da problemas, usa "gemini-pro" temporalmente para probar
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025",
            systemInstruction: systemContext
        });

        // 4. Generamos respuesta
        const { message } = req.body;
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("ERROR SERVIDOR:", error);
        // Devolvemos el error exacto para que lo veas en la consola del navegador
        res.status(500).json({ error: error.message || "Error desconocido" });
    }
}