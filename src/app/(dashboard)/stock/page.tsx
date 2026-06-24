'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto, CategoriaProducto } from '@/types'
import { Package, Plus, X, Pencil, Search, AlertTriangle } from 'lucide-react'

const CATEGORIAS: CategoriaProducto[] = ['BEBIDAS', 'COMIDAS', 'GOLOSINAS', 'ESPECIAL']

const CATEGORIA_COLOR: Record<CategoriaProducto, string> = {
  BEBIDAS: 'badge-blue',
  COMIDAS: 'badge-green',
  GOLOSINAS: 'badge-yellow',
  ESPECIAL: 'badge-red',
}

const EMPTY_FORM = { nombre: '', categoria: 'BEBIDAS' as CategoriaProducto, precio_venta: '', costo_compra: '', stock: '' }

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaProducto | 'TODAS'>('TODAS')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function fetchProductos() {
    const { data } = await supabase.from('productos').select('*').order('nombre')
    setProductos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProductos() }, [])

  function abrirCrear() {
    setEditando(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function abrirEditar(p: Producto) {
    setEditando(p)
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      precio_venta: String(p.precio_venta),
      costo_compra: String(p.costo_compra),
      stock: String(p.stock),
    })
    setError('')
    setShowModal(true)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      nombre: form.nombre,
      categoria: form.categoria,
      precio_venta: parseFloat(form.precio_venta),
      costo_compra: parseFloat(form.costo_compra),
      stock: parseInt(form.stock),
    }

    if (editando) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editando.id)
      if (error) { setError('Error al actualizar.'); setSaving(false); return }
    } else {
      const { error } = await supabase.from('productos').insert({ ...payload, activo: true })
      if (error) { setError('Error al crear el producto.'); setSaving(false); return }
    }

    setShowModal(false)
    setSaving(false)
    fetchProductos()
  }

  async function toggleActivo(p: Producto) {
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    fetchProductos()
  }

  const filtrados = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCat = filtroCategoria === 'TODAS' || p.categoria === filtroCategoria
    return matchSearch && matchCat
  })

  const porCategoria = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = filtrados.filter(p => p.categoria === cat)
    return acc
  }, {} as Record<CategoriaProducto, Producto[]>)

  const totalProductos = productos.length
  const stockBajo = productos.filter(p => p.stock <= 3 && p.activo).length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
            {stockBajo > 0 && <span className="ml-2" style={{ color: '#facc15' }}>· {stockBajo} con stock bajo</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Alerta stock bajo */}
      {stockBajo > 0 && (
        <div className="glass-sm p-3 mb-5 flex items-center gap-2.5" style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.08)' }}>
          <AlertTriangle size={16} style={{ color: '#facc15', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: '#facc15' }}>
            {stockBajo} producto{stockBajo !== 1 ? 's' : ''} con 3 unidades o menos en stock.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-glass pl-9" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['TODAS', ...CATEGORIAS] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filtroCategoria === cat ? 'var(--primary)' : 'rgba(85,189,251,0.08)',
                color: filtroCategoria === cat ? 'var(--dark)' : 'var(--text-muted)',
                border: `1px solid ${filtroCategoria === cat ? 'var(--primary)' : 'var(--glass-border)'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--primary)' }} />
          <p className="font-medium text-white">Sin productos</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No hay resultados para tu búsqueda.' : 'Agregá productos para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORIAS.map(cat => {
            const items = porCategoria[cat]
            if (filtroCategoria !== 'TODAS' && filtroCategoria !== cat) return null
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{cat}</h2>
                <div className="glass-card">
                  <div className="table-wrapper">
                  <table className="table-glass">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock</th>
                        <th>Precio venta</th>
                        <th>Costo compra</th>
                        <th>Ganancia</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(p => {
                        const ganancia = p.precio_venta - p.costo_compra
                        const pct = p.costo_compra > 0 ? ((ganancia / p.costo_compra) * 100).toFixed(0) : '—'
                        return (
                          <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                            <td className="font-medium text-white">{p.nombre}</td>
                            <td>
                              <span className={`badge ${p.stock <= 3 ? 'badge-yellow' : 'badge-green'}`}>
                                {p.stock} u.
                              </span>
                            </td>
                            <td className="font-semibold" style={{ color: 'var(--primary)' }}>${p.precio_venta.toFixed(2)}</td>
                            <td style={{ color: 'var(--text-muted)' }}>${p.costo_compra.toFixed(2)}</td>
                            <td>
                              <span style={{ color: ganancia >= 0 ? '#4ade80' : '#f87171' }}>
                                ${ganancia.toFixed(2)} <span className="text-xs opacity-70">({pct}%)</span>
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => toggleActivo(p)}
                                className={`badge cursor-pointer transition-all ${p.activo ? 'badge-green' : 'badge-red'}`}
                              >
                                {p.activo ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td>
                              <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
                                <Pencil size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">{editando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <form onSubmit={guardar} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre *</label>
                <input className="input-glass" placeholder="Ej: Coca Cola 500ml" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoría *</label>
                <select className="select-glass" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaProducto }))}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Precio de venta *</label>
                  <input className="input-glass" type="number" step="0.01" min="0" placeholder="0.00" value={form.precio_venta} onChange={e => setForm(f => ({ ...f, precio_venta: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Costo de compra *</label>
                  <input className="input-glass" type="number" step="0.01" min="0" placeholder="0.00" value={form.costo_compra} onChange={e => setForm(f => ({ ...f, costo_compra: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Stock inicial *</label>
                <input className="input-glass" type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
              </div>

              {/* Preview ganancia */}
              {form.precio_venta && form.costo_compra && (
                <div className="glass-sm p-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ganancia por unidad</span>
                  <span className="text-sm font-bold" style={{ color: '#4ade80' }}>
                    ${(parseFloat(form.precio_venta || '0') - parseFloat(form.costo_compra || '0')).toFixed(2)}
                  </span>
                </div>
              )}

              {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
                  {editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
