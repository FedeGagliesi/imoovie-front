// SALAS (mock). Espejan la entidad Sala y sus Butacas del backend.
//
// Regla del backend: al crear una sala, sus butacas se generan solas en filas de 10.
//   - La fila A es VIP.
//   - Las dos últimas filas son PREMIUM.
//   - El resto son NORMAL.
// Por eso cada sala guarda su lista de butacas ("butacas") desde el momento
// en que se crea. Como en el backend, cambiar la capacidad después NO vuelve
// a generar las butacas.
//
// Una butaca se identifica con fila + número: "C5" = fila C, butaca 5.
//
// La lista "real" vive en localStorage: obtenerSalas() / guardarSalas(lista).

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-salas'
const BUTACAS_POR_FILA = 10
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Genera las butacas de una sala con la misma distribución que el backend.
export function generarButacas(capacidad) {
  const totalFilas = Math.ceil(capacidad / BUTACAS_POR_FILA)
  const butacas = []
  for (let i = 0; i < capacidad; i++) {
    const indiceFila = Math.floor(i / BUTACAS_POR_FILA)
    const numero = (i % BUTACAS_POR_FILA) + 1
    const fila = LETRAS[indiceFila]
    let tipo = 'NORMAL'
    if (indiceFila === 0) tipo = 'VIP'
    else if (indiceFila >= totalFilas - 2) tipo = 'PREMIUM'
    butacas.push({ id: fila + numero, fila, numero, tipo })
  }
  return butacas
}

// Crea una sala nueva con sus butacas ya generadas.
export function crearSala({ id, nombre, capacidad, sucursalId }) {
  return { id, nombre, capacidad, sucursalId, activa: true, butacas: generarButacas(capacidad) }
}

export const salasIniciales = [
  crearSala({ id: 1, nombre: 'Sala 1', capacidad: 48, sucursalId: 1 }),
  crearSala({ id: 2, nombre: 'Sala 2', capacidad: 40, sucursalId: 1 }),
  crearSala({ id: 3, nombre: 'Sala 3', capacidad: 30, sucursalId: 1 }),
  crearSala({ id: 4, nombre: 'Sala 1', capacidad: 50, sucursalId: 2 }),
  crearSala({ id: 5, nombre: 'Sala 2', capacidad: 40, sucursalId: 2 }),
]

export function obtenerSalas() {
  return leer(CLAVE, salasIniciales)
}

export function guardarSalas(lista) {
  guardar(CLAVE, lista)
}

// Tipos de butaca, con el nombre que se muestra en pantalla.
export const TIPOS_BUTACA = {
  NORMAL: 'Normal',
  VIP: 'VIP',
  PREMIUM: 'Premium',
}
