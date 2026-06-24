'use client'

import { useState } from 'react'
import {
  ShoppingCart, Package, Calendar, Wallet, TrendingDown, TrendingUp,
  BarChart3, User, Download, BookOpen, ChevronRight,
} from 'lucide-react'

/* ─── Ilustraciones SVG por módulo ─────────────────────────────── */

const IlustracionNav = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    {/* Sidebar */}
    <rect x="0" y="0" width="80" height="200" fill="#0e263c" rx="12"/>
    <rect x="80" y="0" width="1" height="200" fill="rgba(85,189,251,0.2)"/>
    {/* Logo */}
    <circle cx="24" cy="24" r="12" fill="rgba(85,189,251,0.2)"/>
    <text x="24" y="28" textAnchor="middle" fill="#55bdfb" fontSize="9" fontWeight="bold">SCC</text>
    <text x="50" y="20" fill="white" fontSize="7" fontWeight="bold">SCC</text>
    <text x="50" y="29" fill="#55bdfb" fontSize="6">Basquet</text>
    {/* Nav items */}
    {[
      ['Ventas',    45,  true],
      ['Stock',     63,  false],
      ['Eventos',   81,  false],
      ['Cajas',     99,  false],
      ['Gastos',    117, false],
      ['Ingresos',  135, false],
      ['Informes',  153, false],
    ].map(([label, y, active]) => (
      <g key={label as string}>
        <rect x="6" y={(y as number)-10} width="68" height="18" rx="6"
          fill={active ? 'rgba(85,189,251,0.15)' : 'transparent'}/>
        <rect x="6" y={(y as number)-10} width="2.5" height="18" rx="1"
          fill={active ? '#55bdfb' : 'transparent'}/>
        <rect x="14" y={(y as number)-3} width="8" height="8" rx="2"
          fill={active ? '#55bdfb' : 'rgba(122,184,217,0.5)'}/>
        <text x="27" y={(y as number)+4} fill={active ? '#55bdfb' : '#7ab8d9'} fontSize="7" fontWeight={active ? 'bold' : 'normal'}>{label as string}</text>
      </g>
    ))}
    {/* Footer */}
    <rect x="6" y="172" width="68" height="24" rx="6" fill="rgba(85,189,251,0.06)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
    <circle cx="18" cy="184" r="6" fill="rgba(85,189,251,0.2)"/>
    <text x="18" y="187" textAnchor="middle" fill="#55bdfb" fontSize="6" fontWeight="bold">SG</text>
    <text x="28" y="182" fill="white" fontSize="5.5" fontWeight="bold">Santiago G.</text>
    <text x="28" y="189" fill="#7ab8d9" fontSize="5">DNI 46219204</text>
    {/* Content area hint */}
    <text x="180" y="100" textAnchor="middle" fill="rgba(85,189,251,0.3)" fontSize="9">Contenido del módulo</text>
    {/* Arrow indicator */}
    <path d="M100 100 L120 100" stroke="#55bdfb" strokeWidth="1.5" markerEnd="url(#arrow)"/>
    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#55bdfb"/>
      </marker>
    </defs>
    <text x="130" y="104" fill="#55bdfb" fontSize="7">Tocá un módulo</text>
    <text x="130" y="114" fill="#7ab8d9" fontSize="6">para navegar</text>
  </svg>
)

