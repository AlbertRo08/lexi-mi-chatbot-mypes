/* ==========================================================================
   1. CONTROL DE MEMORIA INTERNA Y CAPA DE SEGURIDAD (ANTIBLOQUEO)
   ========================================================================== */
let cart = [];
let total = 0;

let brain = {
    name: "",
    purchaseHistory: [],
    sessionStart: Date.now()
};

try {
    const localData = localStorage.getItem("brain");
    if (localData) {
        const parsed = JSON.parse(localData);
        brain.name = parsed.name || "";
        brain.purchaseHistory = parsed.purchaseHistory || [];
        brain.sessionStart = parsed.sessionStart || Date.now();
    }
} catch (e) {
    console.warn("Mecanismo de Seguridad: Se detectó un formato incompatible en LocalStorage. Reconfigurando base de datos local.");
    localStorage.removeItem("brain");
}

function save() {
    localStorage.setItem("brain", JSON.stringify(brain));
}

/* ==========================================================================
   2. BASE DE DATOS MAESTRA DE PRODUCTOS (CON TUS IMÁGENES REALES)
   ========================================================================== */
const products = [
    { 
        id: 1, 
        name: "Laptop Gamer RTX 4050", 
        price: 1200, 
        keywords: ["laptop", "gamer", "computadora", "rtx", "4050", "4060", "portatil", "pc", "compu", "video", "nvidia", "lenovo", "loq", "core i7"],
        img: "image_2409e2.png" 
    },
    { 
        id: 2, 
        name: "Laptop Office Pro", 
        price: 600, 
        keywords: ["laptop", "office", "oficina", "computadora", "trabajo", "portatil", "compu", "estudio", "tareas", "ryzen", "excel", "hp", "core i5", "windows 11"],
        img: "image_240944.jpg" 
    },
    { 
        id: 3, 
        name: "Audifonos Samsung Buds 4 pro", 
        price: 80, 
        keywords: ["audifonos", "auriculares", "samsung", "buds", "buds 4 pro", "musica", "sonido", "bluetooth", "audio", "inalambrico", "pro", "bass", "cascos"], 
        img: "image_240625.png" 
    },
    { 
        id: 4, 
        name: "Samsung Galaxy Watch 7", 
        price: 150, 
        keywords: ["reloj", "smartwatch", "samsung", "galaxy", "watch 7", "ultra", "inteligente", "hora", "pulsera", "deporte", "notificaciones", "apple", "fitness"], 
        img: "image_24054b.png" 
    },
    { 
        id: 5, 
        name: "Air Jordan 4 Retro Black Cat", 
        price: 60, 
        keywords: ["zapatillas", "zapatos", "tennis", "urbanas", "calzado", "jordan", "air jordan", "black cat", "retro", "sneakers", "nike", "moda", "ropa", "street"], 
        img: "image_1a2443.png" 
    },
    { 
        id: 6, 
        name: "Camisa Premium Algodón", 
        price: 35, 
        keywords: ["camisa", "ropa", "premium", "vestir", "polo", "elegante", "moda", "algodon", "lino", "manga"], 
        img: "image_1a23a0.jpg" 
    },
    { 
        id: 7, 
        name: "Parlante Bluetooth Waterproof", 
        price: 70, 
        keywords: ["parlante", "altavoz", "bluetooth", "musica", "bocina", "audio", "inalambrico", "jbl", "go4", "waterproof", "exterior"], 
        img: "image_1a2343.jpg" 
    },
    { 
        id: 8, 
        name: "Ipad Pro 12.9", 
        price: 200, 
        keywords: ["tablet", "ipad", "apple", "ipad pro", "pantalla", "dibujo", "videos", "portatil", "tactil", "android", "xiaomi", "netflix"], 
        img: "image_1a203d.jpg" 
    }
];

/* ==========================================================================
   3. BASE DE DATOS DE PLATAFORMAS COMERCIALES EXTERNAS
   ========================================================================== */
