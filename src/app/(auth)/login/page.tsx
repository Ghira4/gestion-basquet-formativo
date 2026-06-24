'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `${dni}@sccbasquet.internal`,
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
    <>
      <ThemeToggle />
      <div
        className="glass-card animate-fade-in"
        style={{ padding: '2.5rem 2.5rem' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 mb-5 drop-shadow-2xl">
            <Image src="/logo.png" alt="SCC Basquet Formativo" fill className="object-contain" priority />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Sport Club Cañadense
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--primary)' }}>
            Basquet Formativo
          </p>
        </div>

        <div className="divider mb-6" />

        <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>
          Iniciá sesión con tu DNI
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
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
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                className="input-glass pr-11"
                type={showPass ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" style={{ padding: '0.75rem' }} disabled={loading}>
            {loading
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <LogIn size={16} />
            }
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="divider my-6" />

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="font-bold transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </>
  )
}