const IlustracionVentas = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    {/* Productos grid */}
    <text x="12" y="18" fill="#7ab8d9" fontSize="7" fontWeight="bold">BEBIDAS</text>
    {[[12, 26, 'Coca Cola', '$1500', true], [72, 26, 'Agua', '$800', false], [132, 26, 'Fanta', '$1200', false],
      [12, 90, 'Sprite', '$1200', false], [72, 90, 'Jugo', '$900', false], [132, 90, 'Gatorade', '$1400', false]].map(([x, y, name, price, sel]) => (
      <g key={name as string}>
        <rect x={x as number} y={y as number} width="54" height="54" rx="8"
          fill="rgba(22,53,84,0.8)"
          stroke={sel ? '#55bdfb' : 'rgba(85,189,251,0.2)'} strokeWidth={sel ? '1.5' : '0.5'}/>
        {sel && <rect x={x as number} y={y as number} width="54" height="4" rx="2" fill="rgba(85,189,251,0.3)"/>}
        <text x={(x as number)+27} y={(y as number)+22} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">{name as string}</text>
        <text x={(x as number)+27} y={(y as number)+35} textAnchor="middle" fill="#55bdfb" fontSize="9" fontWeight="bold">{price as string}</text>
        <text x={(x as number)+27} y={(y as number)+46} textAnchor="middle" fill="#7ab8d9" fontSize="6">12 disp.</text>
      </g>
    ))}
    {/* Carrito */}
    <rect x="196" y="8" width="116" height="184" rx="10" fill="rgba(22,53,84,0.9)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.8"/>
    <text x="204" y="24" fill="white" fontSize="8" fontWeight="bold">🛒 Carrito</text>
    <rect x="204" y="30" width="100" height="0.5" fill="rgba(85,189,251,0.2)"/>
    {/* Cart items */}
    {[['Coca Cola 1.5l', '×2', '$3000'], ['Agua 500ml', '×1', '$800']].map(([n, q, p], i) => (
      <g key={n}>
        <rect x="204" y={38 + i*28} width="100" height="24" rx="6" fill="rgba(12,35,55,0.6)"/>
        <text x="210" y={52 + i*28} fill="white" fontSize="6.5" fontWeight="bold">{n}</text>
        <text x="210" y={60 + i*28} fill="#7ab8d9" fontSize="6">{q}</text>
        <text x="295" y={56 + i*28} fill="#55bdfb" fontSize="7" fontWeight="bold" textAnchor="end">{p}</text>
      </g>
    ))}
    <rect x="204" y="96" width="100" height="0.5" fill="rgba(85,189,251,0.2)"/>
    <text x="204" y="108" fill="#7ab8d9" fontSize="7">Total</text>
    <text x="304" y="108" fill="white" fontSize="10" fontWeight="bold" textAnchor="end">$3800</text>
    {/* Cobrar btn */}
    <rect x="204" y="116" width="100" height="22" rx="8" fill="linear-gradient(#55bdfb,#2a9de8)"/>
    <rect x="204" y="116" width="100" height="22" rx="8" fill="#55bdfb"/>
    <text x="254" y="131" textAnchor="middle" fill="#0c2337" fontSize="9" fontWeight="bold">💳 Cobrar</text>
    {/* Quick btns */}
    <rect x="204" y="144" width="46" height="16" rx="5" fill="rgba(85,189,251,0.1)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.5"/>
    <text x="227" y="155" textAnchor="middle" fill="#55bdfb" fontSize="6">Todo efectivo</text>
    <rect x="256" y="144" width="48" height="16" rx="5" fill="rgba(85,189,251,0.1)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.5"/>
    <text x="280" y="155" textAnchor="middle" fill="#55bdfb" fontSize="6">Todo transf.</text>
  </svg>
)

const IlustracionStock = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Stock de productos</text>
    <rect x="268" y="6" width="44" height="18" rx="6" fill="#55bdfb"/>
    <text x="290" y="18" textAnchor="middle" fill="#0c2337" fontSize="7" fontWeight="bold">+ Nuevo</text>
    {/* Table header */}
    <rect x="8" y="26" width="304" height="16" rx="4" fill="rgba(22,53,84,0.8)"/>
    {['Producto','Stock','P. Venta','Costo','Ganancia','Estado'].map((h, i) => (
      <text key={h} x={[16,100,140,180,220,268][i]} y="37" fill="#7ab8d9" fontSize="6" fontWeight="bold">{h}</text>
    ))}
    {/* Table rows */}
    {[
      ['Coca Cola 1.5l', '12 u.', '$1500', '$900', '+$600 (66%)', 'Activo', '#4ade80'],
      ['Agua 500ml',     '3 u.',  '$800',  '$400', '+$400 (100%)','⚠ Stock bajo','#facc15'],
      ['Fanta 1.5l',     '8 u.',  '$1200', '$700', '+$500 (71%)', 'Activo', '#4ade80'],
      ['Gatorade',       '0 u.',  '$1400', '$900', '+$500 (55%)', 'Inactivo','#f87171'],
    ].map(([n,s,pv,c,g,est,col], i) => (
      <g key={n}>
        <rect x="8" y={44+i*34} width="304" height="30" rx="4" fill={i%2===0?"rgba(22,53,84,0.4)":"transparent"}/>
        <text x="16" y={63+i*34} fill="white" fontSize="7" fontWeight="bold">{n}</text>
        <text x="100" y={63+i*34} fill="#7ab8d9" fontSize="7">{s}</text>
        <text x="140" y={63+i*34} fill="#55bdfb" fontSize="7">{pv}</text>
        <text x="180" y={63+i*34} fill="#7ab8d9" fontSize="7">{c}</text>
        <text x="220" y={63+i*34} fill="#4ade80" fontSize="6.5">{g}</text>
        <rect x="264" y={52+i*34} width="40" height="14" rx="4" fill={`${col}22`} stroke={`${col}55`} strokeWidth="0.5"/>
        <text x="284" y={62+i*34} textAnchor="middle" fill={col as string} fontSize="6">{est}</text>
      </g>
    ))}
  </svg>
)

