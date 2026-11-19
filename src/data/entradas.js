// ENTRADAS (mock). Espejan la entidad Entrada del backend.
//
// A diferencia de una "compra", acá hay UNA entrada por butaca: si una persona
// compra tres butacas, se guardan tres entradas. Las tres comparten "numeroCompra",
// que es lo que codifica el ÚNICO código QR de la compra (ver ComprobanteQR.jsx).
//
//   {
//     id, numeroCompra,              // numeroCompra es lo que codifica el QR; codigoQR es un identificador propio de cada entrada (lo ve el admin)
//     codigoQR,
//     funcionId, sucursalId, butaca: 'C4',
//     monto,                         // lo que se pagó por esa butaca
//     canal: 'ONLINE' | 'SUCURSAL',
//     usuario: email | null,         // cliente con cuenta (null en mostrador)
//     vendedor: email | null,        // vendedor que la emitió (solo mostrador)
//     clienteMostrador, pago,        // datos de la venta en mostrador
//     estado: 'DISPONIBLE' | 'UTILIZADA',
//     calificacion, comentario,      // 0 = sin calificar
//     fechaCompra                    // milisegundos
//   }
//
// Ciclo de vida de una entrada (solo dos estados):
//   - DISPONIBLE: recién comprada, todavía no se usó para entrar al cine.
//   - UTILIZADA:  el vendedor la validó en la puerta; no se puede usar de nuevo.
//
// Regla: una butaca vendida no se puede vender otra vez en la misma función.
//
// La lista "real" vive en localStorage: obtenerEntradas() / guardarEntradas(lista).

import { leer, guardar } from './almacenamiento'
import { inicioFuncion, obtenerFunciones, haComenzado } from './funciones'
import { formatearDia } from './formato'
import { obtenerPeliculas } from './peliculas'
import { obtenerSalas, TIPOS_BUTACA } from './salas'
import { obtenerSucursales } from './sucursales'

const CLAVE = 'imoovie-entradas'

export const ESTADOS = {
  DISPONIBLE: 'Disponible',
  UTILIZADA: 'Utilizada',
}

export function obtenerEntradas() {
  return leer(CLAVE, [])
}

export function guardarEntradas(lista) {
  guardar(CLAVE, lista)
}

// Agrega entradas nuevas al principio (la más reciente primero).
export function agregarEntradas(nuevas) {
  guardarEntradas([...nuevas, ...obtenerEntradas()])
}

// Butacas que NO se pueden elegir en una función: las de todas sus entradas.
export function butacasOcupadas(funcionId, entradas) {
  return entradas
    .filter((e) => e.funcionId === funcionId)
    .map((e) => e.butaca)
}

// Butacas de la sala que todavía se pueden vender en esa función.
export function butacasLibres(funcion, sala, entradas) {
  const ocupadas = butacasOcupadas(funcion.id, entradas)
  return sala.butacas.filter((b) => !ocupadas.includes(b.id))
}

// Una entrada sigue siendo válida para entrar al cine (todavía no se usó).
export function estaVigente(entrada) {
  return entrada.estado === 'DISPONIBLE'
}

// Promedio de calificaciones de una película, redondeado a 2 decimales.
// Solo cuentan las entradas que tienen calificación (0 = sin calificar).
// Equivale a Pelicula.calificacionPromedio del backend.
export function promedioPelicula(peliculaId, entradas, funciones) {
  const califs = entradas
    .filter((e) => e.calificacion > 0)
    .filter((e) => funciones.find((f) => f.id === e.funcionId)?.peliculaId === peliculaId)
    .map((e) => e.calificacion)
  if (califs.length === 0) return 0
  const promedio = califs.reduce((suma, c) => suma + c, 0) / califs.length
  return Math.round(promedio * 100) / 100
}

// Fecha de inicio de la función de una entrada, o 0 si la función ya no existe.
export function inicioDeEntrada(entrada, funciones) {
  const funcion = funciones.find((f) => f.id === entrada.funcionId)
  return funcion ? inicioFuncion(funcion) : 0
}

