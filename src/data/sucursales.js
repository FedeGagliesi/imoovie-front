// SUCURSALES (mock). El admin puede agregar sucursales y darlas de baja.
// Igual que con las películas, la lista "real" vive en localStorage:
//   obtenerSucursales()      → lee la lista guardada (o la inicial si no hay)
//   guardarSucursales(lista) → guarda la lista completa

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-sucursales'

export const sucursalesIniciales = [
  { id: 1, nombre: 'Centro', direccion: 'Av. San Martín 1200', activa: true },
  { id: 2, nombre: 'Norte', direccion: 'Bv. Ocampo 450', activa: true },
]

export function obtenerSucursales() {
  return leer(CLAVE, sucursalesIniciales)
}

export function guardarSucursales(lista) {
  guardar(CLAVE, lista)
}
