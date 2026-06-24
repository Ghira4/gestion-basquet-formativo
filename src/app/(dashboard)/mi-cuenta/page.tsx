'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Save } from 'lucide-react'

export default function MiCuentaPage() {
  const [form, setForm] = useState({ nombre: '', apellido: '' })
  const [original, setOriginal] = useState({ nombre: '', apellido: '' })
  const [dni, setDni] = useState('')
  const [fechaNac, setFechaNac] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      if (data) {
        setForm({ nombre: data.nombre, apellido: data.apellido })
        setOriginal({ nombre: data.nombre, apellido: data.apellido })
        setDni(data.dni)
        setFechaNac(data.fecha_nac)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim()) { setError('Nombre y apellido son obligatorios.'); return }
    setSaving(true)
    setError('')
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('usuarios').update({ nombre: form.nombre.trim(), apellido: form.apellido.trim() }).eq('id', user!.id)

    if (error) { setError('Error al guardar los cambios.'); setSaving(false); return }
    setOriginal(form)
    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const cambios = form.nombre !== original.nombre || form.apellido !== original.apellido

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl" style={{ background: 'rgba(85,189,251,0.1)', color: 'var(--primary)' }}>
          <User size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mi cuenta</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Modificá tus datos personales</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-sm p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>DNI</p>
            <p className="font-bold text-white text-lg">{dni}</p>
          </div>
          <div className="glass-sm p-4">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Fecha de nacimiento</p>
            <p className="font-bold text-white">{fechaNac ? new Date(fechaNac + 'T00:00:00').toLocaleDateString('es-AR') : '—'}</p>
          </div>
        </div>

        <div className="divider" />

        <form onSubmit={guardar} className="flex flex-col gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre</label>
            <input className="input-glass" placeholder="Tu nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Apellido</label>
            <input className="input-glass" placeholder="Tu apellido" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required />
          </div>

          {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
          {success && (
            <div className="glass-sm p-3 text-sm text-center" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>
              Cambios guardados correctamente.
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-1" disabled={saving || !cambios}>
            {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
