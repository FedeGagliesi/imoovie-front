// VENTAS DE MOSTRADOR (candy vendido en persona por el vendedor), en localStorage.
//
// Cada venta es:
//   { id, fecha, sucursalId, pago, total, lineas: [{ nombre, cantidad, precio }] }

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-ventas'

// Medios de pago que acepta el mostrador (los usan la venta de candy y la de entradas).
export const MEDIOS_PAGO = ['Efectivo', 'Débito', 'Crédito', 'QR']

export function obtenerVentas() {
  return leer(CLAVE, [])
}

export function guardarVentas(lista) {
  guardar(CLAVE, lista)
}
