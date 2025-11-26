document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("loggedUser");
  const token = localStorage.getItem("token");

  if (!storedUser || !token) {
    window.location.href = "../login/login.html";
    return;
  }

  const session = JSON.parse(storedUser);
  session.token = token;

  document.getElementById("userDisplayName").textContent = session.nombre;
  document.getElementById("userAvatar").textContent = session.nombre.charAt(0);

  const usersTable = document.getElementById("usersTable").querySelector("tbody");

  // cache local de usuarios (evita pedir /:id que puede no existir)
  let usersCache = [];

  //  Cargar usuarios
  async function loadUsers() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${session.token}` }
      });

      // si el servidor respondió HTML (por ejemplo index.html) -> fallar limpio
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Respuesta inesperada al cargar usuarios:", res.status, text);
        throw new Error("Respuesta inesperada del servidor al cargar usuarios");
      }

      const users = await res.json();

      usersCache = users; // guardamos en cache
      renderUsers(users);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
    }
  }

  function renderUsers(users) {
    usersTable.innerHTML = "";
    users.forEach(u => {
      usersTable.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${u.id}</td>
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td>${u.rol}</td>
          <td>$${Number(u.saldo_virtual).toLocaleString()}</td>
          <td>
            <button class="btn-edit" data-id="${u.id}">✏️</button>
            <button class="btn-delete" data-id="${u.id}">🗑️</button>
          </td>
        </tr>
      `);
    });

    // (re)asignar eventos
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => editUser(btn.dataset.id));
    });
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => deleteUser(btn.dataset.id));
    });
  }

  //  Crear usuario
  document.getElementById("btnAddUser").addEventListener("click", async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Usuario',
      showCloseButton: true,
      html:
        '<input id="swalNombre" class="swal2-input" placeholder="Nombre">' +
        '<input id="swalCorreo" class="swal2-input" placeholder="Correo">' +
        '<input id="swalContrasena" type="password" class="swal2-input" placeholder="Contraseña">' +
        '<select id="swalRol" class="pretty"><option value="usuario">Usuario</option><option value="admin">Admin</option></select>' +
        '<input id="swalSaldo" type="number" class="swal2-input" placeholder="Saldo">',
      focusConfirm: false,
        didOpen: () => {
    // Forzar clase y estilos si por alguna razón no se aplicaron
    const sel = Swal.getPopup().querySelector('#swalRol');
    if (sel) {
      sel.classList.add('pretty-select');
      // ejemplo de estilo inline por si el CSS falla
      sel.style.padding = sel.style.padding || '10px 12px';
      sel.style.borderRadius = sel.style.borderRadius || '8px';
    }
  },
      preConfirm: () => {
        return {
          nombre: document.getElementById('swalNombre').value,
          correo: document.getElementById('swalCorreo').value,
          contrasena: document.getElementById('swalContrasena').value,
          rol: document.getElementById('swalRol').value,
          saldo: Number(document.getElementById('swalSaldo').value)
        }
      }
    });

    if (!formValues) return;

    if (!formValues) return;

// === VALIDACIÓN DE CONTRASEÑA ===
const password = formValues.contrasena;
if (password.length < 6) {
  Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
  return;
}
if (!/[A-Z]/.test(password)) {
  Swal.fire('Error', 'La contraseña debe contener al menos una letra mayúscula', 'error');
  return;
}
if (!/[0-9]/.test(password)) {
  Swal.fire('Error', 'La contraseña debe contener al menos un número', 'error');
  return;
}


    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(formValues)
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text || 'Error al crear usuario');
      }

      const data = await res.json();
      Swal.fire('✅ Usuario creado', `ID: ${data.id}`, 'success');
      await loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo crear el usuario', 'error');
    }
  });

  // Editar usuario (usa cache para evitar GET /:id inexistente)
  async function editUser(id) {
    // buscar en cache primero
    const user = usersCache.find(u => String(u.id) === String(id));

    if (!user) {
      // fallback: intentar obtener desde servidor (si existe la ruta)
      try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) {
          const txt = await res.text();
          console.error("Respuesta inesperada al pedir user por id:", res.status, txt);
          throw new Error("No se pudo obtener usuario");
        }
        const u = await res.json();
        usersCache.push(u);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo obtener los datos del usuario', 'error');
        return;
      }
    }

    // re-obtener (seguro)
    const u = usersCache.find(x => String(x.id) === String(id));
    if (!u) {
      Swal.fire('Error', 'Usuario no encontrado', 'error');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
       showCloseButton: true,
      html:
        `<input id="swalNombre" class="swal2-input" placeholder="Nombre" value="${escapeHtml(u.nombre)}">` +
        `<input id="swalCorreo" class="swal2-input" placeholder="Correo" value="${escapeHtml(u.correo)}">` +
        `<select id="swalRol" class="pretty-select">
           <option value="usuario" ${u.rol==='usuario'?'selected':''}>Usuario</option>
           <option value="admin" ${u.rol==='admin'?'selected':''}>Admin</option>
         </select>` +
        `<input id="swalSaldo" type="number" class="swal2-input" placeholder="Saldo" value="${Number(u.saldo_virtual)}">`,
      focusConfirm: false,
  didOpen: () => {
    const sel = Swal.getPopup().querySelector('#swalRol');
    if (sel) {
      sel.classList.add('pretty-select');
    }
  },
      preConfirm: () => {
        return {
          nombre: document.getElementById('swalNombre').value,
          correo: document.getElementById('swalCorreo').value,
          rol: document.getElementById('swalRol').value,
          // backend espera "saldo"
          saldo: Number(document.getElementById('swalSaldo').value)
        }
      }
    });

    if (!formValues) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify(formValues)
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok || !ct.includes("application/json")) {
        const txt = await res.text();
        console.error("Error al actualizar usuario:", res.status, txt);
        throw new Error(txt || 'Error al actualizar usuario');
      }

      const data = await res.json();
      Swal.fire('✅ Usuario actualizado', '', 'success');

      // actualizar cache y re-render
      await loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
    }
  }

  // Eliminar usuario
  async function deleteUser(id) {
    const confirm = await Swal.fire({
      title: 'Eliminar usuario?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` }
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok || (ct && ct.includes("text/html"))) {
        const txt = await res.text();
        throw new Error(txt || 'Error al eliminar');
      }

      // si todo OK:
      Swal.fire('✅ Usuario eliminado', '', 'success');
      await loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
    }
  }

  // Cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    window.location.href = "../login/login.html";
  });

  loadUsers();

  // === MODO OSCURO ===
  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    // Cargar preferencia guardada
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️"; // icono para volver a claro
    }

    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark-mode");

      // Cambiar el icono
      themeToggle.textContent = isDark ? "🌙" : "☀️";

      // Guardar preferencia
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  // SIDEBAR admin link visibility (mantener)
  const logged = localStorage.getItem("loggedUser");
  if (!logged) {
    window.location.href = "../login/login.html";
  }
  const user = JSON.parse(logged);
  const adminLink = document.getElementById("adminLink");
  if (adminLink) {
    if (user.rol === "admin") {
      adminLink.style.display = "block";
    } else {
      adminLink.style.display = "none";
    }
  }

  // utility: escapar HTML simple para evitar injection en inputs
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

});
