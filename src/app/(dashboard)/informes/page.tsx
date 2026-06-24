'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Evento } from '@/types'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { BarChart3, Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#55bdfb', '#4ade80', '#facc15', '#f87171', '#c084fc', '#fb923c']

type ModoFiltro = 'evento' | 'periodo' | 'total'

interface ResumenData {
  ventasBrutas: number
  ventasCanceladas: number
  ventasNetas: number
  costoMercaderia: number
  gananciaVentas: number
  otrosIngresos: number
  gastos: number
  resultado: number
  cantidadVentas: number
  itemsVendidos: number
}

export default function InformesPage() {
  const [modo, setModo] = useState<ModoFiltro>('evento')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoId, setEventoId] = useState<string>('')
  const [fechaDesde, setFechaDesde] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [fechaHasta, setFechaHasta] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [resumen, setResumen] = useState<ResumenData | null>(null)
  const [ventasPorCategoria, setVentasPorCategoria] = useState<any[]>([])
  const [ventasPorHora, setVentasPorHora] = useState<any[]>([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState<any[]>([])
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any[]>([])
  const [topProductos, setTopProductos] = useState<any[]>([])
  const [rawData, setRawData] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.from('eventos').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setEventos(data || [])
        if (data && data.length > 0) setEventoId(data[0].id)
      })
  }, [])

  const calcular = useCallback(async () => {
    setLoading(true)

    let ventasQuery = supabase.from('ventas').select('*, venta_items(*, productos(nombre, categoria, costo_compra))')
    let gastosQuery = supabase.from('gastos').select('*')
    let ingresosQuery = supabase.from('ingresos').select('*')

    if (modo === 'evento' && eventoId) {
      ventasQuery = ventasQuery.eq('evento_id', eventoId)
      gastosQuery = gastosQuery.eq('evento_id', eventoId)
      ingresosQuery = ingresosQuery.eq('evento_id', eventoId)
    } else if (modo === 'periodo') {
      ventasQuery = ventasQuery.gte('created_at', fechaDesde + 'T00:00:00').lte('created_at', fechaHasta + 'T23:59:59')
      gastosQuery = gastosQuery.gte('fecha', fechaDesde).lte('fecha', fechaHasta)
      ingresosQuery = ingresosQuery.gte('fecha', fechaDesde).lte('fecha', fechaHasta)
    }

    const [{ data: ventas }, { data: gastos }, { data: ingresos }] = await Promise.all([
      ventasQuery, gastosQuery, ingresosQuery,
    ])

    const ventasOk = (ventas || []).filter((v: any) => !v.cancelada)
    const ventasCanceladas = (ventas || []).filter((v: any) => v.cancelada)

    const ventasBrutas = ventasOk.reduce((a: number, v: any) => a + v.total, 0)
    const costoMercaderia = ventasOk.reduce((a: number, v: any) =>
      a + (v.venta_items || []).reduce((b: number, i: any) => b + i.costo_unitario * i.cantidad, 0), 0)
    const gananciaVentas = ventasBrutas - costoMercaderia
    const otrosIngresos = (ingresos || []).reduce((a: number, i: any) => a + i.monto, 0)
    const totalGastos = (gastos || []).reduce((a: number, g: any) => a + g.monto, 0)
    const resultado = gananciaVentas + otrosIngresos - totalGastos
    const itemsVendidos = ventasOk.reduce((a: number, v: any) =>
      a + (v.venta_items || []).reduce((b: number, i: any) => b + i.cantidad, 0), 0)

    setResumen({
      ventasBrutas,
      ventasCanceladas: ventasCanceladas.reduce((a: number, v: any) => a + v.total, 0),
      ventasNetas: ventasBrutas,
      costoMercaderia,
      gananciaVentas,
      otrosIngresos,
      gastos: totalGastos,
      resultado,
      cantidadVentas: ventasOk.length,
      itemsVendidos,
    })

    // Ventas por categoría de producto
    const catMap: Record<string, number> = {}
    ventasOk.forEach((v: any) => {
      ;(v.venta_items || []).forEach((item: any) => {
        const cat = item.productos?.categoria || 'OTRO'
        catMap[cat] = (catMap[cat] || 0) + item.precio_unitario * item.cantidad
      })
    })
    setVentasPorCategoria(Object.entries(catMap).map(([name, value]) => ({ name, value: +value.toFixed(2) })))

    // Ventas por hora
    const horaMap: Record<number, number> = {}
    ventasOk.forEach((v: any) => {
      const hora = new Date(v.created_at).getHours()
      horaMap[hora] = (horaMap[hora] || 0) + v.total
    })
    setVentasPorHora(
      Array.from({ length: 24 }, (_, h) => ({ hora: `${h}:00`, ventas: +(horaMap[h] || 0).toFixed(2) }))
        .filter(h => h.ventas > 0)
    )

    // Ingresos por categoría
    const ingMap: Record<string, number> = {}
    ;(ingresos || []).forEach((i: any) => { ingMap[i.categoria] = (ingMap[i.categoria] || 0) + i.monto })
    setIngresosPorCategoria(Object.entries(ingMap).map(([name, value]) => ({ name, value: +value.toFixed(2) })))

    // Gastos por categoría
    const gasMap: Record<string, number> = {}
    ;(gastos || []).forEach((g: any) => { gasMap[g.categoria] = (gasMap[g.categoria] || 0) + g.monto })
    setGastosPorCategoria(Object.entries(gasMap).map(([name, value]) => ({ name, value: +value.toFixed(2) })))

    // Top productos
    const prodMap: Record<string, { nombre: string; cantidad: number; total: number }> = {}
    ventasOk.forEach((v: any) => {
      ;(v.venta_items || []).forEach((item: any) => {
        const nombre = item.productos?.nombre || 'Desconocido'
        if (!prodMap[nombre]) prodMap[nombre] = { nombre, cantidad: 0, total: 0 }
        prodMap[nombre].cantidad += item.cantidad
        prodMap[nombre].total += item.precio_unitario * item.cantidad
      })
    })
    setTopProductos(
      Object.values(prodMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(p => ({ ...p, total: +p.total.toFixed(2) }))
    )

    setRawData({ ventas: ventasOk, gastos: gastos || [], ingresos: ingresos || [] })
    setLoading(false)
  }, [modo, eventoId, fechaDesde, fechaHasta])

  function exportarExcel() {
    if (!rawData || !resumen) return
    const wb = XLSX.utils.book_new()

    // Hoja resumen
    const resumenData = [
      ['Concepto', 'Monto'],
      ['Ventas brutas', resumen.ventasBrutas],
      ['Costo de mercadería', -resumen.costoMercaderia],
      ['Ganancia en ventas', resumen.gananciaVentas],
      ['Otros ingresos', resumen.otrosIngresos],
      ['Gastos', -resumen.gastos],
      ['RESULTADO FINAL', resumen.resultado],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), 'Resumen')

    // Hoja ventas por producto
    if (topProductos.length) {
      const prodData = [['Producto', 'Cantidad vendida', 'Total recaudado'], ...topProductos.map(p => [p.nombre, p.cantidad, p.total])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodData), 'Productos')
    }

    // Hoja gastos
    if (rawData.gastos.length) {
      const gastosData = [['Fecha', 'Categoría', 'Descripción', 'Caja', 'Monto'], ...rawData.gastos.map((g: any) => [g.fecha, g.categoria, g.descripcion, g.caja, g.monto])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(gastosData), 'Gastos')
    }

    // Hoja ingresos
    if (rawData.ingresos.length) {
      const ingData = [['Fecha', 'Categoría', 'Descripción', 'Caja', 'Monto'], ...rawData.ingresos.map((i: any) => [i.fecha, i.categoria, i.descripcion, i.caja, i.monto])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ingData), 'Ingresos')
    }

    XLSX.writeFile(wb, `informe-scc-basquet-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  function exportarPDF() {
    if (!resumen) return
    const doc = new jsPDF()

    doc.setFillColor(12, 35, 55)
    doc.rect(0, 0, 210, 297, 'F')

    doc.setTextColor(85, 189, 251)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SCC Basquet Formativo', 14, 20)

    doc.setTextColor(122, 184, 217)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const titulo = modo === 'evento'
      ? `Informe de evento: ${eventos.find(e => e.id === eventoId)?.nombre || ''}`
      : modo === 'periodo'
      ? `Informe período: ${fechaDesde} al ${fechaHasta}`
      : 'Informe general'
    doc.text(titulo, 14, 30)
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM yyyy HH:mm", { locale: es })}`, 14, 38)

    autoTable(doc, {
      startY: 48,
      head: [['Concepto', 'Monto']],
      body: [
        ['Ventas brutas', `$${resumen.ventasBrutas.toFixed(2)}`],
        ['Costo de mercadería', `-$${resumen.costoMercaderia.toFixed(2)}`],
        ['Ganancia en ventas', `$${resumen.gananciaVentas.toFixed(2)}`],
        ['Otros ingresos', `$${resumen.otrosIngresos.toFixed(2)}`],
        ['Gastos totales', `-$${resumen.gastos.toFixed(2)}`],
        ['RESULTADO FINAL', `$${resumen.resultado.toFixed(2)}`],
      ],
      styles: { fillColor: [17, 45, 69], textColor: [232, 244, 255], lineColor: [28, 63, 99] },
      headStyles: { fillColor: [28, 63, 99], textColor: [85, 189, 251], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [22, 53, 84] },
      theme: 'grid',
    })

    if (topProductos.length) {
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setTextColor(85, 189, 251)
      doc.setFontSize(13)
      doc.text('Top productos', 14, finalY)

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Producto', 'Cantidad', 'Total']],
        body: topProductos.map(p => [p.nombre, p.cantidad, `$${p.total.toFixed(2)}`]),
        styles: { fillColor: [17, 45, 69], textColor: [232, 244, 255], lineColor: [28, 63, 99] },
        headStyles: { fillColor: [28, 63, 99], textColor: [85, 189, 251], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [22, 53, 84] },
        theme: 'grid',
      })
    }

    doc.save(`informe-scc-basquet-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-sm p-3 text-sm">
        <p className="font-semibold text-white mb-1">{label || payload[0].name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name !== 'value' ? p.name : ''} ${p.value?.toFixed(2)}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Informes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Balance, estadísticas y exportaciones</p>
        </div>
        {resumen && (
          <div className="flex gap-2">
            <button className="btn-ghost py-2 px-3 text-sm" onClick={exportarExcel}>
              <Download size={15} /> Excel
            </button>
            <button className="btn-ghost py-2 px-3 text-sm" onClick={exportarPDF}>
              <FileText size={15} /> PDF
            </button>
          </div>
        )}
      </div>

      {/* Selector de modo */}
      <div className="glass-card p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {([['evento', 'Por evento'], ['periodo', 'Por período'], ['total', 'General']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: modo === m ? 'var(--primary)' : 'rgba(85,189,251,0.08)',
                color: modo === m ? 'var(--dark)' : 'var(--text-muted)',
                border: `1px solid ${modo === m ? 'var(--primary)' : 'var(--glass-border)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {modo === 'evento' && (
          <select className="select-glass max-w-sm" value={eventoId} onChange={e => setEventoId(e.target.value)}>
            <option value="">Seleccioná un evento</option>
            {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre} — {ev.estado}</option>)}
          </select>
        )}

        {modo === 'periodo' && (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Desde</label>
              <input className="input-glass w-44" type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Hasta</label>
              <input className="input-glass w-44" type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            </div>
          </div>
        )}

        <button
          className="btn-primary mt-4"
          onClick={calcular}
          disabled={loading || (modo === 'evento' && !eventoId)}
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <BarChart3 size={16} />
          }
          {loading ? 'Calculando...' : 'Generar informe'}
        </button>
      </div>

      {/* Resultados */}
      {resumen && (
        <div className="animate-fade-in flex flex-col gap-6">
          {/* Stats principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<DollarSign size={20} />} label="Resultado final" value={`$${resumen.resultado.toFixed(2)}`} color={resumen.resultado >= 0 ? '#4ade80' : '#f87171'} />
            <StatCard icon={<ShoppingBag size={20} />} label="Ventas brutas" value={`$${resumen.ventasBrutas.toFixed(2)}`} color="var(--primary)" />
            <StatCard icon={<TrendingUp size={20} />} label="Otros ingresos" value={`$${resumen.otrosIngresos.toFixed(2)}`} color="#4ade80" />
            <StatCard icon={<TrendingDown size={20} />} label="Gastos totales" value={`$${resumen.gastos.toFixed(2)}`} color="#f87171" />
          </div>

          {/* Segunda fila stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-sm p-4 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Cantidad de ventas</p>
              <p className="text-2xl font-bold text-white">{resumen.cantidadVentas}</p>
            </div>
            <div className="glass-sm p-4 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Ítems vendidos</p>
              <p className="text-2xl font-bold text-white">{resumen.itemsVendidos}</p>
            </div>
            <div className="glass-sm p-4 text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Ganancia en ventas</p>
              <p className="text-2xl font-bold" style={{ color: '#4ade80' }}>${resumen.gananciaVentas.toFixed(2)}</p>
            </div>
          </div>

          {/* Balance visual */}
          <div className="glass-card p-5">
            <h2 className="font-bold text-white mb-4">Balance general</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Ventas brutas', value: resumen.ventasBrutas, color: 'var(--primary)', signo: '+' },
                { label: 'Costo de mercadería', value: resumen.costoMercaderia, color: '#f87171', signo: '-' },
                { label: 'Ganancia en ventas', value: resumen.gananciaVentas, color: resumen.gananciaVentas >= 0 ? '#4ade80' : '#f87171', signo: '=' },
                { label: 'Otros ingresos', value: resumen.otrosIngresos, color: '#4ade80', signo: '+' },
                { label: 'Gastos', value: resumen.gastos, color: '#f87171', signo: '-' },
              ].map(({ label, value, color, signo }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-4" style={{ color }}>{signo}</span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <span className="font-semibold" style={{ color }}>${value.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="font-bold text-white">RESULTADO FINAL</span>
                <span className="text-xl font-bold" style={{ color: resumen.resultado >= 0 ? '#4ade80' : '#f87171' }}>
                  ${resumen.resultado.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Torta: ventas por categoría */}
            {ventasPorCategoria.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Ventas por categoría</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={ventasPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(85,189,251,0.3)' }}>
                      {ventasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Torta: gastos por categoría */}
            {gastosPorCategoria.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Gastos por categoría</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={gastosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(239,68,68,0.3)' }}>
                      {gastosPorCategoria.map((_, i) => <Cell key={i} fill={['#f87171', '#fb923c', '#facc15', '#a78bfa'][i % 4]} />)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Ingresos por categoría */}
            {ingresosPorCategoria.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Otros ingresos por categoría</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ingresosPorCategoria} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(85,189,251,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#7ab8d9', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7ab8d9', fontSize: 11 }} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Bar dataKey="value" name="Ingreso" fill="#4ade80" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Ventas por hora */}
            {ventasPorHora.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">Ventas por hora del día</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ventasPorHora} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(85,189,251,0.1)" />
                    <XAxis dataKey="hora" tick={{ fill: '#7ab8d9', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7ab8d9', fontSize: 11 }} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Line type="monotone" dataKey="ventas" name="Ventas $" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top productos */}
          {topProductos.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-4">Top productos más vendidos</h3>
              <div className="glass-card overflow-hidden" style={{ background: 'transparent' }}>
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Producto</th>
                      <th>Unidades vendidas</th>
                      <th>Total recaudado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={p.nombre}>
                        <td className="font-bold" style={{ color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>{i + 1}</td>
                        <td className="font-medium text-white">{p.nombre}</td>
                        <td>{p.cantidad} u.</td>
                        <td className="font-bold" style={{ color: 'var(--primary)' }}>${p.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: `${color}18`, color }}>{icon}</div>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
