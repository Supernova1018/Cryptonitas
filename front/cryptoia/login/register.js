const API_URL = "http://localhost:5000/api/auth/register";

// --- Enviar datos al backend ---
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo_electronico = document.getElementById("correo").value;
  const contrasena = document.getElementById("password").value;

  const data = {
    nombre,
    correo_electronico,
    contrasena,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.msg || "Error en el registro");
      return;
    }

    alert("Registro exitoso 🎉");
    window.location.href = "login.html";

  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
});

// --- Modo oscuro ---
const toggle = document.getElementById("toggle-theme");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