const IlustracionEventos = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Eventos</text>
    <rect x="254" y="6" width="58" height="18" rx="6" fill="#55bdfb"/>
    <text x="283" y="18" textAnchor="middle" fill="#0c2337" fontSize="7" fontWeight="bold">+ Nuevo evento</text>
    {/* En curso */}
    <text x="12" y="36" fill="#7ab8d9" fontSize="6.5" fontWeight="bold">EN CURSO</text>
    {[['Fecha 16 Masculino','Hoy, 17:00','Abierto'],['Torneo Sub-14','Hoy, 15:00','Abierto']].map(([n,f,e],i) => (
      <g key={n}>
        <rect x="8" y={40+i*46} width="145" height="40" rx="8" fill="rgba(22,53,84,0.8)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.8"/>
        <rect x="8" y={40+i*46} width="4" height="40" rx="2" fill="#55bdfb"/>
        <rect x="118" y={47+i*46} width="30" height="12" rx="4" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.3)" strokeWidth="0.5"/>
        <text x="133" y={56+i*46} textAnchor="middle" fill="#4ade80" fontSize="6">{e}</text>
        <text x="18" y={56+i*46} fill="white" fontSize="8" fontWeight="bold">{n}</text>
        <text x="18" y={68+i*46} fill="#7ab8d9" fontSize="6">{f}</text>
        <rect x="60" y={72+i*46} width="52" height="5" rx="2" fill="rgba(85,189,251,0.1)"/>
        <text x="86" y={76+i*46} textAnchor="middle" fill="#55bdfb" fontSize="5">Cerrar evento</text>
      </g>
    ))}
    {/* Finalizados */}
    <text x="168" y="36" fill="#7ab8d9" fontSize="6.5" fontWeight="bold">FINALIZADOS</text>
    {[['Fecha 15 Masculino','Ayer'],['Torneo Sub-16','20/06']].map(([n,f],i) => (
      <g key={n}>
        <rect x="164" y={40+i*46} width="148" height="40" rx="8" fill="rgba(22,53,84,0.5)" stroke="rgba(85,189,251,0.15)" strokeWidth="0.5"/>
        <rect x="188" y={47+i*46} width="36" height="12" rx="4" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.2)" strokeWidth="0.5"/>
        <text x="206" y={56+i*46} textAnchor="middle" fill="#f87171" fontSize="6">Cerrado</text>
        <text x="172" y={56+i*46} fill="rgba(255,255,255,0.7)" fontSize="7.5" fontWeight="bold">{n}</text>
        <text x="172" y={68+i*46} fill="#7ab8d9" fontSize="6">{f}</text>
      </g>
    ))}
  </svg>
)

const IlustracionCajas = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Cajas</text>
    <text x="12" y="29" fill="#7ab8d9" fontSize="7">Total general: $52.500</text>
    <rect x="240" y="6" width="72" height="18" rx="6" fill="#55bdfb"/>
    <text x="276" y="18" textAnchor="middle" fill="#0c2337" fontSize="7" fontWeight="bold">⇄ Mover fondos</text>
    {/* 3 cajas */}
    {[
      ['EFECTIVO','$24.500','#4ade80', 12],
      ['TRANSFERENCIA','$18.000','#55bdfb', 114],
      ['CLUB','$10.000','#c084fc', 216],
    ].map(([label, val, color, x]) => (
      <g key={label as string}>
        <rect x={x as number} y="38" width="88" height="70" rx="10" fill="rgba(22,53,84,0.8)" stroke="rgba(85,189,251,0.25)" strokeWidth="0.8"/>
        <rect x={(x as number)+8} y="50" width="22" height="22" rx="6" fill={`${color}22`}/>
        <text x={(x as number)+19} y="65" textAnchor="middle" fill={color as string} fontSize="12">
          {label === 'EFECTIVO' ? '💵' : label === 'TRANSFERENCIA' ? '💳' : '🏛'}
        </text>
        <text x={(x as number)+44} y="58" fill="#7ab8d9" fontSize="6" fontWeight="bold">{label as string}</text>
        <text x={(x as number)+8} y="82" fill="white" fontSize="13" fontWeight="bold">{val as string}</text>
        <text x={(x as number)+8} y="97" fill="#7ab8d9" fontSize="6">Disponible</text>
      </g>
    ))}
    {/* Modal mover */}
    <rect x="60" y="118" width="200" height="70" rx="10" fill="rgba(14,38,60,0.97)" stroke="rgba(85,189,251,0.4)" strokeWidth="1"/>
    <text x="160" y="133" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Mover fondos</text>
    <rect x="72" y="140" width="78" height="16" rx="5" fill="rgba(12,35,55,0.8)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.5"/>
    <text x="111" y="151" textAnchor="middle" fill="#7ab8d9" fontSize="6">Desde: EFECTIVO</text>
    <text x="160" y="152" fill="#7ab8d9" fontSize="10">→</text>
    <rect x="168" y="140" width="80" height="16" rx="5" fill="rgba(12,35,55,0.8)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.5"/>
    <text x="208" y="151" textAnchor="middle" fill="#7ab8d9" fontSize="6">Hacia: CLUB</text>
    <rect x="72" y="162" width="100" height="14" rx="5" fill="rgba(12,35,55,0.8)" stroke="rgba(85,189,251,0.3)" strokeWidth="0.5"/>
    <text x="110" y="172" textAnchor="middle" fill="#7ab8d9" fontSize="6">Monto: $5.000</text>
    <rect x="180" y="162" width="60" height="14" rx="5" fill="rgba(85,189,251,0.2)" stroke="rgba(85,189,251,0.4)" strokeWidth="0.5"/>
    <text x="210" y="172" textAnchor="middle" fill="#55bdfb" fontSize="6" fontWeight="bold">Mover todo</text>
  </svg>
)

