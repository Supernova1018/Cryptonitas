API REST (Node.js/PostgreSQL) para un simulador de trading de criptomonedas con balance virtual y un asistente de IA (Ollama) integrado.

Este proyecto backend está construido usando una arquitectura limpia basada en Patrones de Diseño (`Capa de Servicio`, `Adaptador` y `Estrategia`) para máxima mantenibilidad y escalabilidad.

## 📋 Tabla de Contenidos

1.  [Tecnologías Utilizadas](https://www.google.com/search?q=%23-tecnolog%C3%ADas-utilizadas)
2.  [Estructura del Proyecto](https://www.google.com/search?q=%23-estructura-del-proyecto)
3.  [Primeros Pasos](https://www.google.com/search?q=%23-primeros-pasos)
      * [Prerrequisitos](https://www.google.com/search?q=%23prerrequisitos)
      * [Configuración de la Base de Datos](https://www.google.com/search?q=%23configuraci%C3%B3n-de-la-base-de-datos)
      * [Configuración de la IA Local](https://www.google.com/search?q=%23configuraci%C3%B3n-de-la-ia-local)
4.  [Instalación y Ejecución](https://www.google.com/search?q=%23-instalaci%C3%B3n-y-ejecuci%C3%B3n)
5.  [Referencia de la API (Endpoints)](https://www.google.com/search?q=%23-referencia-de-la-api-endpoints)
      * [Autenticación (RF1)](https://www.google.com/search?q=%23autenticaci%C3%B3n-rf1)
      * [Criptomonedas (RF2)](https://www.google.com/search?q=%23criptomonedas-rf2)
      * [Trading (RF3)](https://www.google.com/search?q=%23trading-rf3)
      * [Portafolio e Historial (RF4, RF5)](https://www.google.com/search?q=%23portafolio-e-historial-rf4-rf5)
      * [Asistente de IA (RF6)](https://www.google.com/search?q=%23asistente-de-ia-rf6)

-----

## ✨ Tecnologías Utilizadas

  * **Backend:** Node.js, Express
  * **Base de Datos:** PostgreSQL (con `pg`)
  * **Autenticación:** JWT (JSON Web Tokens)
  * **Seguridad:** `bcryptjs` (para hashing de contraseñas)
  * **IA Local:** Ollama (sirviendo el modelo `gemma3:4b` o similar)
  * **Otros:** `axios`, `dotenv`, `cors`

-----

## 📁 Estructura del Proyecto

La API utiliza una arquitectura desacoplada para promover la **Separación de Responsabilidades**.

```
/crypto_api
│
├── /config         # Conexión a la BD
├── /controllers    # "Recepcionistas" (manejan req/res)
├── /middleware     # "Guardias" (ej. authMiddleware.js)
├── /routes         # "Letreros" (definen las URLs)
├── /services       # "Cerebro" (TODA la lógica de negocio)
│   ├── /aiAdapters     # Patrón Adaptador (habla con Ollama)
│   └── /aiStrategies   # Patrón Estrategia (decide CÓMO hablar)
│
├── .env.example    # Plantilla de variables de entorno
├── .gitignore      # Ignora node_modules, .env, etc.
├── index.js        # Punto de entrada de la aplicación
├── package.json    # Dependencias
└── README.md       # Esta guía
```

-----

## 🚀 Primeros Pasos

Sigue estos pasos para configurar el proyecto localmente.

### Prerrequisitos

  * **Node.js:** Versión 18 o superior.
  * **PostgreSQL:** Una instancia de base de datos corriendo (ej. con [pgAdmin](https://www.pgadmin.org/)).
  * **Ollama:** La [aplicación de Ollama](https://ollama.com/) debe estar instalada y ejecutándose.

### Configuración de la Base de Datos

1.  Abre `pgAdmin` y crea una nueva base de datos (ej. `cryptonitasdb`).
2.  Abre la herramienta de consulta (Query Tool) para esa base de datos.
3.  Ejecuta el script SQL completo (el que te proporcioné anteriormente, que crea las tablas `usuario`, `rol`, `criptomoneda` y `transaccion`).

### Configuración de la IA Local

1.  Asegúrate de que la aplicación de Ollama esté **corriendo en segundo plano**.
2.  Abre una terminal y descarga el modelo de IA que elegiste:
    ```bash
    ollama pull gemma3:4b
    ```
    *(Asegúrate de que el nombre del modelo coincida con el que está en `/services/aiAdapters/ollamaAdapter.js`)*.

-----

## 💻 Instalación y Ejecución

1.  **Clona el repositorio:**

    ```bash
    git clone https://github.com/hannerjuan/cryptoAPI.git
    cd cryptoAPI
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install
    ```

3.  **Crea tu archivo `.env`:**
    Crea un archivo llamado `.env` en la raíz del proyecto. Copia el contenido de `.env.example` (si lo creaste) o usa esta plantilla:

    ```ini
    # Configuración de la Base de Datos PostgreSQL
    DB_USER=postgres
    DB_HOST=localhost
    DB_DATABASE=cryptonitasdb # (El nombre de tu BD)
    DB_PASSWORD=tu_contraseña_de_postgres
    DB_PORT=5432

    # Puerto del Servidor
    PORT=5000

    # Secreto para JSON Web Token (JWT)
    JWT_SECRET=UNA_FRASE_SECRETA_MUY_LARGA_Y_ALEATORIA
    ```

4.  **Inicia el servidor:**

    ```bash
    node index.js
    ```

    Verás un mensaje: `🚀 Servidor corriendo en http://localhost:5000`

-----

## 📖 Referencia de la API (Endpoints)

### Autenticación (RF1)

#### `POST /api/auth/register`

Registra un nuevo usuario.

  * **Body (JSON):**
    ```json
    {
      "nombre": "Usuario de Prueba",
      "correo_electronico": "prueba@correo.com",
      "contrasena": "clave123"
    }
    ```

#### `POST /api/auth/login`

Inicia sesión y obtiene un token JWT.

  * **Body (JSON):**
    ```json
    {
      "correo_electronico": "prueba@correo.com",
      "contrasena": "clave123"
    }
    ```

-----

### Criptomonedas (RF2)

#### `GET /api/crypto/prices`

Obtiene la lista de precios de criptomonedas desde la BD. (Ruta pública)

#### `POST /api/crypto/update-prices`

Fuerza la actualización de precios desde la API externa (CoinGecko). (Ruta pública)

-----

### Trading (RF3)

*(Rutas protegidas - requieren `Bearer Token`)*

#### `POST /api/trade/buy`

Simula una compra con saldo virtual.

  * **Body (JSON):**
    ```json
    {
      "simbolo": "BTC",
      "cantidad_usd": 1500
    }
    ```

#### `POST /api/trade/sell`

Simula una venta de criptomonedas.

  * **Body (JSON):**
    ```json
    {
      "simbolo": "BTC",
      "cantidad_cripto": 0.01
    }
    ```

-----

### Portafolio e Historial (RF4, RF5)

*(Rutas protegidas - requieren `Bearer Token`)*

#### `GET /api/portafolio`

Calcula y devuelve el portafolio actual del usuario (tenencias y saldos).

#### `GET /api/trade/history`

Devuelve un array con todas las transacciones (compras/ventas) del usuario.

-----

### Asistente de IA (RF6)

*(Ruta protegida - requiere `Bearer Token`)*

#### `POST /api/ai/ask`

Envía una pregunta al asistente de IA. El `tipo` le indica a la API qué estrategia usar.

  * **Estrategia General (Rápida, sin consulta a BD):**

    ```json
    {
      "pregunta": "¿Qué es una criptomoneda?",
      "tipo": "general"
    }
    ```

  * **Estrategia de Portafolio (Lenta, consulta BD):**

    ```json
    {
      "pregunta": "¿Cómo ves mi portafolio?",
      "tipo": "portafolio"
    }
    ```
