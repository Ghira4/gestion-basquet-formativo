'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Evento } from '@/types'
import { Calendar, Plus, X, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCerrarModal, setShowCerrarModal] = useState<Evento | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function fetchEventos() {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false })
    setEventos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchEventos() }, [])

  async function crearEvento(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('eventos').insert({
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      estado: 'ABIERTO',
      fecha_apertura: new Date().toISOString(),
    })
    if (error) { setError('Error al crear el evento.'); setSaving(false); return }
    setShowModal(false)
    setForm({ nombre: '', descripcion: '' })
    setSaving(false)
    fetchEventos()
  }

  async function cerrarEvento(evento: Evento) {
    await supabase.from('eventos').update({
      estado: 'CERRADO',
      fecha_cierre: new Date().toISOString(),
    }).eq('id', evento.id)
    setShowCerrarModal(null)
    fetchEventos()
  }

  const abiertos = eventos.filter(e => e.estado === 'ABIERTO')
  const cerrados = eventos.filter(e => e.estado === 'CERRADO')

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {abiertos.length} abierto{abiertos.length !== 1 ? 's' : ''} · {cerrados.length} cerrado{cerrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nuevo evento
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <>
          {abiertos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>En curso</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {abiertos.map(ev => <EventoCard key={ev.id} evento={ev} onCerrar={() => setShowCerrarModal(ev)} />)}
              </div>
            </div>
          )}

          {cerrados.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Finalizados</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {cerrados.map(ev => <EventoCard key={ev.id} evento={ev} />)}
              </div>
            </div>
          )}

          {eventos.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--primary)' }} />
              <p className="font-medium text-white">No hay eventos aún</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Creá el primer evento para comenzar a vender</p>
            </div>
          )}
        </>
      )}

      {/* Modal crear */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Nuevo evento</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={crearEvento} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre *</label>
                <input className="input-glass" placeholder="Ej: Torneo Apertura 2025" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Descripción (opcional)</label>
                <textarea className="input-glass resize-none" rows={3} placeholder="Detalles del evento..." value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                  Crear evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal cerrar */}
      {showCerrarModal && (
        <div className="modal-overlay" onClick={() => setShowCerrarModal(null)}>
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(234,179,8,0.15)' }}>
                <X size={20} style={{ color: '#facc15' }} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Cerrar evento</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{showCerrarModal.nombre}</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Al cerrar el evento ya no se podrán registrar ventas. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setShowCerrarModal(null)}>Cancelar</button>
              <button className="btn-danger flex-1" onClick={() => cerrarEvento(showCerrarModal)}>Cerrar evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EventoCard({ evento, onCerrar }: { evento: Evento; onCerrar?: () => void }) {
  const abierto = evento.estado === 'ABIERTO'
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{evento.nombre}</h3>
          {evento.descripcion && (
            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{evento.descripcion}</p>
          )}
        </div>
        <span className={`badge ml-3 shrink-0 ${abierto ? 'badge-green' : 'badge-yellow'}`}>
          {abierto ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {format(new Date(evento.fecha_apertura), "d MMM yyyy HH:mm", { locale: es })}
        </span>
        {evento.fecha_cierre && (
          <span className="flex items-center gap-1.5">
            <CheckCircle size={12} />
            {format(new Date(evento.fecha_cierre), "d MMM yyyy HH:mm", { locale: es })}
          </span>
        )}
      </div>
      {abierto && onCerrar && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn-ghost w-full text-sm py-2" style={{ color: '#facc15', borderColor: 'rgba(234,179,8,0.3)' }} onClick={onCerrar}>
            Cerrar evento
          </button>
        </div>
      )}
    </div>
  )
}
