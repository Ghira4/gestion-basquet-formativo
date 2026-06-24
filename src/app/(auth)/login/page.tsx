'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const emailAuth = `${dni}@sccbasquet.internal`

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailAuth,
      password,
    })

    if (authError) {
      setError('DNI o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="glass-card p-8 animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4 drop-shadow-2xl">
          <Image src="/logo.png" alt="SCC Basquet Formativo" fill className="object-contain" priority />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Sport Club Cañadense</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--primary)' }}>Basquet Formativo</p>
      </div>

      {/* Divider */}
      <div className="divider" />

      <h2 className="text-lg font-semibold text-center mb-6" style={{ color: 'var(--text)' }}>
        Iniciar sesión
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            DNI
          </label>
          <input
            className="input-glass"
            type="text"
            inputMode="numeric"
            placeholder="Ej: 40123456"
            value={dni}
            onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
            required
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Contraseña
          </label>
          <div className="relative">
            <input
              className="input-glass pr-10"
              type={showPass ? 'text' : 'password'}
              placeholder="Tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Recordarme */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setRemember(!remember)}
            className="w-4 h-4 rounded flex items-center justify-center transition-all"
            style={{
              background: remember ? 'var(--primary)' : 'transparent',
              border: `1.5px solid ${remember ? 'var(--primary)' : 'var(--glass-border)'}`,
            }}
          >
            {remember && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#0c2337" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Recordarme</span>
        </label>

        {error && (
          <div className="glass-sm p-3 text-sm text-center" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="divider mt-6" />

      <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="font-semibold transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
          Registrarse
        </Link>
      </p>
    </div>
  )
}
