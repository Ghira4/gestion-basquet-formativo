export type CategoriaProducto = 'BEBIDAS' | 'COMIDAS' | 'GOLOSINAS' | 'ESPECIAL'
export type TipoCaja = 'EFECTIVO' | 'TRANSFERENCIA' | 'CLUB'
export type EstadoEvento = 'ABIERTO' | 'CERRADO'
export type CategoriaGasto = 'MERCADERIA' | 'SUELDO' | 'ARBITROS' | 'OTRO'
export type CategoriaIngreso = 'PUBLICIDAD' | 'ENTRADAS' | 'DONACION' | 'OTRO'

export interface Usuario {
  id: string
  dni: string
  nombre: string
  apellido: string
  fecha_nac: string
  created_at: string
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string | null
  estado: EstadoEvento
  fecha_apertura: string
  fecha_cierre: string | null
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  categoria: CategoriaProducto
  precio_venta: number
  costo_compra: number
  stock: number
  activo: boolean
  created_at: string
}

export interface Venta {
  id: string
  evento_id: string
  usuario_id: string
  total: number
  monto_efectivo: number
  monto_transferencia: number
  cancelada: boolean
  created_at: string
  evento?: Evento
  items?: VentaItem[]
}

export interface VentaItem {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  costo_unitario: number
  producto?: Producto
}

export interface Gasto {
  id: string
  evento_id: string | null
  categoria: CategoriaGasto
  descripcion: string
  monto: number
  caja: TipoCaja
  fecha: string
  created_at: string
}

export interface Ingreso {
  id: string
  evento_id: string | null
  categoria: CategoriaIngreso
  descripcion: string
  monto: number
  caja: TipoCaja
  fecha: string
  created_at: string
}

export interface MovimientoCaja {
  id: string
  caja_origen: TipoCaja
  caja_destino: TipoCaja
  monto: number
  descripcion: string | null
  fecha: string
  usuario_id: string
  created_at: string
}

export interface CarritoItem {
  producto: Producto
  cantidad: number
}
