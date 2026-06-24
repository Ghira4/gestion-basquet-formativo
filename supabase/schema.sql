-- =============================================
-- SCC BASQUET FORMATIVO - Schema Supabase
-- =============================================

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dni TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nac DATE NOT NULL,
  email_auth TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO','CERRADO')),
  fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos / Stock
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('BEBIDAS','COMIDAS','GOLOSINAS','ESPECIAL')),
  precio_venta NUMERIC(10,2) NOT NULL DEFAULT 0,
  costo_compra NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  monto_efectivo NUMERIC(10,2) NOT NULL DEFAULT 0,
  monto_transferencia NUMERIC(10,2) NOT NULL DEFAULT 0,
  cancelada BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de ventas
CREATE TABLE IF NOT EXISTS venta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  costo_unitario NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id),
  categoria TEXT NOT NULL CHECK (categoria IN ('MERCADERIA','SUELDO','ARBITROS','OTRO')),
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  caja TEXT NOT NULL CHECK (caja IN ('EFECTIVO','TRANSFERENCIA','CLUB')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingresos
CREATE TABLE IF NOT EXISTS ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id),
  categoria TEXT NOT NULL CHECK (categoria IN ('PUBLICIDAD','ENTRADAS','DONACION','OTRO')),
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  caja TEXT NOT NULL CHECK (caja IN ('EFECTIVO','TRANSFERENCIA','CLUB')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimientos de caja
CREATE TABLE IF NOT EXISTS movimientos_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caja_origen TEXT NOT NULL CHECK (caja_origen IN ('EFECTIVO','TRANSFERENCIA','CLUB')),
  caja_destino TEXT NOT NULL CHECK (caja_destino IN ('EFECTIVO','TRANSFERENCIA','CLUB')),
  monto NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS Policies (habilitar para todas las tablas)
-- =============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- Política: usuarios autenticados ven y modifican todo
CREATE POLICY "authenticated_all" ON usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Política: permite insertar en usuarios al registrarse (antes de estar autenticado)
CREATE POLICY "insert_on_register" ON usuarios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_all" ON eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON ventas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON venta_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON gastos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON ingresos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all" ON movimientos_caja FOR ALL TO authenticated USING (true) WITH CHECK (true);
