const API_URL = "http://localhost:5000/api/auth/login";

// === LOGIN ===
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo_electronico = document.getElementById("user").value.trim();
  const contrasena = document.getElementById("password").value.trim();

  if (!correo_electronico || !contrasena) {
    showToast("⚠️ Por favor complete todos los campos");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo_electronico,
        contrasena,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.msg || "❌ Credenciales incorrectas");
      return;
    }

    // === DECODIFICAR TOKEN PARA OBTENER ROL ===
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    const rolUsuario = payload.user.rol;

    // === GUARDAR TOKEN ===
    localStorage.setItem("token", data.token);

    // === GUARDAR USUARIO COMPLETO DESDE BACKEND ===
    localStorage.setItem("loggedUser", JSON.stringify(data.usuario));

    showToast("Inicio de sesión exitoso ✔️", "success");


    setTimeout(() => {
      if (rolUsuario === "admin") {
        window.location.href = "../admin/admin.html";
      } else {
        window.location.href = "../index.html";
      }
    }, 1000);

  } catch (error) {
    console.error("Error:", error);
    showToast("❌ Error al conectar con el servidor");
  }
});

// === TOAST ===
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// === MODO OSCURO ===
const toggleTheme = document.getElementById("toggle-theme");
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const icon = toggleTheme.querySelector("i");

  if (document.body.classList.contains("dark-mode")) {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
});
