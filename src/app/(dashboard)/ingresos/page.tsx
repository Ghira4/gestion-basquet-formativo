'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ingreso, Evento, CategoriaIngreso, TipoCaja } from '@/types'
import { TrendingUp, Plus, X, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORIAS: CategoriaIngreso[] = ['PUBLICIDAD', 'ENTRADAS', 'DONACION', 'OTRO']
const CAJAS: TipoCaja[] = ['EFECTIVO', 'TRANSFERENCIA', 'CLUB']

const EMPTY_FORM = {
  categoria: 'ENTRADAS' as CategoriaIngreso,
  descripcion: '',
  monto: '',
  caja: 'EFECTIVO' as TipoCaja,
  fecha: new Date().toISOString().split('T')[0],
  evento_id: '',
}

type Tab = 'manual' | 'buffet'

export default function IngresosPage() {
  const [tab, setTab] = useState<Tab>('buffet')
  const [ingresos, setIngresos] = useState<(Ingreso & { eventos: { nombre: string } | null })[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [filtroEvento, setFiltroEvento] = useState<string>('TODOS')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filtroCat, setFiltroCat] = useState<CategoriaIngreso | 'TODAS'>('TODAS')

  const supabase = createClient()

  async function fetchData() {
    const [{ data: ing }, { data: ev }, { data: v }] = await Promise.all([
      supabase.from('ingresos').select('*, eventos(nombre)').order('fecha', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('eventos').select('*').order('created_at', { ascending: false }),
      supabase.from('ventas').select('*, eventos(nombre), venta_items(cantidad, precio_unitario, productos(nombre))').eq('cancelada', false).order('created_at', { ascending: false }),
    ])
    setIngresos((ing as any) || [])
    setEventos((ev as any) || [])
    setVentas(v || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('ingresos').insert({
      categoria: form.categoria,
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      caja: form.caja,
      fecha: form.fecha,
      evento_id: form.evento_id || null,
    })
    if (error) { setError('Error al registrar el ingreso.'); setSaving(false); return }
    setShowModal(false)
    setForm(EMPTY_FORM)
    setSaving(false)
    fetchData()
  }

  // Ventas filtradas por evento
  const ventasFiltradas = ventas.filter(v =>
    filtroEvento === 'TODOS' || v.evento_id === filtroEvento
  )
  const totalBuffet = ventasFiltradas.reduce((a: number, v: any) => a + v.total, 0)
  const totalEfectivoBuffet = ventasFiltradas.reduce((a: number, v: any) => a + v.monto_efectivo, 0)
  const totalTransfBuffet = ventasFiltradas.reduce((a: number, v: any) => a + v.monto_transferencia, 0)

  // Ingresos manuales filtrados
  const ingresosFiltrados = ingresos.filter(i => {
    const matchCat = filtroCat === 'TODAS' || i.categoria === filtroCat
    const matchEv = filtroEvento === 'TODOS' || (filtroEvento === 'SIN_EVENTO' ? !i.evento_id : i.evento_id === filtroEvento)
    return matchCat && matchEv
  })
  const totalManual = ingresosFiltrados.reduce((a, i) => a + i.monto, 0)

  const BADGE_CAT: Record<CategoriaIngreso, string> = {
    PUBLICIDAD: 'badge-blue',
    ENTRADAS: 'badge-green',
    DONACION: 'badge-yellow',
    OTRO: 'badge-red',
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ingresos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Buffet: <span className="font-bold" style={{ color: '#4ade80' }}>${totalBuffet.toFixed(2)}</span>
            {totalManual > 0 && <> · Otros: <span className="font-bold" style={{ color: '#4ade80' }}>${totalManual.toFixed(2)}</span></>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar ingreso
        </button>
      </div>

      {/* Tabs + filtro evento */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'rgba(85,189,251,0.06)', border: '1px solid var(--glass-border)' }}>
          {([['buffet', 'Buffet'], ['manual', 'Otros ingresos']] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? 'var(--dark)' : 'var(--text-muted)',
                minWidth: 120,
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
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Total recaudado</p>
              <p className="text-2xl font-bold" style={{ color: '#4ade80' }}>${totalBuffet.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>En efectivo</p>
              <p className="text-2xl font-bold text-white">${totalEfectivoBuffet.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Por transferencia</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>${totalTransfBuffet.toFixed(2)}</p>
            </div>
          </div>

          {ventasFiltradas.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#4ade80' }} />
              <p className="font-medium text-white">Sin ventas de buffet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Las ventas registradas en eventos aparecen acá automáticamente.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Fecha y hora</th>
                    <th>Evento</th>
                    <th>Items</th>
                    <th>Efectivo</th>
                    <th>Transferencia</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((v: any) => (
                    <tr key={v.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(v.created_at), "d MMM HH:mm", { locale: es })}
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.eventos?.nombre || '—'}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                        <span className="line-clamp-1">
                          {v.venta_items?.map((i: any) => `${i.cantidad}× ${i.productos?.nombre}`).join(', ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>${v.monto_efectivo.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>${v.monto_transferencia.toFixed(2)}</td>
                      <td className="font-bold" style={{ color: '#4ade80' }}>+${v.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: '#4ade80' }}>Total buffet: +${totalBuffet.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Filtro categoría */}
          <div className="flex gap-2 flex-wrap mb-4">
            {(['TODAS', ...CATEGORIAS] as const).map(cat => (
              <button key={cat} onClick={() => setFiltroCat(cat)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: filtroCat === cat ? 'var(--primary)' : 'rgba(85,189,251,0.08)', color: filtroCat === cat ? 'var(--dark)' : 'var(--text-muted)', border: `1px solid ${filtroCat === cat ? 'var(--primary)' : 'var(--glass-border)'}` }}>
                {cat}
              </button>
            ))}
          </div>

          {ingresosFiltrados.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#4ade80' }} />
              <p className="font-medium text-white">Sin ingresos registrados</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Evento</th><th>Caja</th><th>Monto</th></tr></thead>
                <tbody>
                  {ingresosFiltrados.map(i => (
                    <tr key={i.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(i.fecha + 'T00:00:00'), "d MMM yyyy", { locale: es })}</td>
                      <td><span className={`badge ${BADGE_CAT[i.categoria]}`}>{i.categoria}</span></td>
                      <td className="font-medium text-white">{i.descripcion}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{(i as any).eventos?.nombre || '—'}</td>
                      <td><span className="badge badge-blue">{i.caja}</span></td>
                      <td className="font-bold" style={{ color: '#4ade80' }}>+${i.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: '#4ade80' }}>Total: +${totalManual.toFixed(2)}</span>
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
              <h3 className="font-bold text-white text-lg">Registrar ingreso</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={guardar} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoría *</label>
                  <select className="select-glass" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaIngreso }))}>
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
                <input className="input-glass" placeholder="Ej: Patrocinio empresa X" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required />
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
