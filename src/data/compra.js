// COMPRA (lógica sin pantalla). Concentra lo que pasa al comprar entradas, para que
// las pantallas del flujo (butacas, candy, pago) solo muestren y capturen datos.
//
// Espeja POST /api/cliente/entradas y POST /api/cliente/candy/pedidos del backend.
// El cargo por servicio NO existe en el backend: es un agregado de la interfaz.

import { obtenerEntradas, agregarEntradas, butacasLibres } from './entradas'
import { obtenerPedidos, guardarPedidos } from './pedidos'
import { haComenzado } from './funciones'
import { ahora, generarNumeroCompra, generarCodigoQR, siguienteId } from './formato'

export const CARGO_SERVICIO_POR_ENTRADA = 1200

// Métodos de pago que ofrece la compra online (pago simulado).
export const METODOS_PAGO = [
  { valor: 'Tarjeta', nombre: 'Tarjeta' },
  { valor: 'MODO', nombre: 'MODO' },
  { valor: 'Dinero en cuenta', nombre: 'Dinero en cuenta' },
]

// Nombres legibles de la disponibilidad de una función.
export const TEXTO_NIVEL = { alta: 'Alta', media: 'Media', baja: 'Baja', completa: 'Completa' }

// Totales de una compra. Recibe números, así se puede probar sin pantalla.
export function calcularTotales({ precio, cantidad, candyLines }) {
  const subtotalEntradas = precio * cantidad
  const cargoServicio = CARGO_SERVICIO_POR_ENTRADA * cantidad
  const subtotalCandy = candyLines.reduce((suma, l) => suma + l.precio * l.cantidad, 0)
  return {
    subtotalEntradas,
    cargoServicio,
    subtotalCandy,
    total: subtotalEntradas + cargoServicio + subtotalCandy,
  }
}

// Disponibilidad de una función como nivel legible, igual que en la cartelera de referencia:
// "alta" (más de la mitad libre), "media", "baja" (menos de un cuarto) o "completa".
export function nivelDisponibilidad(libres, total) {
  if (libres === 0) return 'completa'
  const proporcion = total > 0 ? libres / total : 0
  if (proporcion > 0.5) return 'alta'
  if (proporcion >= 0.25) return 'media'
  return 'baja'
}

// Valida que la compra todavía se pueda hacer. Devuelve un mensaje o '' si está todo bien.
export function errorCompra(funcion, sala, butacas) {
  if (!funcion || !funcion.activa) return 'Esa función ya no está disponible.'
  if (haComenzado(funcion)) return 'La función ya comenzó: no se pueden comprar entradas.'
  if (butacas.length === 0) return 'Elegí al menos una butaca.'
  const libres = butacasLibres(funcion, sala, obtenerEntradas()).map((b) => b.id)
  const tomadas = butacas.filter((b) => !libres.includes(b))
  if (tomadas.length > 0) {
    return `Se acaban de vender estas butacas: ${tomadas.join(', ')}. Elegí otras.`
  }
  return ''
}

// Guarda la compra: una entrada por butaca (cada una con QR) y un pedido por producto de candy.
// Devuelve los datos del comprobante. Se asume que errorCompra() ya dio ''.
export function confirmarCompra({ funcion, sala, butacas, candyLines, usuario, metodoPago, totales }) {
  const momento = ahora()
  const numeroCompra = generarNumeroCompra()

  const entradasActuales = obtenerEntradas()
  let proximoId = siguienteId(entradasActuales)
  const entradas = [...butacas].sort().map((butaca) => ({
    id: proximoId++,
    codigoQR: generarCodigoQR(),
    numeroCompra,
    funcionId: funcion.id,
    sucursalId: sala.sucursalId,
    butaca,
    monto: funcion.precio,
    canal: 'ONLINE',
    usuario,
    vendedor: null,
    clienteMostrador: null,
    pago: metodoPago,
    estado: 'DISPONIBLE',
    calificacion: 0,
    comentario: '',
    fechaCompra: momento,
  }))
  agregarEntradas(entradas)

  // Copia de nombre y precio: si el precio cambia después, el pedido sigue valiendo lo pagado.
  const pedidosActuales = obtenerPedidos()
  let proximoPedido = siguienteId(pedidosActuales)
  const pedidos = candyLines.map((l) => ({
    id: proximoPedido++,
    usuario,
    productoId: l.id,
    nombre: l.nombre,
    precioUnitario: l.precio,
    cantidad: l.cantidad,
    horarioRetiro: `${funcion.fecha}T${funcion.hora}`,
    entradaId: entradas[0].id,
    numeroPedido: numeroCompra, // todas las líneas de la compra forman UN pedido
    retirado: false,
    fechaPedido: momento,
  }))
  if (pedidos.length > 0) guardarPedidos([...pedidos, ...pedidosActuales])

  return { numeroCompra, entradas, candy: candyLines, totales, metodoPago }
}