const IlustracionGastos = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Gastos</text>
    {/* Tabs */}
    <rect x="8" y="24" width="152" height="24" rx="8" fill="rgba(85,189,251,0.06)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
    <rect x="12" y="27" width="68" height="18" rx="6" fill="#55bdfb"/>
    <text x="46" y="39" textAnchor="middle" fill="#0c2337" fontSize="7" fontWeight="bold">Buffet (mercadería)</text>
    <text x="116" y="39" textAnchor="middle" fill="#7ab8d9" fontSize="7">Otros gastos</text>
    {/* Stat cards */}
    {[['Costo total mercadería','$3.000','#f87171',8],['Total vendido','$10.500','#55bdfb',112],['Ganancia','$7.500','#4ade80',216]].map(([l,v,c,x]) => (
      <g key={l as string}>
        <rect x={x as number} y="56" width="96" height="42" rx="8" fill="rgba(22,53,84,0.8)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
        <text x={(x as number)+8} y="70" fill="#7ab8d9" fontSize="6">{l as string}</text>
        <text x={(x as number)+8} y="88" fill={c as string} fontSize="11" fontWeight="bold">{v as string}</text>
      </g>
    ))}
    {/* Table */}
    <rect x="8" y="106" width="304" height="14" rx="4" fill="rgba(22,53,84,0.6)"/>
    {['PRODUCTO','CATEGORÍA','UNID.','COSTO','INGRESO','GANANCIA'].map((h,i) => (
      <text key={h} x={[16,84,144,178,224,272][i]} y="117" fill="#7ab8d9" fontSize="5.5" fontWeight="bold">{h}</text>
    ))}
    {[['Coca Cola 1.5l','BEBIDAS','3 u.','-$3000','+$10500','$7500'],['Fanta 1.5l','BEBIDAS','2 u.','-$1400','+$2400','$1000']].map(([n,c,u,co,i,g],idx) => (
      <g key={n}>
        <rect x="8" y={122+idx*22} width="304" height="18" rx="3" fill={idx%2===0?"rgba(22,53,84,0.3)":"transparent"}/>
        <text x="16" y={134+idx*22} fill="white" fontSize="6.5" fontWeight="bold">{n}</text>
        <text x="84" y={134+idx*22} fill="#55bdfb" fontSize="6">{c}</text>
        <text x="144" y={134+idx*22} fill="#7ab8d9" fontSize="6.5">{u}</text>
        <text x="178" y={134+idx*22} fill="#f87171" fontSize="6.5">{co}</text>
        <text x="224" y={134+idx*22} fill="#55bdfb" fontSize="6.5">{i}</text>
        <text x="272" y={134+idx*22} fill="#4ade80" fontSize="6.5" fontWeight="bold">{g}</text>
      </g>
    ))}
  </svg>
)

const IlustracionIngresos = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Ingresos</text>
    {/* Tabs */}
    <rect x="8" y="24" width="120" height="24" rx="8" fill="rgba(85,189,251,0.06)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
    <rect x="12" y="27" width="52" height="18" rx="6" fill="#55bdfb"/>
    <text x="38" y="39" textAnchor="middle" fill="#0c2337" fontSize="7" fontWeight="bold">Buffet</text>
    <text x="96" y="39" textAnchor="middle" fill="#7ab8d9" fontSize="7">Otros ingresos</text>
    {/* Stat cards */}
    {[['Total recaudado','$10.500','#4ade80',8],['Efectivo','$7.500','white',112],['Transferencia','$3.000','#55bdfb',216]].map(([l,v,c,x]) => (
      <g key={l as string}>
        <rect x={x as number} y="56" width="96" height="42" rx="8" fill="rgba(22,53,84,0.8)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
        <text x={(x as number)+8} y="70" fill="#7ab8d9" fontSize="6">{l as string}</text>
        <text x={(x as number)+8} y="88" fill={c as string} fontSize="11" fontWeight="bold">{v as string}</text>
      </g>
    ))}
    {/* Table */}
    <rect x="8" y="106" width="304" height="14" rx="4" fill="rgba(22,53,84,0.6)"/>
    {['FECHA Y HORA','EVENTO','ITEMS','EFECTIVO','TRANSF.','TOTAL'].map((h,i) => (
      <text key={h} x={[16,76,152,208,250,288][i]} y="117" fill="#7ab8d9" fontSize="5.5" fontWeight="bold">{h}</text>
    ))}
    {[['24 jun 17:49','Fecha 16 Masc.','3× Coca Cola','$7.500','$3.000','+$10.500'],
      ['24 jun 16:10','Fecha 16 Masc.','1× Agua','$800','$0','+$800']].map(([f,e,it,ef,tr,tot],idx) => (
      <g key={f}>
        <rect x="8" y={122+idx*22} width="304" height="18" rx="3" fill={idx%2===0?"rgba(22,53,84,0.3)":"transparent"}/>
        <text x="16" y={134+idx*22} fill="#7ab8d9" fontSize="6">{f}</text>
        <text x="76" y={134+idx*22} fill="#7ab8d9" fontSize="6">{e}</text>
        <text x="152" y={134+idx*22} fill="white" fontSize="6">{it}</text>
        <text x="208" y={134+idx*22} fill="#7ab8d9" fontSize="6">{ef}</text>
        <text x="250" y={134+idx*22} fill="#7ab8d9" fontSize="6">{tr}</text>
        <text x="288" y={134+idx*22} fill="#4ade80" fontSize="6.5" fontWeight="bold">{tot}</text>
      </g>
    ))}
  </svg>
)

