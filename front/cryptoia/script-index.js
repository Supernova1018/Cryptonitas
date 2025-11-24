document.addEventListener("DOMContentLoaded", () => {

  /**************************************
   * 🔐 Cargar sesión
   **************************************/
  function loadSession() {
    const storedUser = localStorage.getItem("loggedUser");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      window.location.href = "login/login.html";
      return null;
    }

    const s = JSON.parse(storedUser);
    s.token = token;
    return s;
  }

  const session = loadSession();
  if (!session) return;



  /**************************************
   * 🧩 Mostrar datos del usuario (si existen)
   **************************************/
  const elName = document.getElementById("userDisplayName");
  const elAvatar = document.getElementById("userAvatar");
  const elBalance = document.getElementById("userBalance");

  if (elName) elName.textContent = session.nombre;
  if (elAvatar) elAvatar.textContent = session.nombre.charAt(0);
  if (elBalance)
    elBalance.textContent = `Saldo: $${Number(session.saldo).toLocaleString()}`;



  /**************************************
   * 📡 Obtener precios reales
   **************************************/
  async function loadPrices() {
    const res = await fetch("http://localhost:5000/api/crypto/prices", {
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    const data = await res.json();

    const map = {};
    data.forEach(row => map[row.simbolo] = row.precio_actual);

    return map;
  }



  /**************************************
   * 🧭 NAV — Solo si es index.html
   **************************************/
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");

    // Si el enlace apunta a otra página real, permitir navegación real
    if (href && href.endsWith(".html")) return;

    // Caso contrario, vista interna del dashboard (SPA)
    link.addEventListener("click", e => {
      e.preventDefault();

      const target = link.getAttribute("data-view");

      document.querySelectorAll(".nav-link").forEach(n => n.classList.remove("active"));
      link.classList.add("active");

      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById(target)?.classList.add("active");
    });
  });




 /**************************************
 * 📊 PORTAFOLIO REAL DESDE BACKEND
 **************************************/
const portfolioHoldings = document.getElementById("portfolioHoldings");
const portfolioValueEl = document.getElementById("portfolioValue");
const portfolioBalanceEl = document.getElementById("portfolioBalance"); // ← NUEVO
const holdingsList = document.getElementById("holdingsList");

async function loadRealPortafolio() {
  try {
    const res = await fetch("http://localhost:5000/api/portafolio", {
      headers: { "Authorization": `Bearer ${session.token}` }
    });

    const text = await res.text();
    if (text.startsWith("<")) {
      console.error("❌ ERROR: backend devolvió HTML, no JSON");
      return;
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      console.error("❌ Error portafolio:", data);
      return;
    }

    renderRealPortfolio(data);
    renderHoldings(data); // ← TENENCIAS ACTUALES RESTAURADAS

  } catch (err) {
    console.error("❌ Error al obtener portafolio:", err);
  }
}

function renderRealPortfolio(data) {
  const {
    saldo_virtual_usd,
    criptomonedas,
    valor_total_portafolio
  } = data;

  // Opción C → mostrar saldo real + valor portafolio
  if (portfolioBalanceEl)
    portfolioBalanceEl.textContent = `$${Number(session.saldo).toLocaleString()}`;

  if (portfolioValueEl)
    portfolioValueEl.textContent = `$${Number(valor_total_portafolio).toLocaleString()}`;

  // Lista de criptomonedas del portafolio
  if (!portfolioHoldings) return;

  portfolioHoldings.innerHTML = "";

  if (!criptomonedas || criptomonedas.length === 0) {
    portfolioHoldings.innerHTML = `<p>No tienes criptomonedas en tu portafolio.</p>`;
    return;
  }

  criptomonedas.forEach(c => {
    portfolioHoldings.insertAdjacentHTML("beforeend", `
      <div class="portfolio-item">
        <div class="portfolio-left">
          <div class="portfolio-logo">${c.crypto}</div>
          <div class="portfolio-meta">
            <div class="name">${c.crypto}</div>
            <div class="amount">Cantidad: ${Number(c.tenencia_total).toFixed(8)}</div>
          </div>
        </div>

        <div class="portfolio-right">
          <div class="portfolio-value">
            $${Number(c.valor_actual).toLocaleString()}
          </div>
          <div class="price-small">
            Precio prom: $${Number(c.precio_promedio).toLocaleString()}
          </div>
        </div>
      </div>
    `);
  });
}

/**************************************
 * 📌 TENENCIAS ACTUALES — (RESTORED)
 **************************************/
function renderHoldings(data) {
  const { criptomonedas } = data;

  if (!holdingsList) return;
  holdingsList.innerHTML = "";

  if (!criptomonedas || criptomonedas.length === 0) {
    holdingsList.innerHTML = `<p>No tienes tenencias aún.</p>`;
    return;
  }

  criptomonedas.forEach(c => {
    holdingsList.insertAdjacentHTML("beforeend", `
      <div class="hold-card">
        <div class="hold-left">
          <div class="hold-icon">${c.crypto}</div>
          <div class="hold-meta">
            <div>${c.crypto}</div>
            <div class="small">Cantidad: ${Number(c.tenencia_total).toFixed(8)}</div>
          </div>
        </div>

        <div class="hold-right">
          <div class="price">$${Number(c.valor_actual).toLocaleString()}</div>
        </div>
      </div>
    `);
  });
}




  /**************************************
   * 🧩 SELECTS DE TRADE — Solo si existen
   **************************************/
  const buyCoinSel = document.getElementById("buyCoin");
  const sellCoinSel = document.getElementById("sellCoin");

  function fillCryptoSelector(prices) {
    if (!buyCoinSel && !sellCoinSel) return;

    const selects = [buyCoinSel, sellCoinSel].filter(Boolean);

    selects.forEach(sel => {
      sel.innerHTML = "";
      Object.keys(prices).forEach(sym => {
        sel.insertAdjacentHTML("beforeend", `<option value="${sym}">${sym}</option>`);
      });
    });
  }



  /**************************************
   * 💰 Comprar
   **************************************/
  async function buyCrypto() {
    const simbolo = buyCoinSel.value;
    const usd = Number(document.getElementById("buyAmount").value);

    if (!usd || usd <= 0) return alert("Monto inválido");

    const res = await fetch("http://localhost:5000/api/trade/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify({ simbolo, cantidad_usd: usd })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.msg);

    session.saldo = Number(data.nuevo_saldo_usd);
    localStorage.setItem("loggedUser", JSON.stringify(session));

    if (elBalance)
      elBalance.textContent = `Saldo: $${session.saldo.toLocaleString()}`;

    alert(`Compra exitosa de ${data.cantidad_comprada} ${simbolo}`);
  }



  /**************************************
   * 💸 Vender
   **************************************/
  async function sellCrypto() {
    const simbolo = sellCoinSel.value;
    const amount = Number(document.getElementById("sellAmount").value);

    if (!amount || amount <= 0) return alert("Cantidad inválida");

    const res = await fetch("http://localhost:5000/api/trade/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.token}`
      },
      body: JSON.stringify({ simbolo, cantidad_cripto: amount })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.msg);

    session.saldo = Number(data.nuevo_saldo_usd);
    localStorage.setItem("loggedUser", JSON.stringify(session));

    if (elBalance)
      elBalance.textContent = `Saldo: $${session.saldo.toLocaleString()}`;

    alert(`Venta exitosa de ${data.cantidad_vendida} ${simbolo}`);
  }



  /**************************************
   * 🔘 Eventos de trade — Si existen los botones
   **************************************/
  const btnBuy = document.getElementById("btnBuy");
  const btnSell = document.getElementById("btnSell");

  if (btnBuy) btnBuy.addEventListener("click", buyCrypto);
  if (btnSell) btnSell.addEventListener("click", sellCrypto);



  /**************************************
   * 🚀 INIT
   **************************************/
  async function init() {
    const prices = await loadPrices();

    fillCryptoSelector(prices);
    loadRealPortafolio(); // ← YA CORREGIDO
  }

  init();

});
