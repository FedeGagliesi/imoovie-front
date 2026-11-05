// FUNCIONES (mock): cada función es una película, en una sucursal, un día y
// una hora, en una sala y con un precio.
//
//   peliculaId  → conecta con una película (data/peliculas.js)
//   sucursalId  → conecta con una sucursal (data/sucursales.js)
// Es la misma idea que una clave foránea en una base de datos.
//
// El admin puede agregar y eliminar funciones, así que la lista "real" vive en
// localStorage: obtenerFunciones() / guardarFunciones(lista).

import { leer, guardar } from './almacenamiento'
import { formatearDia } from './formato'

const CLAVE = 'imoovie-funciones'

// ---------- Mapa de la sala ----------
// Todas las salas tienen 6 filas (A a F) y 8 butacas por fila.
// Una butaca se identifica con fila + número: "C5" = fila C, butaca 5.
export const FILAS = ['A', 'B', 'C', 'D', 'E', 'F']
export const COLUMNAS = 8
export const SALAS = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4']

// Devuelve la lista de butacas YA OCUPADAS de una función.
// Simulamos las ocupadas con una cuenta fija: así una misma función siempre
// muestra las mismas butacas ocupadas, y cada función tiene las suyas.
export function butacasOcupadas(funcionId) {
  const ocupadas = []
  FILAS.forEach((fila, indiceFila) => {
    for (let numero = 1; numero <= COLUMNAS; numero++) {
      // % es el "resto de la división": da un patrón que cambia con la fila,
      // el número y la función, sin usar números al azar.
      if ((indiceFila * 7 + numero * 3 + funcionId * 2) % 5 === 0) {
        ocupadas.push(fila + numero)
      }
    }
  })
  return ocupadas
}

export const TOTAL_BUTACAS = FILAS.length * COLUMNAS // 6 × 8 = 48

// Todas las butacas que NO se pueden elegir en una función: las "ocupadas"
// simuladas de arriba MÁS las que ya compraron clientes reales.
//   - flatMap: como .map(), pero junta todos los arrays resultantes en uno solo
//     (cada compra tiene su propia lista de butacas).
//   - new Set(...): una colección sin elementos repetidos; sirve para sacar duplicados.
// Las compras de ejemplo se ignoran: sus butacas son inventadas.
export function butacasNoDisponibles(funcionId, compras) {
  const vendidas = compras
    .filter((c) => c.funcionId === funcionId && !c.ejemplo)
    .flatMap((c) => c.butacas)
  return [...new Set([...butacasOcupadas(funcionId), ...vendidas])]
}

// La fecha se guarda como texto "AAAA-MM-DD" y la hora como "HH:MM": es el
// formato que usan los <input type="date"> y <input type="time">.
export const funcionesIniciales = [
  { id: 1, peliculaId: 1, sucursalId: 1, fecha: '2026-11-06', hora: '18:30', sala: 'Sala 1', precio: 6500 },
  { id: 2, peliculaId: 1, sucursalId: 2, fecha: '2026-11-07', hora: '21:00', sala: 'Sala 1', precio: 7500 },
  { id: 3, peliculaId: 2, sucursalId: 1, fecha: '2026-11-06', hora: '20:00', sala: 'Sala 2', precio: 7500 },
  { id: 4, peliculaId: 2, sucursalId: 2, fecha: '2026-11-08', hora: '17:15', sala: 'Sala 2', precio: 6500 },
  { id: 5, peliculaId: 3, sucursalId: 1, fecha: '2026-11-07', hora: '23:00', sala: 'Sala 3', precio: 7500 },
  { id: 6, peliculaId: 3, sucursalId: 2, fecha: '2026-11-08', hora: '21:30', sala: 'Sala 3', precio: 7500 },
  { id: 7, peliculaId: 4, sucursalId: 1, fecha: '2026-11-06', hora: '16:00', sala: 'Sala 1', precio: 6000 },
  { id: 8, peliculaId: 4, sucursalId: 2, fecha: '2026-11-08', hora: '15:30', sala: 'Sala 1', precio: 6000 },
]

export function obtenerFunciones() {
  return leer(CLAVE, funcionesIniciales)
}

export function guardarFunciones(lista) {
  guardar(CLAVE, lista)
}

// Texto corto de una función: "Vie 6/11 · 18:30 · Sala 1"
export function etiquetaFuncion(funcion) {
  return `${formatearDia(funcion.fecha)} · ${funcion.hora} · ${funcion.sala}`
}