const IlustracionInformes = () => (
  <svg viewBox="0 0 320 200" className="w-full" style={{ borderRadius: 12, maxHeight: 200 }}>
    <rect width="320" height="200" fill="#0c2337" rx="12"/>
    <text x="12" y="18" fill="white" fontSize="9" fontWeight="bold">Informes</text>
    {/* Stat cards */}
    {[['Resultado','$7.500','#4ade80',8],['Ventas Buffet','$10.500','#55bdfb',88],['Gastos','$3.000','#f87171',168],['Cant. Ventas','5','white',248]].map(([l,v,c,x]) => (
      <g key={l as string}>
        <rect x={x as number} y="24" width="72" height="36" rx="8" fill="rgba(22,53,84,0.8)" stroke="rgba(85,189,251,0.2)" strokeWidth="0.5"/>
        <text x={(x as number)+6} y="36" fill="#7ab8d9" fontSize="5.5">{l as string}</text>
        <text x={(x as number)+6} y="51" fill={c as string} fontSize="10" fontWeight="bold">{v as string}</text>
      </g>
    ))}
    {/* Bar chart */}
    <rect x="8" y="68" width="148" height="90" rx="8" fill="rgba(22,53,84,0.6)" stroke="rgba(85,189,251,0.15)" strokeWidth="0.5"/>
    <text x="16" y="80" fill="#7ab8d9" fontSize="6" fontWeight="bold">Ingresos vs Gastos</text>
    {[['Ene',40,20],['Feb',55,30],['Mar',70,25],['Abr',50,35],['May',85,40]].map(([m,iv,gv],i) => (
      <g key={m}>
        <rect x={20+i*26} y={145-(iv as number)} width="10" height={iv as number} rx="2" fill="rgba(85,189,251,0.7)"/>
        <rect x={32+i*26} y={145-(gv as number)} width="10" height={gv as number} rx="2" fill="rgba(248,113,113,0.7)"/>
        <text x={27+i*26} y="153" textAnchor="middle" fill="#7ab8d9" fontSize="5">{m as string}</text>
      </g>
    ))}
    {/* Pie chart */}
    <rect x="164" y="68" width="148" height="90" rx="8" fill="rgba(22,53,84,0.6)" stroke="rgba(85,189,251,0.15)" strokeWidth="0.5"/>
    <text x="172" y="80" fill="#7ab8d9" fontSize="6" fontWeight="bold">Ventas por categoría</text>
    <circle cx="218" cy="118" r="30" fill="none" stroke="#55bdfb" strokeWidth="18" strokeDasharray="75 113" strokeDashoffset="0"/>
    <circle cx="218" cy="118" r="30" fill="none" stroke="#4ade80" strokeWidth="18" strokeDasharray="45 143" strokeDashoffset="-75"/>
    <circle cx="218" cy="118" r="30" fill="none" stroke="#f87171" strokeWidth="18" strokeDasharray="30 158" strokeDashoffset="-120"/>
    <circle cx="218" cy="118" r="14" fill="#0c2337"/>
    {[['Bebidas','#55bdfb',254],['Alimentos','#4ade80',254],['Otros','#f87171',254]].map(([l,c,x],i) => (
      <g key={l as string}>
        <rect x={x as number} y={90+i*14} width="7" height="7" rx="2" fill={c as string}/>
        <text x={264} y={98+i*14} fill="#7ab8d9" fontSize="6">{l as string}</text>
      </g>
    ))}
    {/* Export buttons */}
    <rect x="8" y="164" width="60" height="20" rx="6" fill="rgba(85,189,251,0.15)" stroke="rgba(85,189,251,0.4)" strokeWidth="0.8"/>
    <text x="38" y="177" textAnchor="middle" fill="#55bdfb" fontSize="7" fontWeight="bold">📊 Excel</text>
    <rect x="76" y="164" width="60" height="20" rx="6" fill="rgba(85,189,251,0.15)" stroke="rgba(85,189,251,0.4)" strokeWidth="0.8"/>
    <text x="106" y="177" textAnchor="middle" fill="#55bdfb" fontSize="7" fontWeight="bold">📄 PDF</text>
  </svg>
)

