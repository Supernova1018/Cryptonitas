-- 1. Crear la tabla de Roles (para RF1)
CREATE TABLE IF NOT EXISTS public.rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Crear la tabla de Usuarios (para RF1, RF3)
CREATE TABLE IF NOT EXISTS public.usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    -- Columna clave para el balance virtual (RF3)
    saldo_virtual_usd DECIMAL(20, 2) NOT NULL DEFAULT 100000.00,
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.rol (id_rol)
);

-- 3. Crear la tabla de Criptomonedas (para RF2)
CREATE TABLE IF NOT EXISTS public.criptomoneda (
    id_criptomoneda SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    simbolo VARCHAR(20) UNIQUE NOT NULL,
    -- Este precio lo actualizará tu API (RF2)
    precio_actual DECIMAL(20, 8) DEFAULT 0.00
);

-- 4. Crear la tabla de Transacciones (para RF4)
CREATE TABLE IF NOT EXISTS public.transaccion (
    id_transaccion SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    criptomoneda_id INT NOT NULL,
    -- 'compra' o 'venta'
    tipo VARCHAR(10) NOT NULL,
    cantidad DECIMAL(20, 8) NOT NULL,
    precio_unitario DECIMAL(20, 8) NOT NULL,
    fecha_transaccion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario (id_usuario),
    CONSTRAINT fk_criptomoneda FOREIGN KEY (criptomoneda_id) REFERENCES public.criptomoneda (id_criptomoneda)
);

-- --- Datos Iniciales ---
-- Insertar los roles básicos
INSERT INTO public.rol (nombre_rol) VALUES ('admin'), ('usuario')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Insertar algunas criptos para empezar
INSERT INTO public.criptomoneda (nombre, simbolo) VALUES ('Bitcoin', 'BTC'), ('Ethereum', 'ETH')
ON CONFLICT (simbolo) DO NOTHING;