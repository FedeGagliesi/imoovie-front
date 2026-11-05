// COMPRAS CONFIRMADAS de entradas (con su candy), guardadas en localStorage.
//
// Cada vez que un cliente confirma una compra se agrega un registro:
//   { id, fecha, numero, usuario, sucursalId, peliculaId, funcionId,
//     butacas: ['A2', 'A3'], totalEntradas,
//     lineasCandy: [{ nombre, cantidad, precio }], totalCandy,
//     retirado }
//
// "retirado" lo marca el vendedor cuando entrega el candy en el mostrador.
// Estos registros los usan el panel del vendedor y la compra de entradas (para saber
// qué butacas ya se vendieron).

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-compras'

export function obtenerCompras() {
  return leer(CLAVE, [])
}

export function guardarCompras(lista) {
  guardar(CLAVE, lista)
}

// Atajo: lee la lista, agrega la compra al principio y la vuelve a guardar.
export function registrarCompra(compra) {
  guardarCompras([compra, ...obtenerCompras()])
}
