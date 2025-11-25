document.addEventListener("DOMContentLoaded", () => {

  /**************************************
   * 🔐 Cargar sesión
   **************************************/
  const storedUser = localStorage.getItem("loggedUser");
  const token = localStorage.getItem("token");

  if (!storedUser || !token) {
    window.location.href = "../login/login.html";
    return;
  }

  const session = JSON.parse(storedUser);
  session.token = token;


  /**************************************
   * 🧩 Mostrar datos del usuario
   **************************************/
  document.getElementById("userDisplayName").textContent = session.nombre;
  document.getElementById("userBalance").textContent =
    `Saldo: $${Number(session.saldo).toLocaleString()}`;

  if (document.getElementById("userAvatar")) {
    document.getElementById("userAvatar").textContent = session.nombre.charAt(0);
  }


  /**************************************
   * 📡 Obtener precios reales
   **************************************/
  let globalPrices = {};

  async function loadPrices() {
    const res = await fetch("http://localhost:5000/api/crypto/prices", {
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    const data = await res.json();

    data.forEach(row => {
      globalPrices[row.simbolo] = row.precio_actual;
    });

    return globalPrices;
  }


  /**************************************
   * 🧩 Rellenar select criptos
   **************************************/
  function fillCryptoSelector(prices) {
    const selects = [
      document.getElementById("buyCoin"),
      document.getElementById("sellCoin")
    ];

    selects.forEach(sel => {
      sel.innerHTML = "";
      Object.keys(prices).forEach(sym => {
        sel.insertAdjacentHTML("beforeend",
          `<option value="${sym}">${sym}</option>`
        );
      });
    });
  }


  /**************************************
   * 🔄 Conversión USD → CRIPTO
   **************************************/
  function updateBuyConversion() {
    const usd = Number(document.getElementById("buyAmount").value);
    const simbolo = document.getElementById("buyCoin").value;

    if (!usd || usd <= 0) {
      document.getElementById("buyConversion").textContent = "";
      return;
    }

    const price = globalPrices[simbolo];
    const cripto = usd / price;

    document.getElementById("buyConversion").textContent =
      `${cripto.toFixed(8)} ${simbolo}`;
  }


  /**************************************
   * 🔄 Conversión CRIPTO → USD
   **************************************/
  function updateSellConversion() {
    const amount = Number(document.getElementById("sellAmount").value);
    const simbolo = document.getElementById("sellCoin").value;

    if (!amount || amount <= 0) {
      document.getElementById("sellConversion").textContent = "";
      return;
    }

    const price = globalPrices[simbolo];
    const usd = amount * price;

    document.getElementById("sellConversion").textContent =
      `$${usd.toLocaleString()}`;
  }


  // 💰 Comprar
async function buyCrypto() {
  const simbolo = document.getElementById("buyCoin").value;
  const usd = Number(document.getElementById("buyAmount").value);

  if (!usd || usd <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Monto inválido',
      text: 'Ingresa un monto válido para comprar.',
      confirmButtonColor: '#4CAF50'
    });
    return;
  }

  const res = await fetch("http://localhost:5000/api/trade/buy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ simbolo, cantidad_usd: usd })
  });

  const data = await res.json();

  if (!res.ok) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.msg || 'No se pudo realizar la compra',
      confirmButtonColor: '#4CAF50'
    });
    return;
  }

  session.saldo = Number(data.nuevo_saldo_usd);
  localStorage.setItem("loggedUser", JSON.stringify(session));
  document.getElementById("userBalance").textContent =
    `Saldo: $${session.saldo.toLocaleString()}`;

  Swal.fire({
    icon: 'success',
    title: 'Compra exitosa',
    html: `Has comprado <b>${data.cantidad_comprada} ${simbolo}</b>`,
    confirmButtonColor: '#4CAF50',
    timer: 3000
  });
}

// 💸 Vender
async function sellCrypto() {
  const simbolo = document.getElementById("sellCoin").value;
  const amount = Number(document.getElementById("sellAmount").value);

  if (!amount || amount <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Cantidad inválida',
      text: 'Ingresa una cantidad válida para vender.',
      confirmButtonColor: '#4CAF50'
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/trade/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify({ simbolo, cantidad_cripto: amount })
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.msg || 'No se pudo realizar la venta',
        confirmButtonColor: '#4CAF50'
      });
      return;
    }

    // Actualizar saldo del usuario
    session.saldo = Number(data.nuevo_saldo_usd);
    localStorage.setItem("loggedUser", JSON.stringify(session));
    document.getElementById("userBalance").textContent =
      `Saldo: $${session.saldo.toLocaleString()}`;

    // Mostrar mensaje bonito de venta
    const price = globalPrices[simbolo] || 0;
    const totalUSD = (amount * price).toFixed(2);

    Swal.fire({
      icon: 'success',
      title: '¡Venta realizada con éxito!',
      html: `
        Has vendido <b>${amount} ${simbolo}</b><br>
        Valor total: <b>$${Number(totalUSD).toLocaleString()}</b>
      `,
      confirmButtonColor: '#4CAF50',
      timer: 4000
    });

  } catch (err) {
    console.error("❌ Error al vender:", err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un problema al procesar la venta.',
      confirmButtonColor: '#4CAF50'
    });
  }



    // actualizar saldo en localStorage
    session.saldo = Number(data.nuevo_saldo_usd);
    localStorage.setItem("loggedUser", JSON.stringify(session));

    document.getElementById("userBalance").textContent =
      `Saldo: $${session.saldo.toLocaleString()}`;

    alert(`Venta exitosa de ${data.cantidad_vendida} ${simbolo}`);
  }


  /**************************************
   * 🖱 Eventos
   **************************************/
  document.getElementById("btnBuy").addEventListener("click", buyCrypto);
  document.getElementById("btnSell").addEventListener("click", sellCrypto);

  document.getElementById("buyAmount").addEventListener("input", updateBuyConversion);
  document.getElementById("buyCoin").addEventListener("change", updateBuyConversion);

  document.getElementById("sellAmount").addEventListener("input", updateSellConversion);
  document.getElementById("sellCoin").addEventListener("change", updateSellConversion);


  /**************************************
   * INIT
   **************************************/
  loadPrices().then(prices => {
    fillCryptoSelector(prices);
    updateBuyConversion();
    updateSellConversion();
  });

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

 //CERRAR SESIÓN

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    window.location.href = "/login/login.html";
  });
}

});
