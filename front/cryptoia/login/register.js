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

  // Validación de contraseña
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(contrasena)) {
  showToast('La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo', 'error');
  return;
}


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

   showToast("Inicio de sesión exitoso ✔️", "success");

    window.location.href = "login.html";

  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
});

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + type;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// --- Modo oscuro ---
const toggle = document.getElementById("toggle-theme");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
