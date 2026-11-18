// PEDIDOS DE CANDY (mock). Espejan la entidad ItemPedido del backend: una línea
// de candy que el cliente pide por anticipado para retirar en un horario.
//
//   {
//     id, usuario,                 // email del cliente
//     productoId, nombre,          // producto y nombre (copia para el historial)
//     precioUnitario,              // precio AL MOMENTO del pedido: si el precio cambia
//                                  // después, lo ya pedido sigue valiendo lo mismo
//     cantidad,
//     horarioRetiro: 'AAAA-MM-DDTHH:MM',
//     entradaId,                   // entrada asociada (opcional, null si no hay)
//     retirado: false,             // lo marca el admin cuando se entrega
//     fechaPedido                  // milisegundos
//   }
//
// Como en el backend, el pedido no lleva sucursal: el panel de candy es único.
// La lista "real" vive en localStorage: obtenerPedidos() / guardarPedidos(lista).

import { leer, guardar } from './almacenamiento'
import { ahora, fechaHoraMs, siguienteId, generarNumeroPedido } from './formato'

const CLAVE = 'imoovie-pedidos-candy'

export function obtenerPedidos() {
  return leer(CLAVE, [])
}

export function guardarPedidos(lista) {
  guardar(CLAVE, lista)
}

// Total de una línea: precio al momento del pedido × cantidad.
export function montoTotalPedido(pedido) {
  return pedido.precioUnitario * pedido.cantidad
}

// Crea un pedido de candy: todas las líneas comparten un número de pedido.
// Lo usan "Mis pedidos" y la página pública de Candy. Devuelve el número del pedido.
export function crearPedido({ usuario, lineas, horarioRetiro, entradaId }) {
  const actuales = obtenerPedidos()
  const numeroPedido = generarNumeroPedido()
  const momento = ahora()
  let id = siguienteId(actuales)
  const nuevos = lineas.map((l) => ({
    id: id++,
    numeroPedido,
    usuario,
    productoId: l.id,
    nombre: l.nombre,
    precioUnitario: l.precio,
    cantidad: l.cantidad,
    horarioRetiro,
    entradaId: entradaId ?? null,
    retirado: false,
    fechaPedido: momento,
  }))
  guardarPedidos([...nuevos, ...actuales])
  return numeroPedido
}

// ¿El horario de retiro ("AAAA-MM-DDTHH:MM") es futuro? Mismo criterio que el backend.
export function horarioRetiroFuturo(horario) {
  return horario !== '' && fechaHoraMs(horario.slice(0, 10), horario.slice(11)) > ahora()
}

// Milisegundos de un horario de retiro, para ordenar y mostrar.
export function msDeRetiro(horario) {
  return fechaHoraMs(horario.slice(0, 10), horario.slice(11))
}

// Pedidos de candy de un cliente que quedan asociados a estas entradas y todavía no se retiraron.
export function pedidosAsociadosA(email, entradaIds) {
  return obtenerPedidos().filter(
    (p) => p.usuario === email && !p.retirado && !p.cancelado && entradaIds.includes(p.entradaId),
  )
}

// Marca como cancelados los pedidos indicados (no se borran: queda el historial).
export function cancelarPedidos(ids) {
  guardarPedidos(obtenerPedidos().map((p) => (ids.includes(p.id) ? { ...p, cancelado: true } : p)))
}
