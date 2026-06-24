'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Evento, Producto, CarritoItem, CategoriaProducto, Venta } from '@/types'
import {
  ShoppingCart, Plus, Minus, Trash2, X, Check, CreditCard,
  Banknote, AlertCircle, Eye, Ban, ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORIAS: CategoriaProducto[] = ['BEBIDAS', 'COMIDAS', 'GOLOSINAS', 'ESPECIAL']

export default function VentasPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | 'TODAS'>('TODAS')
  const [showPago, setShowPago] = useState(false)
  const [showVentas, setShowVentas] = useState(false)
  const [ventas, setVentas] = useState<(Venta & { items: any[] })[]>([])
  const [montoEfectivo, setMontoEfectivo] = useState('')
  const [montoTransferencia, setMontoTransferencia] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [pagoError, setPagoError] = useState('')
  const [loading, setLoading] = useState(true)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuarioId(user?.id || null)

      const { data: evs } = await supabase.from('eventos').select('*').eq('estado', 'ABIERTO').order('created_at', { ascending: false })
      setEventos(evs || [])
      if (evs && evs.length === 1) setEventoActivo(evs[0])

      const { data: prods } = await supabase.from('productos').select('*').eq('activo', true).order('nombre')
      setProductos(prods || [])
      setLoading(false)
    }
    init()
  }, [])

  async function fetchVentas(eventoId: string) {
    const { data } = await supabase
      .from('ventas')
      .select('*, venta_items(*, productos(nombre))')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false })
    setVentas((data as any) || [])
  }

  function agregarAlCarrito(producto: Producto) {
    if (producto.stock <= 0) return
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev
        return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito(prev => prev
      .map(i => i.producto.id === id ? { ...i, cantidad: Math.max(0, Math.min(i.cantidad + delta, i.producto.stock)) } : i)
      .filter(i => i.cantidad > 0)
    )
  }

  function quitarDelCarrito(id: string) {
    setCarrito(prev => prev.filter(i => i.producto.id !== id))
  }

  const total = carrito.reduce((acc, i) => acc + i.producto.precio_venta * i.cantidad, 0)
  const efectivo = parseFloat(montoEfectivo || '0')
  const transferencia = parseFloat(montoTransferencia || '0')
  const totalPagado = efectivo + transferencia
  const vuelto = totalPagado - total

  async function confirmarVenta() {
    if (!eventoActivo || !usuarioId) return
    if (carrito.length === 0) return
    if (totalPagado < total) { setPagoError('El monto pagado es insuficiente.'); return }
    setPagoError('')
    setProcesando(true)

    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        evento_id: eventoActivo.id,
        usuario_id: usuarioId,
        total,
        monto_efectivo: efectivo,
        monto_transferencia: transferencia,
        cancelada: false,
      })
      .select()
      .single()

    if (ventaError || !ventaData) { setPagoError('Error al registrar la venta.'); setProcesando(false); return }

    await supabase.from('venta_items').insert(
      carrito.map(i => ({
        venta_id: ventaData.id,
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio_venta,
        costo_unitario: i.producto.costo_compra,
      }))
    )

    for (const item of carrito) {
      await supabase.from('productos').update({ stock: item.producto.stock - item.cantidad }).eq('id', item.producto.id)
    }

    const { data: prods } = await supabase.from('productos').select('*').eq('activo', true).order('nombre')
    setProductos(prods || [])
    setCarrito([])
    setMontoEfectivo('')
    setMontoTransferencia('')
    setShowPago(false)
    setProcesando(false)
  }

  async function cancelarVenta(ventaId: string) {
    await supabase.from('ventas').update({ cancelada: true }).eq('id', ventaId)
    if (eventoActivo) fetchVentas(eventoActivo.id)
  }

  const productosFiltrados = productos.filter(p =>
    categoriaFiltro === 'TODAS' ? true : p.categoria === categoriaFiltro
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-6">Ventas</h1>
        <div className="glass-card p-12 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-40" style={{ color: '#facc15' }} />
          <p className="font-semibold text-white">No hay eventos abiertos</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Para registrar ventas primero debés abrir un evento desde el módulo de Eventos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventas</h1>
          {eventoActivo && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--primary)' }}>
              Evento: {eventoActivo.nombre}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de evento */}
          {eventos.length > 1 && (
            <div className="relative">
              <select
                className="select-glass pr-8 text-sm"
                value={eventoActivo?.id || ''}
                onChange={e => setEventoActivo(eventos.find(ev => ev.id === e.target.value) || null)}
              >
                <option value="">Seleccioná un evento</option>
                {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
              </select>
            </div>
          )}
          {eventoActivo && (
            <button
              className="btn-ghost text-sm py-2 px-3"
              onClick={() => { setShowVentas(true); fetchVentas(eventoActivo.id) }}
            >
              <Eye size={15} /> Ver ventas
            </button>
          )}
        </div>
      </div>

      {!eventoActivo ? (
        <div className="glass-card p-10 text-center">
          <p style={{ color: 'var(--text-muted)' }}>Seleccioná un evento para comenzar a vender.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {/* Productos */}
          <div className="flex-1 min-w-0">
            {/* Filtro categorías */}
            <div className="flex gap-2 flex-wrap mb-5">
              {(['TODAS', ...CATEGORIAS] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: categoriaFiltro === cat ? 'var(--primary)' : 'rgba(85,189,251,0.08)',
                    color: categoriaFiltro === cat ? 'var(--dark)' : 'var(--text-muted)',
                    border: `1px solid ${categoriaFiltro === cat ? 'var(--primary)' : 'var(--glass-border)'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosFiltrados.map(p => {
                const enCarrito = carrito.find(i => i.producto.id === p.id)
                const sinStock = p.stock <= 0
                return (
                  <button
                    key={p.id}
                    onClick={() => !sinStock && agregarAlCarrito(p)}
                    disabled={sinStock}
                    className="glass-card p-5 text-left transition-all"
                    style={{
                      opacity: sinStock ? 0.4 : 1,
                      cursor: sinStock ? 'not-allowed' : 'pointer',
                      borderColor: enCarrito ? 'var(--primary)' : undefined,
                      boxShadow: enCarrito ? '0 0 0 1px var(--primary), 0 8px 32px rgba(85,189,251,0.15)' : undefined,
                    }}
                  >
                    <p className="font-semibold text-white text-base leading-tight mb-2">{p.nombre}</p>
                    <p className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>${p.precio_venta.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: sinStock ? '#f87171' : 'var(--text-muted)' }}>
                      {sinStock ? 'Sin stock' : `${p.stock} disponibles`}
                    </p>
                    {enCarrito && (
                      <div className="mt-3 px-3 py-1 rounded-xl text-xs font-bold text-center" style={{ background: 'rgba(85,189,251,0.15)', color: 'var(--primary)' }}>
                        ×{enCarrito.cantidad} en carrito
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Carrito */}
          <div className="lg:w-96 shrink-0">
            <div className="glass-card p-5 sticky top-6 flex flex-col" style={{ minHeight: 320 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl" style={{ background: 'rgba(85,189,251,0.12)', color: 'var(--primary)' }}>
                  <ShoppingCart size={18} />
                </div>
                <h2 className="font-bold text-white text-lg">Carrito</h2>
                {carrito.length > 0 && (
                  <span className="ml-auto badge badge-blue">{carrito.reduce((a, i) => a + i.cantidad, 0)} items</span>
                )}
              </div>

              {carrito.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <ShoppingCart size={36} className="mb-3 opacity-20" style={{ color: 'var(--primary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tocá un producto para agregarlo</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 mb-4 overflow-y-auto" style={{ maxHeight: 340 }}>
                    {carrito.map(item => (
                      <div key={item.producto.id} className="glass-sm p-3.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.producto.nombre}</p>
                          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--primary)' }}>${(item.producto.precio_venta * item.cantidad).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold text-white w-6 text-center">{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                            <Plus size={13} />
                          </button>
                          <button onClick={() => quitarDelCarrito(item.producto.id)} className="w-7 h-7 rounded-lg flex items-center justify-center ml-1 transition-colors hover:bg-red-500/10" style={{ color: '#f87171' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />
                  <div className="flex items-center justify-between py-3">
                    <span className="font-semibold text-base" style={{ color: 'var(--text-muted)' }}>Total</span>
                    <span className="text-3xl font-bold text-white">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button className="btn-ghost flex-1" onClick={() => setCarrito([])}>
                      <Trash2 size={15} /> Limpiar
                    </button>
                    <button className="btn-primary flex-1" onClick={() => setShowPago(true)}>
                      <CreditCard size={15} /> Cobrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal pago */}
      {showPago && (
        <div className="modal-overlay" onClick={() => setShowPago(false)}>
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Registrar pago</h3>
              <button onClick={() => setShowPago(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div className="glass-sm p-3 flex items-center justify-between mb-5">
              <span style={{ color: 'var(--text-muted)' }}>Total a cobrar</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <Banknote size={14} /> Efectivo
                </label>
                <input
                  className="input-glass"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$0.00"
                  value={montoEfectivo}
                  onChange={e => setMontoEfectivo(e.target.value)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <CreditCard size={14} /> Transferencia
                </label>
                <input
                  className="input-glass"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$0.00"
                  value={montoTransferencia}
                  onChange={e => setMontoTransferencia(e.target.value)}
                />
              </div>
            </div>

            {/* Resumen pago */}
            {totalPagado > 0 && (
              <div className="glass-sm p-3 mt-4 flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Pagado</span>
                  <span className="font-semibold text-white">${totalPagado.toFixed(2)}</span>
                </div>
                {vuelto >= 0 && efectivo > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Vuelto efectivo</span>
                    <span className="font-bold" style={{ color: '#4ade80' }}>${vuelto.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {pagoError && <p className="text-sm mt-3" style={{ color: '#f87171' }}>{pagoError}</p>}

            <div className="flex gap-3 mt-5">
              <button className="btn-ghost flex-1" onClick={() => setShowPago(false)}>Cancelar</button>
              <button
                className="btn-primary flex-1"
                onClick={confirmarVenta}
                disabled={procesando || totalPagado < total}
              >
                {procesando ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver ventas del evento */}
      {showVentas && eventoActivo && (
        <div className="modal-overlay" onClick={() => setShowVentas(false)}>
          <div className="glass-card p-6 w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="font-bold text-white text-lg">Ventas del evento</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{eventoActivo.nombre}</p>
              </div>
              <button onClick={() => setShowVentas(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1">
              {ventas.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No hay ventas registradas.</p>
              ) : (
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Items</th>
                      <th>Efectivo</th>
                      <th>Transf.</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v: any) => (
                      <tr key={v.id} style={{ opacity: v.cancelada ? 0.5 : 1 }}>
                        <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(v.created_at), 'HH:mm', { locale: es })}
                        </td>
                        <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {v.venta_items?.map((i: any) => `${i.cantidad}× ${i.productos?.nombre}`).join(', ')}
                        </td>
                        <td>${v.monto_efectivo.toFixed(2)}</td>
                        <td>${v.monto_transferencia.toFixed(2)}</td>
                        <td className="font-bold" style={{ color: 'var(--primary)' }}>${v.total.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${v.cancelada ? 'badge-red' : 'badge-green'}`}>
                            {v.cancelada ? 'Cancelada' : 'OK'}
                          </span>
                        </td>
                        <td>
                          {!v.cancelada && (
                            <button onClick={() => cancelarVenta(v.id)} className="p-1 rounded transition-colors hover:bg-red-500/10" style={{ color: '#f87171' }} title="Cancelar venta">
                              <Ban size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Resumen caja */}
            {ventas.length > 0 && (
              <div className="shrink-0 mt-4 pt-4 grid grid-cols-3 gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Efectivo', value: ventas.filter(v => !v.cancelada).reduce((a: number, v: any) => a + v.monto_efectivo, 0) },
                  { label: 'Transferencia', value: ventas.filter(v => !v.cancelada).reduce((a: number, v: any) => a + v.monto_transferencia, 0) },
                  { label: 'Total', value: ventas.filter(v => !v.cancelada).reduce((a: number, v: any) => a + v.total, 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-sm p-3 text-center">
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="font-bold text-white">${(value as number).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
