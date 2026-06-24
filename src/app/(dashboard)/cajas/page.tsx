'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TipoCaja, MovimientoCaja } from '@/types'
import { Wallet, ArrowRight, Plus, X, RefreshCw, Banknote, CreditCard, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CAJAS: TipoCaja[] = ['EFECTIVO', 'TRANSFERENCIA', 'CLUB']

const CAJA_ICON: Record<TipoCaja, React.ReactNode> = {
  EFECTIVO: <Banknote size={20} />,
  TRANSFERENCIA: <CreditCard size={20} />,
  CLUB: <Building2 size={20} />,
}

const CAJA_COLOR: Record<TipoCaja, string> = {
  EFECTIVO: '#4ade80',
  TRANSFERENCIA: 'var(--primary)',
  CLUB: '#c084fc',
}

export default function CajasPage() {
  const [saldos, setSaldos] = useState<Record<TipoCaja, number>>({ EFECTIVO: 0, TRANSFERENCIA: 0, CLUB: 0 })
  const [movimientos, setMovimientos] = useState<(MovimientoCaja & { usuarios: { nombre: string; apellido: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ origen: 'EFECTIVO' as TipoCaja, destino: 'CLUB' as TipoCaja, monto: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  const supabase = createClient()

  async function calcularSaldos() {
    // Ventas → suman a EFECTIVO y TRANSFERENCIA
    const { data: ventas } = await supabase.from('ventas').select('monto_efectivo, monto_transferencia').eq('cancelada', false)
    // Gastos → restan de la caja correspondiente
    const { data: gastos } = await supabase.from('gastos').select('monto, caja')
    // Ingresos → suman a la caja correspondiente
    const { data: ingresos } = await supabase.from('ingresos').select('monto, caja')
    // Movimientos entre cajas
    const { data: movs } = await supabase.from('movimientos_caja').select('monto, caja_origen, caja_destino')

    const s: Record<TipoCaja, number> = { EFECTIVO: 0, TRANSFERENCIA: 0, CLUB: 0 }

    ventas?.forEach(v => {
      s.EFECTIVO += v.monto_efectivo
      s.TRANSFERENCIA += v.monto_transferencia
    })
    gastos?.forEach(g => { s[g.caja as TipoCaja] -= g.monto })
    ingresos?.forEach(i => { s[i.caja as TipoCaja] += i.monto })
    movs?.forEach(m => {
      s[m.caja_origen as TipoCaja] -= m.monto
      s[m.caja_destino as TipoCaja] += m.monto
    })

    setSaldos(s)
  }

  async function fetchMovimientos() {
    const { data } = await supabase
      .from('movimientos_caja')
      .select('*, usuarios(nombre, apellido)')
      .order('created_at', { ascending: false })
      .limit(50)
    setMovimientos((data as any) || [])
  }

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuarioId(user?.id || null)
    await Promise.all([calcularSaldos(), fetchMovimientos()])
    setLoading(false)
  }

  useEffect(() => { init() }, [])

  async function registrarMovimiento(e: React.FormEvent) {
    e.preventDefault()
    if (form.origen === form.destino) { setError('El origen y destino no pueden ser iguales.'); return }
    const monto = parseFloat(form.monto)
    if (monto <= 0) { setError('El monto debe ser mayor a cero.'); return }
    if (saldos[form.origen] < monto) { setError(`Saldo insuficiente en caja ${form.origen}.`); return }

    setSaving(true)
    setError('')

    const { error } = await supabase.from('movimientos_caja').insert({
      caja_origen: form.origen,
      caja_destino: form.destino,
      monto,
      descripcion: form.descripcion || null,
      fecha: new Date().toISOString(),
      usuario_id: usuarioId,
    })

    if (error) { setError('Error al registrar el movimiento.'); setSaving(false); return }

    setShowModal(false)
    setForm({ origen: 'EFECTIVO', destino: 'CLUB', monto: '', descripcion: '' })
    setSaving(false)
    await Promise.all([calcularSaldos(), fetchMovimientos()])
  }

  const totalGeneral = Object.values(saldos).reduce((a, b) => a + b, 0)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cajas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Total general: <span className="font-bold text-white">${totalGeneral.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost py-2 px-3 text-sm" onClick={init}>
            <RefreshCw size={15} />
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <ArrowRight size={16} /> Mover fondos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <>
          {/* Cards de cajas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {CAJAS.map(caja => (
              <div key={caja} className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl" style={{ background: `${CAJA_COLOR[caja]}18`, color: CAJA_COLOR[caja] }}>
                    {CAJA_ICON[caja]}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{caja}</span>
                </div>
                <p className="text-3xl font-bold text-white">${saldos[caja].toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: saldos[caja] >= 0 ? 'var(--text-muted)' : '#f87171' }}>
                  {saldos[caja] < 0 ? 'Saldo negativo' : 'Disponible'}
                </p>
              </div>
            ))}
          </div>

          {/* Historial de movimientos */}
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Historial de movimientos
          </h2>

          {movimientos.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Wallet size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-muted)' }}>No hay movimientos registrados.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Origen</th>
                    <th></th>
                    <th>Destino</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.id}>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(m.fecha), "d MMM HH:mm", { locale: es })}
                      </td>
                      <td>
                        <span className="badge badge-blue">{m.caja_origen}</span>
                      </td>
                      <td><ArrowRight size={14} style={{ color: 'var(--text-muted)' }} /></td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}>
                          {m.caja_destino}
                        </span>
                      </td>
                      <td className="font-bold" style={{ color: '#4ade80' }}>${m.monto.toFixed(2)}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.descripcion || '—'}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(m as any).usuarios?.nombre} {(m as any).usuarios?.apellido}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal mover fondos */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Mover fondos</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={registrarMovimiento} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Desde *</label>
                  <select className="select-glass" value={form.origen} onChange={e => setForm(f => ({ ...f, origen: e.target.value as TipoCaja }))}>
                    {CAJAS.map(c => <option key={c} value={c}>{c} — ${saldos[c].toFixed(2)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Hacia *</label>
                  <select className="select-glass" value={form.destino} onChange={e => setForm(f => ({ ...f, destino: e.target.value as TipoCaja }))}>
                    {CAJAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview flecha */}
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="badge badge-blue">{form.origen}</span>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="badge" style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}>{form.destino}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Monto *</label>
                <input className="input-glass" type="number" step="0.01" min="0.01" placeholder="$0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} required />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Disponible en {form.origen}: <span className="text-white">${saldos[form.origen].toFixed(2)}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Descripción (opcional)</label>
                <input className="input-glass" placeholder="Ej: Cierre evento torneo" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={15} />}
                  Mover fondos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
