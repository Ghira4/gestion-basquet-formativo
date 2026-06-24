'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gasto, Evento, CategoriaGasto, TipoCaja } from '@/types'
import { TrendingDown, Plus, X, Package } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORIAS: CategoriaGasto[] = ['MERCADERIA', 'SUELDO', 'ARBITROS', 'OTRO']
const CAJAS: TipoCaja[] = ['EFECTIVO', 'TRANSFERENCIA', 'CLUB']

const EMPTY_FORM = {
  categoria: 'MERCADERIA' as CategoriaGasto,
  descripcion: '',
  monto: '',
  caja: 'EFECTIVO' as TipoCaja,
  fecha: new Date().toISOString().split('T')[0],
  evento_id: '',
}

type Tab = 'manual' | 'buffet'

export default function GastosPage() {
  const [tab, setTab] = useState<Tab>('buffet')
  const [gastos, setGastos] = useState<(Gasto & { eventos: { nombre: string } | null })[]>([])
  const [ventaItems, setVentaItems] = useState<any[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filtroCat, setFiltroCat] = useState<CategoriaGasto | 'TODAS'>('TODAS')
  const [filtroEvento, setFiltroEvento] = useState<string>('TODOS')

  const supabase = createClient()

  async function fetchData() {
    const [{ data: g }, { data: ev }, { data: vi }] = await Promise.all([
      supabase.from('gastos').select('*, eventos(nombre)').order('fecha', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('eventos').select('*').order('created_at', { ascending: false }),
      supabase.from('venta_items')
        .select('*, productos(nombre, categoria), ventas!inner(evento_id, cancelada, eventos(nombre))')
        .eq('ventas.cancelada', false),
    ])
    setGastos((g as any) || [])
    setEventos((ev as any) || [])
    setVentaItems(vi || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('gastos').insert({
      categoria: form.categoria,
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      caja: form.caja,
      fecha: form.fecha,
      evento_id: form.evento_id || null,
    })
    if (error) { setError('Error al registrar el gasto.'); setSaving(false); return }
    setShowModal(false)
    setForm(EMPTY_FORM)
    setSaving(false)
    fetchData()
  }

  // Items del buffet filtrados
  const itemsFiltrados = ventaItems.filter((vi: any) =>
    filtroEvento === 'TODOS' || vi.ventas?.evento_id === filtroEvento
  )

  // Agrupar por producto para el tab buffet
  const costosPorProducto: Record<string, { nombre: string; categoria: string; cantidad: number; costo: number; ingreso: number }> = {}
  itemsFiltrados.forEach((vi: any) => {
    const nombre = vi.productos?.nombre || 'Desconocido'
    if (!costosPorProducto[nombre]) {
      costosPorProducto[nombre] = { nombre, categoria: vi.productos?.categoria || '', cantidad: 0, costo: 0, ingreso: 0 }
    }
    costosPorProducto[nombre].cantidad += vi.cantidad
    costosPorProducto[nombre].costo += vi.costo_unitario * vi.cantidad
    costosPorProducto[nombre].ingreso += vi.precio_unitario * vi.cantidad
  })
  const productosBuffet = Object.values(costosPorProducto).sort((a, b) => b.costo - a.costo)
  const totalCostoBuffet = productosBuffet.reduce((a, p) => a + p.costo, 0)
  const totalIngresoBuffet = productosBuffet.reduce((a, p) => a + p.ingreso, 0)
  const gananciaBuffet = totalIngresoBuffet - totalCostoBuffet

  // Gastos manuales filtrados
  const gastosFiltrados = gastos.filter(g => {
    const matchCat = filtroCat === 'TODAS' || g.categoria === filtroCat
    const matchEv = filtroEvento === 'TODOS' || (filtroEvento === 'SIN_EVENTO' ? !g.evento_id : g.evento_id === filtroEvento)
    return matchCat && matchEv
  })
  const totalManual = gastosFiltrados.reduce((a, g) => a + g.monto, 0)

  const BADGE_CAT: Record<CategoriaGasto, string> = {
    MERCADERIA: 'badge-blue',
    SUELDO: 'badge-yellow',
    ARBITROS: 'badge-green',
    OTRO: 'badge-red',
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Costo buffet: <span className="font-bold" style={{ color: '#f87171' }}>${totalCostoBuffet.toFixed(2)}</span>
            {totalManual > 0 && <> · Otros: <span className="font-bold" style={{ color: '#f87171' }}>${totalManual.toFixed(2)}</span></>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar gasto
        </button>
      </div>

      {/* Tabs + filtro evento */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(85,189,251,0.06)', border: '1px solid var(--glass-border)' }}>
          {([['buffet', 'Buffet (costo mercadería)'], ['manual', 'Otros gastos']] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? 'var(--dark)' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <select className="select-glass sm:w-56 ml-auto" value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)}>
          <option value="TODOS">Todos los eventos</option>
          {tab === 'manual' && <option value="SIN_EVENTO">Sin evento</option>}
          {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : tab === 'buffet' ? (
        <>
          {/* Resumen buffet */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="stat-card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Costo total mercadería</p>
              <p className="text-2xl font-bold" style={{ color: '#f87171' }}>${totalCostoBuffet.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Total vendido</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>${totalIngresoBuffet.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Ganancia en productos</p>
              <p className="text-2xl font-bold" style={{ color: gananciaBuffet >= 0 ? '#4ade80' : '#f87171' }}>${gananciaBuffet.toFixed(2)}</p>
            </div>
          </div>

          {productosBuffet.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Package size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#f87171' }} />
              <p className="font-medium text-white">Sin datos de buffet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Los costos de productos vendidos aparecen acá automáticamente.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades vendidas</th>
                    <th>Costo total</th>
                    <th>Ingreso total</th>
                    <th>Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {productosBuffet.map(p => (
                    <tr key={p.nombre}>
                      <td className="font-semibold text-white">{p.nombre}</td>
                      <td><span className="badge badge-blue">{p.categoria}</span></td>
                      <td>{p.cantidad} u.</td>
                      <td style={{ color: '#f87171' }}>-${p.costo.toFixed(2)}</td>
                      <td style={{ color: 'var(--primary)' }}>+${p.ingreso.toFixed(2)}</td>
                      <td className="font-bold" style={{ color: p.ingreso - p.costo >= 0 ? '#4ade80' : '#f87171' }}>
                        ${(p.ingreso - p.costo).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 flex justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: '#f87171' }}>Costo total: -${totalCostoBuffet.toFixed(2)}</span>
                <span className="text-sm font-bold" style={{ color: gananciaBuffet >= 0 ? '#4ade80' : '#f87171' }}>Ganancia: ${gananciaBuffet.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {(['TODAS', ...CATEGORIAS] as const).map(cat => (
              <button key={cat} onClick={() => setFiltroCat(cat)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: filtroCat === cat ? 'var(--primary)' : 'rgba(85,189,251,0.08)', color: filtroCat === cat ? 'var(--dark)' : 'var(--text-muted)', border: `1px solid ${filtroCat === cat ? 'var(--primary)' : 'var(--glass-border)'}` }}>
                {cat}
              </button>
            ))}
          </div>

          {gastosFiltrados.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <TrendingDown size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#f87171' }} />
              <p className="font-medium text-white">Sin gastos registrados</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Evento</th><th>Caja</th><th>Monto</th></tr></thead>
                <tbody>
                  {gastosFiltrados.map(g => (
                    <tr key={g.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(g.fecha + 'T00:00:00'), "d MMM yyyy", { locale: es })}</td>
                      <td><span className={`badge ${BADGE_CAT[g.categoria]}`}>{g.categoria}</span></td>
                      <td className="font-medium text-white">{g.descripcion}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{(g as any).eventos?.nombre || '—'}</td>
                      <td><span className="badge badge-blue">{g.caja}</span></td>
                      <td className="font-bold" style={{ color: '#f87171' }}>-${g.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: '#f87171' }}>Total: -${totalManual.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Registrar gasto</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={guardar} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoría *</label>
                  <select className="select-glass" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaGasto }))}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Fecha *</label>
                  <input className="input-glass" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Descripción *</label>
                <input className="input-glass" placeholder="Ej: Compra de 24 gaseosas" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Monto *</label>
                  <input className="input-glass" type="number" step="0.01" min="0.01" placeholder="$0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Caja *</label>
                  <select className="select-glass" value={form.caja} onChange={e => setForm(f => ({ ...f, caja: e.target.value as TipoCaja }))}>
                    {CAJAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Evento (opcional)</label>
                <select className="select-glass" value={form.evento_id} onChange={e => setForm(f => ({ ...f, evento_id: e.target.value }))}>
                  <option value="">Sin evento</option>
                  {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
                </select>
              </div>
              {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