// Datos de una entrada para mostrar, sin quién la compró ni cuánto pagó:
// es la misma vista reducida que devuelve GET /api/entradas/qr/{codigo} del backend.
// La usa el panel de admin y, por debajo, detallesCompra.
export function detalleEntrada(entrada) {
  const funcion = obtenerFunciones().find((f) => f.id === entrada.funcionId)
  const pelicula = obtenerPeliculas().find((p) => p.id === funcion?.peliculaId)
  const sala = obtenerSalas().find((s) => s.id === funcion?.salaId)
  const sucursal = obtenerSucursales().find((s) => s.id === sala?.sucursalId)
  const butaca = sala?.butacas.find((b) => b.id === entrada.butaca)
  return {
    codigoQR: entrada.codigoQR,
    estado: ESTADOS[entrada.estado],
    pelicula: pelicula?.titulo ?? 'Película retirada',
    clasificacion: pelicula?.clasificacion ?? '',
    duracion: pelicula?.duracion ?? 0,
    inicio: funcion ? inicioFuncion(funcion) : 0,
    idioma: funcion?.idioma ?? '',
    conSubtitulos: Boolean(funcion?.conSubtitulos),
    sala: sala?.nombre ?? '',
    sucursal: sucursal?.nombre ?? '',
    sucursalDireccion: sucursal?.direccion ?? '',
    butaca: entrada.butaca,
    tipo: butaca ? TIPOS_BUTACA[butaca.tipo] : '',
  }
}

// La misma vista reducida, pero de TODA una compra: los datos de la función una sola vez
// y la lista de butacas con su tipo y su estado. Reutiliza detalleEntrada para no duplicar
// lógica. Devuelve null si no hay ninguna entrada con ese numeroCompra.
// Se usa en la consulta pública (/consultar) y en la validación en puerta.
export function detallesCompra(numeroCompra, entradas) {
  const propias = entradas
    .filter((e) => e.numeroCompra === numeroCompra)
    .sort((a, b) => a.butaca.localeCompare(b.butaca, 'es', { numeric: true }))
  if (propias.length === 0) return null
  const detalles = propias.map(detalleEntrada)
  const { pelicula, clasificacion, duracion, inicio, idioma, conSubtitulos, sala, sucursal, sucursalDireccion } = detalles[0]
  return {
    numeroCompra,
    pelicula,
    clasificacion,
    duracion,
    inicio,
    idioma,
    conSubtitulos,
    sala,
    sucursal,
    sucursalDireccion,
    butacas: detalles.map((d) => ({ butaca: d.butaca, tipo: d.tipo, estado: d.estado })),
  }
}

// Agrupa las entradas por compra (numeroCompra): una compra de 3 butacas es UN grupo
// con sus 3 entradas. Devuelve los grupos ordenados de la función más reciente a la más antigua.
export function agruparPorCompra(entradas, funciones) {
  const grupos = new Map()
  entradas.forEach((e) => {
    if (!grupos.has(e.numeroCompra)) grupos.set(e.numeroCompra, { numeroCompra: e.numeroCompra, entradas: [] })
    grupos.get(e.numeroCompra).entradas.push(e)
  })
  const inicioDe = (g) => {
    const f = funciones.find((fn) => fn.id === g.entradas[0].funcionId)
    return f ? inicioFuncion(f) : 0
  }
  return [...grupos.values()]
    .map((g) => ({ ...g, entradas: [...g.entradas].sort((a, b) => a.butaca.localeCompare(b.butaca, 'es', { numeric: true })) }))
    .sort((a, b) => inicioDe(b) - inicioDe(a))
}

// Funciones a las que tiene entradas vigentes una persona, una opción por función
// (aunque tenga varias butacas en esa función). Sirve para asociar un pedido de candy
// a "la función a la que voy", no a una butaca. entradaId es una entrada de esa función,
// que es la que el backend guarda en el pedido.
export function funcionesConEntradas(email, entradas) {
  const vigentes = entradas.filter((e) => e.usuario === email && estaVigente(e))
  const opciones = new Map()
  vigentes.forEach((e) => {
    if (!opciones.has(e.funcionId)) {
      const funcion = obtenerFunciones().find((f) => f.id === e.funcionId)
      if (!funcion || haComenzado(funcion)) return
      const pelicula = obtenerPeliculas().find((p) => p.id === funcion.peliculaId)
      const sala = obtenerSalas().find((s) => s.id === funcion.salaId)
      const sucursal = sala && obtenerSucursales().find((s) => s.id === sala.sucursalId)
      opciones.set(e.funcionId, {
        funcionId: e.funcionId,
        entradaId: e.id,
        etiqueta: `${pelicula?.titulo ?? ''} · ${sucursal?.nombre ?? ''} · ${formatearDia(funcion.fecha)} ${funcion.hora} · ${sala?.nombre ?? ''}`,
      })
    }
  })
  return [...opciones.values()]
}