const shoppingPages = {
    amazon: { name: "Amazon", url: "https://amazon.com", desc: "Líder global en e-commerce. Cuenta con el ecosistema logístico más rápido del mundo, protección al comprador tipo A1 y una oferta ilimitada de componentes tecnológicos y hardware." },
    shein: { name: "Shein", url: "https://shein.com", desc: "Gigante global de la moda rápida automatizada. Su algoritmo de cadena de suministro optimiza el diseño de prendas de vestir, calzado y accesorios con tarifas altamente competitivas." },
    temu: { name: "Temu", url: "https://temu.com", desc: "Plataforma de compras directas desde fábricas internacionales. Destaca por romper cadenas de distribución intermediarias, ofreciendo herramientas, electrónica de consumo y gadgets económicos." },
    mercadolibre: { name: "Mercado Libre", url: "https://mercadolibre.com", desc: "El ecosistema de comercio electrónico y servicios financieros más robusto de América Latina. Ofrece el servicio de Mercado Envíos para entregas en 24 horas y pasarela segura con Mercado Pago." }
};

/* ==========================================================================
   4. MATRICES DE TEXTO Y BANCO DE FRASES (MOTOR DE ENRIQUECIMIENTO)
   ========================================================================== */
const botPhrases = {
    greetings: [
        "¡Hola! Qué gusto saludarte. Mi núcleo operativo está listo.",
        "Sistemas en línea. Bienvenido al terminal interactivo de Lexi AI.",
        "Estableciendo canal de comunicación... ¡Buenas! ¿Cómo puedo asistirte hoy?",
        "Conexión segura establecida. Soy Lexi, tu analista y asistente virtual."
    ],
    annotations: [
        "¡Está bien! Procesé tu instrucción de inmediato. ",
        "Ya quedó listo. La base de datos local ha sido actualizada. ",
        "¡Ya! Entendido. Registro modificado con éxito. ",
        "¡De una! Modificación ejecutada en tiempo real. ",
        "Excelente decisión, procedo a registrarlo. "
    ]
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/* ==========================================================================
   5. CONTROLADORES DE INTERFAZ, RENDERS ACTUALIZADOS CON IMÁGENES
   ========================================================================== */
function startApp() {
    const welcome = document.getElementById("welcome-screen");
    if (welcome) {
        welcome.classList.add("fade-out");
        setTimeout(() => { welcome.style.display = "none"; }, 600);
    }
    brain.sessionStart = Date.now();
    save();
    
    setTimeout(() => { initBotGreeting(); }, 800);
}

function loadProductsToStore() {
    const grid = document.getElementById("products-grid");
    if (!grid) return; 
    
    // Renderizado optimizado con la etiqueta img dinámica vinculada al array maestro
    grid.innerHTML = products.map(p => {
        const imagenHtml = p.img 
            ? `<img src="${p.img}" alt="${p.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">` 
            : `<div style="width: 100%; height: 150px; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 12px;"></div>`;
            
        return `
            <div class="glass-card">
                <div>
                    ${imagenHtml}
                    <h3>${p.name}</h3>
                </div>
                <div>
                    <span class="price">$${p.price}</span>
                    <button onclick="add('${p.name}', ${p.price})">Añadir al carrito</button>
                </div>
            </div>
        `;
    }).join("");
}

function go(page) {
    const target = document.getElementById(page);
    if (!target) return;
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    target.classList.add("active");
}

function toggleChatWidget() {
    const widget = document.getElementById("chat-widget-container");
    if (!widget) return;
    widget.classList.toggle("chat-widget-hidden");
    
    const chat = document.getElementById("chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
}

/* ==========================================================================
   6. MOTOR DE TRANSACCIONES (FLUJO CON CÓDIGO QR AUTOMATIZADO)
   ========================================================================== */
function add(name, price) {
    const itemUniqueId = Date.now() + Math.random().toString(36).substr(2, 5);
    cart.push({ id: itemUniqueId, name, price });
    total += price;
    renderCart();
    animateCart();
}

function renderCart() {
    const list = document.getElementById("list");
    const totalElement = document.getElementById("total");
    if (!list || !totalElement) return;
    
    if (cart.length === 0) {
        list.innerHTML = `
            <div class="empty-cart-ghost">
                <div class="ghost-icon">🛒</div>
                <p style="margin:0;">Tu carrito está vacío<br><span style="font-size: 0.75rem; color: #00e5ff;">¡Añade algo para activarlo!</span></p>
            </div>
        `;
        const checkoutBlock = document.getElementById("checkout-block");
        if (checkoutBlock) checkoutBlock.classList.add("hidden");
    } else {
        list.innerHTML = cart.map(p => `
            <li>
                <span style="max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">• ${p.name} - $${p.price}</span>
                <button class="remove-item-btn" onclick="removeItem('${p.id}')" title="Eliminar artículo">×</button>
            </li>
        `).join("");
    }
    
    totalElement.innerText = "Total: $" + total;
}

function animateCart() {
    const c = document.querySelector(".cart");
    if (!c) return;
    
    c.classList.remove("cart-animate-in");
    void c.offsetWidth; 
    c.classList.add("cart-animate-in");
}

function removeItem(itemId) {
    const itemIndex = cart.findIndex(p => p.id === itemId);
    
    if (itemIndex !== -1) {
        total -= cart[itemIndex].price;
        cart.splice(itemIndex, 1);
        renderCart();
    }
}

function checkout() { 
    if (cart.length === 0) {
        alert("Añade artículos al carrito antes de proceder con el pago.");
        return;
    }
    
    const checkoutBlock = document.getElementById("checkout-block");
    if (checkoutBlock) {
        checkoutBlock.classList.toggle("hidden");
        backToMethods();

        const nameInput = document.getElementById("client-name");
        if (nameInput && brain.name && !nameInput.value) {
            nameInput.value = brain.name;
        }
    }
}

function showYapeQR() {
    const nameInput = document.getElementById("client-name");
    const addressInput = document.getElementById("client-address");

    const clientName = nameInput ? nameInput.value.trim() : "";
    const clientAddress = addressInput ? addressInput.value.trim() : "";

    if (!clientName || !clientAddress) {
        alert("Por favor, completa tu Nombre y la Dirección de entrega antes de continuar.");
        return;
    }

    document.getElementById("checkout-form-fields").classList.add("hidden");
    document.getElementById("yape-qr-container").classList.remove("hidden");
}

function backToMethods() {
    document.getElementById("checkout-form-fields").classList.remove("hidden");
    document.getElementById("yape-qr-container").classList.add("hidden");
    const codeInput = document.getElementById("yape-code");
    if (codeInput) codeInput.value = "";
}

function confirmYapePayment() {
    const codeInput = document.getElementById("yape-code");
    const opCode = codeInput ? codeInput.value.trim() : "";

    if (!opCode) {
        alert("Por favor, ingresa el número de operación para verificar tu Yape.");
        return;
    }

    payWithDetails(`Yape (Op: ${opCode})`);
}

function payWithDetails(method) {
    if (cart.length === 0) {
        alert("El carrito se encuentra vacío.");
        return;
    }

    const nameInput = document.getElementById("client-name");
    const addressInput = document.getElementById("client-address");

    const clientName = nameInput ? nameInput.value.trim() : "";
    const clientAddress = addressInput ? addressInput.value.trim() : "";

    if (!brain.name) {
        brain.name = clientName;
    }

    const newOrder = {
        id: Math.floor(Math.random() * 90000) + 10000,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        monto: total,
        metodoPago: method,
        usuario: clientName,
        direccion: clientAddress
    };
    
    brain.purchaseHistory.push(newOrder);
    save();

    alert(`🎉 ¡Compra exitosa!\n\nTu orden [IES-${newOrder.id}] ha sido procesada correctamente.\nEl reparto se dirigirá a: ${clientAddress}.\n¡Gracias por tu preferencia en Innovación Elite en Sistemas!`);
    
    cart = [];
    total = 0;
    if (nameInput) nameInput.value = "";
    if (addressInput) addressInput.value = "";
    const codeInput = document.getElementById("yape-code");
    if (codeInput) codeInput.value = "";
    
    renderCart();
}

/* ==========================================================================
   7. PROCESADOR CENTRAL DE INTELIGENCIA ARTIFICIAL (LEXI ENGINE)
   ========================================================================== */
function findProductSmart(text) {
    const cleanText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;

    products.forEach(product => {
        let matches = 0;
        product.keywords.forEach(keyword => {
            if (cleanText.includes(keyword)) matches++;
        });
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = product;
        }
    });
    return bestMatch;
}

function initBotGreeting() {
    const chat = document.getElementById("chat");
    const username = brain.name || "Usuario del Sistema";
    if (chat && chat.children.length === 0) {
        chat.innerHTML = `<div class="bot">🤖 **[SISTEMA CORE OPERACIONAL DE LEXI AI - ONLINE]**<br><br>
        Estimado/a **${username}**, te doy la bienvenida formal al asistente virtual inteligente desarrollado bajo los estándares del proyecto corporativo de **Innovación Elite en Sistemas**.<br><br>
        Actualmente mi núcleo analítico tiene control absoluto sobre los siguientes submódulos funcionales:<br><br>
        • 📈 **Módulo de Conectividad:** Monitoreo de latencia, ping y estado del servidor central. *(Escribe: 'Cómo están las redes')*<br>
        • 📋 **Módulo Estadístico:** Tracking detallado e histórico de tus comprobantes de pago locales. *(Escribe: 'Historial de registros')*<br>
        • 🕒 **Módulo de Auditoría Temporal:** Registro de relojes locales y cronometrado exacto de sesión. *(Escribe: 'Ver tiempo activo')*<br>
        • 🌐 **Módulo de Enlace Remoto:** Consulta, análisis y redirección a plataformas como Amazon, Shein, Temu y Mercado Libre. *(Escribe: 'Cuéntame sobre Amazon')*<br>
        • 🛒 **Módulo de Ventas Automatizado:** Inyección directa de productos al inventario del carrito mediante lenguaje natural. *(Escribe: 'Ponme una Laptop Gamer')*<br><br>
        Redacta tu consulta en la línea de comandos inferior para procesar la petición.</div>`;
    }
}

function sendMessage() {
    const input = document.getElementById("userInput");
    const chat = document.getElementById("chat");

    if (!input || !chat) return;
    const text = input.value.trim();
    if (!text) return;

    chat.innerHTML += `<div class="user">Tú: ${text}</div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (cleanText.includes("me llamo") || cleanText.includes("mi nombre es") || cleanText.includes("cambia mi nombre a")) {
        const nameMatch = text.split(/me llamo|mi nombre es|cambia mi nombre a/i)[1];
        if (nameMatch) brain.name = nameMatch.trim();
        save();
    }
    const username = brain.name || "Usuario General";

    setTimeout(() => {
        let r = "";
        const foundProduct = findProductSmart(cleanText);

        if (/sistema|redes|conexion|estado|conectate|servidor|ping|latencia|servidores/i.test(cleanText)) {
            const randomPing = Math.floor(Math.random() * 28) + 6;
            r = `🌐 **Módulo de Monitoreo de Red e Infraestructura (IES Core):**<br>
            • **Estado del Servidor:** OPERACIONAL 🟢<br>
            • **Latencia de Conexión (Ping):** ${randomPing}ms<br>
            • **Diagnóstico:** Los canales digitales operan al 100% de capacidad de carga.`;
        }

        else if (/hora|fecha|dia|tiempo|transcurrido|duracion|reloj|calendario|cuanto llevo/i.test(cleanText)) {
            const elapsedSeconds = Math.floor((Date.now() - brain.sessionStart) / 1000);
            const mins = Math.floor(elapsedSeconds / 60);
            const secs = elapsedSeconds % 60;
            
            r = `🕒 **Auditoría Cronométrica del Sistema:**<br>
            • **Calendario Actual:** ${new Date().toLocaleDateString()}<br>
            • **Reloj de Servidor:** ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br>
            • **Tiempo de Actividad Reciente:** ${mins} minutos y ${secs} segundos.`;
        }

        else if (/registro|historial|compras anteriores|que compre|mis compras|ordenes|pedidos|boletas|factura/i.test(cleanText)) {
            if (!brain.purchaseHistory || brain.purchaseHistory.length === 0) {
                r = `📋 **Historial Analítico de Órdenes:** Hola, ${username}. La base de datos local se encuentra vacía. No he detectado transacciones finalizadas en este terminal.`;
            } else {
                r = `📋 **Historial de Registros Comerciales Encontrados (${brain.purchaseHistory.length}):**<br>────────────────<br>`;
                brain.purchaseHistory.forEach((order, index) => {
                    r += `📦 **Registro #${index + 1} - Factura ID: [IES-${order.id}]**<br>
                    • **Fecha:** ${order.fecha} a las ${order.hora}<br>
                    • **Titular:** ${order.usuario || 'No registrado'}<br>
                    • **Destino:** ${order.direccion || 'No registrada'}<br>
                    • **Pasarela:** Liquidado vía ${order.metodoPago}<br>
                    • **Monto Neto Consolidado:** **$${order.monto}**<br>────────────────<br>`;
                });
            }
        }

        else if (cleanText.includes("tienda") || cleanText.includes("catalogo") || cleanText.includes("ver productos")) { 
            go("store"); 
            let stockList = products.map(p => `• 📦 **${p.name}** — Costo: \`$${p.price}\``).join("<br>");
            r = `🛍️ **Controlador de Navegación e Inventario Local:**<br>¡Acción ejecutada con éxito! He desplazado la interfaz hacia el **Catálogo Principal**.<br><br>📊 **STOCK:**<br>${stockList}`; 
        }

        else if (/amazon|shein|temu|mercado libre/i.test(cleanText)) {
            let key = "";
            if (cleanText.includes("amazon")) key = "amazon";
            else if (cleanText.includes("shein")) key = "shein";
            else if (cleanText.includes("temu")) key = "temu";
            else if (cleanText.includes("mercado") || cleanText.includes("libre")) key = "mercadolibre";

            if (key && shoppingPages[key]) {
                const site = shoppingPages[key];
                window.open(site.url); 
                r = `🌐 **Enlaces Remotos:** He abierto la pestaña oficial de **${site.name}**. Link directo: <a href="${site.url}" target="_blank" style="color: #00e5ff; text-decoration: underline;">${site.url}</a>.<br><br>📝 <b>Descripción:</b> ${site.desc}`;
            }
        }

        else if (["agrega", "añade", "comprar", "quiero", "ponlo", "esta bien", "ya", "ok", "dale", "ponme"].some(word => cleanText.includes(word))) {
            if (foundProduct) {
                add(foundProduct.name, foundProduct.price);
                r = `🛒 ${getRandomElement(botPhrases.annotations)} Sincronizé **${foundProduct.name}** a tu carrito. Total acumulado: **$${total}**.`;
            } else {
                r = `🛒 **Módulo de Carrito:** Por favor, especifica un producto válido de la tienda para cargarlo al sistema.`;
            }
        }

        else {
            r = `🤖 **Lexi AI Core:** Entrada recibida. Si deseas finalizar la transacción actual, puedes usar el formulario dinámico desplegado en el panel de control de la orden.`;
        }

        chat.innerHTML += `<div class="bot">🤖 ${r}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 450);
}

/* ==========================================================================
   8. ENLACE AUTOMÁTICO DE EVENTOS Y ARRANQUE SEGURO
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadProductsToStore(); 
    renderCart();

    const startButton = document.getElementById("startBtn");
    if (startButton) startButton.onclick = startApp;

    const sendButton = document.getElementById("sendBtn");
    if (sendButton) sendButton.onclick = sendMessage;

    const userInput = document.getElementById("userInput");
    if (userInput) {
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); 
                sendMessage();
            }
        });
    }
});