/* ─── Contenido del manual ──────────────────────────────────────── */

const MODULOS = [
  {
    id: 'nav',
    icon: BookOpen,
    color: '#55bdfb',
    titulo: 'Cómo navegar el sistema',
    resumen: 'Usá el menú lateral para ir a cualquier sección.',
    ilustracion: <IlustracionNav />,
    pasos: [
      { n: '1', texto: 'El menú lateral (sidebar) es tu punto de navegación principal. Tocá cualquier ítem para ir a ese módulo.' },
      { n: '2', texto: 'Podés contraer el menú tocando la flecha (‹) del encabezado para tener más espacio de trabajo.' },
      { n: '3', texto: 'En la parte inferior del menú están tu nombre y DNI, el botón de modo claro/oscuro (sol/luna) y el botón para cerrar sesión.' },
      { n: '4', texto: 'Al tocar "Salir" el sistema te va a preguntar si estás seguro antes de cerrar la sesión.' },
    ],
  },
  {
    id: 'ventas',
    icon: ShoppingCart,
    color: '#55bdfb',
    titulo: 'Ventas — Punto de venta (buffet)',
    resumen: 'Registrá cada venta del buffet de forma rápida.',
    ilustracion: <IlustracionVentas />,
    pasos: [
      { n: '1', texto: 'Seleccioná el evento activo desde el selector en la parte superior (ej: "Fecha 16 Masculino").' },
      { n: '2', texto: 'Tocá los productos que el cliente quiere comprar — aparecen en el carrito a la derecha con su precio.' },
      { n: '3', texto: 'Si el cliente lleva más de uno del mismo producto, usá los botones + y − en el carrito para ajustar la cantidad.' },
      { n: '4', texto: 'Cuando el carrito esté listo, tocá el botón azul "Cobrar".' },
      { n: '5', texto: 'En el modal de pago ingresá cuánto paga en efectivo y cuánto por transferencia. Usá "Todo efectivo" o "Todo transferencia" para completarlo con un solo toque.' },
      { n: '6', texto: 'Confirmá la venta. Aparecerá en el historial de la parte inferior.' },
      { n: '!', texto: 'Si necesitás cancelar una venta ya registrada, buscala en el historial y tocá el ícono rojo de cancelar.' },
    ],
  },
  {
    id: 'stock',
    icon: Package,
    color: '#a78bfa',
    titulo: 'Stock — Productos del buffet',
    resumen: 'Administrá todos los productos disponibles para vender.',
    ilustracion: <IlustracionStock />,
    pasos: [
      { n: '1', texto: 'La pantalla muestra todos los productos agrupados por categoría (Bebidas, Alimentos, etc.).' },
      { n: '2', texto: 'Para agregar un producto nuevo tocá "+ Nuevo producto" e ingresá nombre, categoría, precio de venta, costo de compra y stock inicial.' },
      { n: '3', texto: 'Para editar un producto existente tocá el ícono de lápiz ✏ en su fila.' },
      { n: '4', texto: 'Cuando un producto tiene 3 unidades o menos aparece con etiqueta amarilla ⚠ — es momento de reponer.' },
      { n: '5', texto: 'Podés desactivar un producto temporalmente (si se agotó) sin eliminarlo. Los productos inactivos no aparecen en la pantalla de ventas.' },
    ],
  },
  {
    id: 'eventos',
    icon: Calendar,
    color: '#34d399',
    titulo: 'Eventos — Partidos y torneos',
    resumen: 'Cada partido o torneo es un evento. Las ventas se asocian al evento activo.',
    ilustracion: <IlustracionEventos />,
    pasos: [
      { n: '1', texto: 'Tocá "+ Nuevo evento" e ingresá el nombre del partido o torneo (ej: "Fecha 16 Masculino").' },
      { n: '2', texto: 'El evento queda "En curso" y aparece como opción al registrar ventas en el POS.' },
      { n: '3', texto: 'Podés tener varios eventos abiertos al mismo tiempo — el cajero elige a cuál corresponde cada venta.' },
      { n: '4', texto: 'Cuando el partido o torneo termina, cerrá el evento tocando "Cerrar evento". Ya no aceptará nuevas ventas.' },
      { n: '5', texto: 'Los eventos cerrados quedan en el historial para que puedas ver sus reportes en cualquier momento.' },
    ],
  },
  {
    id: 'cajas',
    icon: Wallet,
    color: '#f59e0b',
    titulo: 'Cajas — Saldo del dinero',
    resumen: 'Mirá cuánto hay en cada caja y mové dinero entre ellas.',
    ilustracion: <IlustracionCajas />,
    pasos: [
      { n: '1', texto: 'Hay 3 cajas: Efectivo (billetería física), Transferencia (pagos digitales) y Club (dinero que va al club).' },
      { n: '2', texto: 'Los saldos se calculan solos — no necesitás ingresar nada. Se suman ventas e ingresos y se restan gastos y movimientos.' },
      { n: '3', texto: 'Para pasar dinero de una caja a otra tocá "Mover fondos", elegí origen y destino, e ingresá el monto.' },
      { n: '4', texto: 'Usá el botón "Mover todo" para trasladar el saldo completo de una caja sin tener que escribir el número.' },
      { n: '!', texto: 'Usá "Actualizar" (ícono circular) si acabás de registrar algo y querés que los saldos se refresquen.' },
    ],
  },
  {
    id: 'gastos',
    icon: TrendingDown,
    color: '#f87171',
    titulo: 'Gastos — Lo que se gastó',
    resumen: 'Hay dos tipos: el costo del buffet (automático) y otros gastos (manual).',
    ilustracion: <IlustracionGastos />,
    pasos: [
      { n: '1', texto: 'La pestaña "Buffet (mercadería)" se llena sola con el costo de los productos vendidos. Podés filtrar por evento.' },
      { n: '2', texto: 'Ahí podés ver por cada producto: cuánto costó, cuánto se vendió y cuánto se ganó.' },
      { n: '3', texto: 'Para registrar otro tipo de gasto (sueldo, árbitros, compras) tocá "Registrar gasto" en la pestaña "Otros gastos".' },
      { n: '4', texto: 'Completá: categoría (Sueldo / Árbitros / Mercadería / Otro), descripción, monto, de qué caja sale y la fecha.' },
      { n: '5', texto: 'Podés asociar el gasto a un evento específico o dejarlo sin evento.' },
    ],
  },
  {
    id: 'ingresos',
    icon: TrendingUp,
    color: '#4ade80',
    titulo: 'Ingresos — Lo que entró',
    resumen: 'Hay dos tipos: las ventas del buffet (automáticas) y otros ingresos (manual).',
    ilustracion: <IlustracionIngresos />,
    pasos: [
      { n: '1', texto: 'La pestaña "Buffet" muestra automáticamente todas las ventas registradas con el detalle de cada una.' },
      { n: '2', texto: 'Podés filtrar por evento para ver cuánto se recaudó en cada partido.' },
      { n: '3', texto: 'Para registrar un ingreso que no es del buffet (publicidad, entrada al evento, donación) tocá "+ Registrar ingreso" en "Otros ingresos".' },
      { n: '4', texto: 'Indicá la categoría, descripción, monto, en qué caja entra el dinero y la fecha.' },
    ],
  },
  {
    id: 'informes',
    icon: BarChart3,
    color: '#818cf8',
    titulo: 'Informes — Análisis y reportes',
    resumen: 'Graficá los resultados y exportá el informe en Excel o PDF.',
    ilustracion: <IlustracionInformes />,
    pasos: [
      { n: '1', texto: 'Elegí el modo: "Por evento" (un partido específico), "Por período" (rango de fechas) o "General" (todo el historial).' },
      { n: '2', texto: 'El resumen muestra: resultado neto, ventas del buffet, otros ingresos, gastos totales y cantidad de ventas.' },
      { n: '3', texto: 'Los gráficos muestran ventas por categoría de producto, gastos por categoría, ingresos vs gastos y ventas por hora.' },
      { n: '4', texto: 'Tocá "Excel" para descargar una planilla con 4 hojas: resumen, ventas, gastos e ingresos.' },
      { n: '5', texto: 'Tocá "PDF" para descargar un informe en formato documento listo para imprimir o compartir.' },
    ],
  },
  {
    id: 'micuenta',
    icon: User,
    color: '#7ab8d9',
    titulo: 'Mi cuenta',
    resumen: 'Editá tus datos personales.',
    ilustracion: null,
    pasos: [
      { n: '1', texto: 'Desde Mi cuenta podés modificar tu nombre y apellido.' },
      { n: '2', texto: 'El DNI y la fecha de nacimiento son datos de solo lectura — no se pueden cambiar.' },
      { n: '3', texto: 'Guardá los cambios con el botón "Guardar cambios". Los cambios se reflejan de inmediato en el menú lateral.' },
    ],
  },
]

