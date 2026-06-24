'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    dni: '', nombre: '', apellido: '', fecha_nac: '', password: '', confirmar: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }

    setLoading(true)
    const supabase = createClient()
    const emailAuth = `${form.dni}@sccbasquet.internal`

    const { data: authData, error: authError } = await supabase.auth.signUp({ email: emailAuth, password: form.password })

    if (authError) {
      setError(
        authError.message.includes('already registered') || authError.message.includes('already been registered')
          ? 'Ya existe una cuenta con ese DNI.'
          : 'Error al crear la cuenta. Intentá de nuevo.'
      )
      setLoading(false)
      return
    }

    if (!authData.user) { setError('Error al crear la cuenta. Intentá de nuevo.'); setLoading(false); return }

    const { error: insertError } = await supabase.from('usuarios').insert({
      id: authData.user.id,
      dni: form.dni,
      nombre: form.nombre,
      apellido: form.apellido,
      fecha_nac: form.fecha_nac,
      email_auth: emailAuth,
    })

    if (insertError) { setError('Error al guardar los datos. Intentá de nuevo.'); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <>
      <ThemeToggle />
      <div className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 mb-4 drop-shadow-xl">
            <Image src="/logo.png" alt="SCC" fill className="object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Crear cuenta</h1>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--primary)' }}>
            Basquet Formativo — SCC
          </p>
        </div>

        <div className="divider mb-5" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Nombre</label>
              <input className="input-glass" placeholder="Juan" value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Apellido</label>
              <input className="input-glass" placeholder="García" value={form.apellido} onChange={e => update('apellido', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>DNI</label>
            <input
              className="input-glass"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 40123456"
              value={form.dni}
              onChange={e => update('dni', e.target.value.replace(/\D/g, ''))}
              required
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              Fecha de nacimiento
            </label>
            <input className="input-glass" type="date" value={form.fecha_nac} onChange={e => update('fecha_nac', e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Contraseña</label>
            <div className="relative">
              <input
                className="input-glass pr-11"
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Repetir contraseña</label>
            <input
              className="input-glass"
              type={showPass ? 'text' : 'password'}
              placeholder="Repetí tu contraseña"
              value={form.confirmar}
              onChange={e => update('confirmar', e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-1" style={{ padding: '0.75rem' }} disabled={loading}>
            {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="divider my-5" />

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-bold hover:opacity-80 transition-colors" style={{ color: 'var(--primary)' }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </>
  )
}
