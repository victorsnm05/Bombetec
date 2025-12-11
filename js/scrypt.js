// Preloader
window.addEventListener('load', function () {
    document.getElementById('preloader').style.display = 'none';
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Cierra el navbar si está expandido (en móviles)
        const navbarCollapse = document.querySelector('#navbarNav');
        if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
            const toggler = document.querySelector('.navbar-toggler');
            toggler.click();
        }
    });
});

// Inicializar EmailJS
(function () {
    emailjs.init("DUvtgFzlfjFo5eDFI");  // Tu USER_ID
})();

// Manejar envío del formulario
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    // Validación de email con regex mejorada
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        const errorModal = new bootstrap.Modal(document.getElementById('errorModalEmail'));
        errorModal.show();
        return;  // Detiene el envío
    }

    // Deshabilitar botón durante el envío
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Enviar con EmailJS
    emailjs.sendForm('service_5ox30sj', 'template_ue356kj', this)
        .then(function () {
            // Mostrar modal de éxito
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Limpiar formulario
            document.getElementById('contact-form').reset();

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, function (error) {
            // Mostrar modal de error
            const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
            errorModal.show();

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
});

// SCROLL PROGRESS BAR
window.addEventListener('scroll', () => {
    // Crear el elemento si no existe
    let scrollProgress = document.querySelector('.scroll-progress');
    if (!scrollProgress) {
        scrollProgress = document.createElement('div');
        scrollProgress.className = 'scroll-progress';
        document.body.appendChild(scrollProgress);
    }

    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// CONTADOR ANIMADO PARA ESTADÍSTICAS
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    const isPercentage = target === 100;

    const counter = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = isPercentage ? '100%' : target + '+';
            clearInterval(counter);
        } else {
            element.textContent = isPercentage
                ? Math.floor(start) + '%'
                : Math.floor(start) + '+';
        }
    }, 16);
}

// Observar cuando las estadísticas entran en vista
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumbers = entry.target.querySelectorAll('.stat-number');

            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('500')) {
                    animateCounter(stat, 500, 2000);
                } else if (!text.includes('100')) {
                    animateCounter(stat, 15, 1200);
                } else {
                    animateCounter(stat, 100, 1600);
                }
            });
        }
    });
}, { threshold: 0.5 });

// Observar la sección de estadísticas
const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ==========================================
// LÓGICA DEL CHATBOT CON GEMINI API
// ==========================================

// Configuración API Gemini
const apiKey = "AIzaSyDbbQbZ0Ro2kOA2Ma-t29vBVFnwZzMKTDk";

// Contexto para la IA: Le decimos quién es y qué sabe
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
6. No tienes por qué presentarte en cada una de las respuestas. Ya sabe quien eres. NO uses saludos largos ni despedidas tipo "Espero haberte ayudado". Ve directo a la respuesta.
7. Tono: Profesional pero directo.
8. NO des fechas de reserva, siempre para hacer una reserva, el usuario debe comunicarse por los medios con la empresa (llamada, whatsapp, mediante el formulario, etc.)
`;

const chatToggle = document.getElementById('chat-toggle-btn');
const chatClose = document.getElementById('chat-close-btn');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send-btn');
const chatMessages = document.getElementById('chat-messages');

// Abrir/Cerrar chat
chatToggle.addEventListener('click', () => {
    chatBox.classList.toggle('active');
    if(chatBox.classList.contains('active')) {
        setTimeout(() => chatInput.focus(), 300);
    }
});

chatClose.addEventListener('click', () => {
    chatBox.classList.remove('active');
});

// Función principal de envío
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Mostrar mensaje del usuario
    addMessage(text, 'user');
    chatInput.value = '';

    // 2. Mostrar indicador de "Escribiendo..."
    const loadingId = addLoadingMessage();

    try {
        // Construimos la URL dentro de la función para asegurar que usamos la apiKey correcta
        const currentKey = typeof apiKey !== 'undefined' ? apiKey : '';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${currentKey}`;

        // 3. Llamada a la API de Gemini
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: text }]
                }],
                systemInstruction: {
                    parts: [{ text: systemContext }]
                }
            })
        });

        const data = await response.json();

        // 4. Eliminar "Escribiendo..."
        removeMessage(loadingId);

        // 5. Procesar respuesta
        if (response.ok && data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            // Convertir markdown básico a HTML (negritas)
            const formattedText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            addMessage(formattedText, 'bot');
        } else {
            console.error('Error detallado de Gemini:', data); // Mira la consola con F12 para ver el error real

            let errorMsg = "Lo siento, tuve un pequeño problema de conexión. ";
            if (data.error && data.error.message) {
                // Mensaje técnico en consola, mensaje amable al usuario
                console.warn("Mensaje API:", data.error.message);
                if (data.error.code === 400) errorMsg += "(Error de configuración API)";
            }

            errorMsg += "Por favor llama al 607 342 012.";
            addMessage(errorMsg, 'bot');
        }

    } catch (error) {
        console.error('Error de Red/Sistema:', error);
        removeMessage(loadingId);
        addMessage("Error de conexión. Por favor verifica tu internet o inténtalo más tarde.", 'bot');
    }
}

// Listeners para enviar
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Helpers para la interfaz del chat
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    div.innerHTML = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.classList.add('message', 'bot-message');
    div.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Estilo para la animación de carga (inyectado dinámicamente)
const style = document.createElement('style');
style.innerHTML = `
.typing-dots span {
    animation: blink 1.4s infinite both;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
}
`;
document.head.appendChild(style);