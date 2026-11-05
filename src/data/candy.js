// PRODUCTOS DE CANDY (mock). Los usan la compra del cliente y el mostrador del
// vendedor. El admin puede agregar productos, cambiar precios y darlos de baja,
// así que la lista "real" vive en localStorage:
//   obtenerProductos()      → lee la lista guardada (o la inicial si no hay)
//   guardarProductos(lista) → guarda la lista completa
//
// "activo: false" = producto dado de baja: deja de ofrecerse pero no se borra.

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-candy'

export const productosIniciales = [
  { id: 1, nombre: 'Pochoclo chico', descripcion: 'Salado o dulce', precio: 3500, activo: true },
  { id: 2, nombre: 'Pochoclo mediano', descripcion: 'Salado o dulce', precio: 4800, activo: true },
  { id: 3, nombre: 'Pochoclo grande', descripcion: 'Salado o dulce', precio: 6200, activo: true },
  { id: 4, nombre: 'Gaseosa 500 cc', descripcion: 'Cola, lima o naranja', precio: 3200, activo: true },
  { id: 5, nombre: 'Agua mineral', descripcion: 'Sin gas, 500 cc', precio: 2500, activo: true },
  { id: 6, nombre: 'Nachos con cheddar', descripcion: 'Porción para compartir', precio: 5200, activo: true },
  { id: 7, nombre: 'Chocolate', descripcion: 'Barra 50 g', precio: 2800, activo: true },
  { id: 8, nombre: 'Combo pareja', descripcion: 'Pochoclo grande + 2 gaseosas', precio: 11500, activo: true },
]

export function obtenerProductos() {
  return leer(CLAVE, productosIniciales)
}

export function guardarProductos(lista) {
  guardar(CLAVE, lista)
}