export default function AyudaPage() {
  const [activo, setActivo] = useState<string | null>('nav')
  const [generando, setGenerando] = useState(false)

  const moduloActivo = MODULOS.find(m => m.id === activo)

  async function descargarPDF() {
    setGenerando(true)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 18
    const contentW = pageW - margin * 2
    let y = 20

    function checkPage(needed = 10) {
      if (y + needed > 272) { doc.addPage(); y = 20; addBg() }
    }
    function addBg() {
      doc.setFillColor(12, 35, 55)
      doc.rect(0, 0, pageW, 297, 'F')
    }

    // Portada
    addBg()
    doc.setDrawColor(85, 189, 251)
    doc.setLineWidth(0.5)
    doc.rect(10, 10, pageW - 20, 277)
    doc.setTextColor(85, 189, 251)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Manual de Usuario', pageW / 2, 100, { align: 'center' })
    doc.setFontSize(13)
    doc.setTextColor(200, 225, 245)
    doc.text('Sistema de Gestión', pageW / 2, 116, { align: 'center' })
    doc.text('Basquet Formativo', pageW / 2, 126, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(120, 160, 200)
    doc.text('Sport Club Cañadense', pageW / 2, 140, { align: 'center' })
    doc.setFontSize(8)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, 272, { align: 'center' })

    doc.addPage()
    addBg()
    y = 20

    for (const mod of MODULOS) {
      checkPage(24)
      doc.setFillColor(85, 189, 251)
      doc.rect(margin, y, 3, 12, 'F')
      doc.setTextColor(85, 189, 251)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(mod.titulo, margin + 7, y + 8.5)
      y += 16

      doc.setTextColor(150, 195, 230)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(mod.resumen, margin, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      for (const paso of mod.pasos) {
        checkPage(14)
        const prefix = paso.n === '!' ? '⚠  ' : `${paso.n}.  `
        const color: [number, number, number] = paso.n === '!' ? [250, 200, 50] : [85, 189, 251]
        doc.setTextColor(...color)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(prefix, margin, y)
        doc.setTextColor(190, 215, 235)
        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(paso.texto, contentW - 10)
        doc.text(lines, margin + 9, y)
        y += lines.length * 5.5 + 3
      }
      y += 8
    }

    const total = (doc.internal as any).getNumberOfPages()
    for (let p = 2; p <= total; p++) {
      doc.setPage(p)
      doc.setTextColor(70, 110, 150)
      doc.setFontSize(7)
      doc.text(`SCC Basquet Formativo — Pág. ${p - 1} de ${total - 1}`, pageW / 2, 290, { align: 'center' })
    }

    doc.save('Manual_SCC_Basquet_Formativo.pdf')
    setGenerando(false)
  }

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Manual de usuario</h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Tocá un módulo del índice para ver cómo usarlo paso a paso.
          </p>
        </div>
        <button onClick={descargarPDF} disabled={generando} className="btn-primary shrink-0">
          {generando
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Download size={16} />}
          {generando ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row items-start">

        {/* ── Índice lateral ─────────────────────────────── */}
        <div className="lg:w-64 shrink-0 glass-card p-3 flex flex-col gap-1">
          <p className="text-xs font-bold px-3 py-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            MÓDULOS
          </p>
          {MODULOS.map(m => {
            const Icon = m.icon
            const sel = activo === m.id
            return (
              <button
                key={m.id}
                onClick={() => setActivo(m.id)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all w-full"
                style={{
                  background: sel ? `${m.color}18` : 'transparent',
                  borderLeft: `3px solid ${sel ? m.color : 'transparent'}`,
                  color: sel ? m.color : 'var(--text-muted)',
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="text-sm font-semibold">{m.titulo.split(' — ')[0]}</span>
                {sel && <ChevronRight size={14} className="ml-auto shrink-0 opacity-60" />}
              </button>
            )
          })}
        </div>

        {/* ── Contenido del módulo ───────────────────────── */}
        {moduloActivo && (
          <div className="flex-1 min-w-0 flex flex-col gap-5 animate-fade-in" key={moduloActivo.id}>

            {/* Cabecera del módulo */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: `${moduloActivo.color}12`, border: `1px solid ${moduloActivo.color}33` }}
            >
              <div className="p-3 rounded-2xl shrink-0" style={{ background: `${moduloActivo.color}22`, color: moduloActivo.color }}>
                <moduloActivo.icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>
                  {moduloActivo.titulo}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {moduloActivo.resumen}
                </p>
              </div>
            </div>

            {/* Ilustración */}
            {moduloActivo.ilustracion && (
              <div className="glass-card overflow-hidden">
                <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: moduloActivo.color }} />
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
                    ASÍ SE VE EN PANTALLA
                  </p>
                </div>
                <div className="px-4 pb-4">
                  {moduloActivo.ilustracion}
                </div>
              </div>
            )}

            {/* Pasos */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full" style={{ background: moduloActivo.color }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
                  CÓMO USARLO
                </p>
              </div>
              <div className="flex flex-col gap-5">
                {moduloActivo.pasos.map((p, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        background: p.n === '!' ? 'rgba(250,204,21,0.12)' : `${moduloActivo.color}18`,
                        color: p.n === '!' ? '#facc15' : moduloActivo.color,
                        border: `1.5px solid ${p.n === '!' ? 'rgba(250,204,21,0.35)' : moduloActivo.color + '50'}`,
                        minWidth: 32,
                      }}
                    >
                      {p.n === '!' ? '!' : p.n}
                    </div>
                    <p className="text-base leading-relaxed flex-1 pt-1" style={{ color: 'var(--text)' }}>
                      {p.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
