document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chatWindow");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  // Cargar historial guardado
  const savedHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  savedHistory.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message " + (msg.role === "user" ? "user" : "bot");
    div.textContent = msg.content;
    chatWindow.appendChild(div);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;

  async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Mostrar mensaje del usuario
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    userDiv.textContent = userMessage;
    chatWindow.appendChild(userDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    chatInput.value = "";

    // Mensaje de "IA escribiendo..."
    const botDiv = document.createElement("div");
    botDiv.className = "message bot";
    botDiv.textContent = "Escribiendo...";
    chatWindow.appendChild(botDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          pregunta: userMessage
        })
      });

      const data = await res.json();
      const botMessage = data.respuesta || "Sin respuesta de la IA.";

      botDiv.textContent = botMessage;
      chatWindow.scrollTop = chatWindow.scrollHeight;

      // Guardar en historial
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      chatHistory.push({ role: "user", content: userMessage });
      chatHistory.push({ role: "bot", content: botMessage });
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    } catch (err) {
      botDiv.textContent = "Error al conectar con la IA.";
      console.error(err);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
});

// Cargar datos del usuario
const storedUser = localStorage.getItem("loggedUser");
const token = localStorage.getItem("token");

if (storedUser && token) {
  const session = JSON.parse(storedUser);
  session.token = token;

  document.getElementById("userDisplayName").textContent = session.nombre;
  document.getElementById("userBalance").textContent = `Saldo: $${Number(session.saldo).toLocaleString()}`;
  document.getElementById("userAvatar").textContent = session.nombre.charAt(0);
} else {
  // No hay sesión, redirigir al login
  window.location.href = "../login/login.html";
}

// Tema
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    themeToggle.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    localStorage.removeItem("chatHistory"); // Limpiar historial al cerrar sesión
    window.location.href = "/login/login.html";
  });
}
