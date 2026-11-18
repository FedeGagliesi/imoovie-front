// Funciones de formato y de fechas compartidas por varias páginas.

// Momento actual en milisegundos desde 1970. Cambia en cada llamada, por eso
// SOLO se pide dentro de manejadores de eventos (al hacer clic o enviar un
// formulario), nunca mientras el componente se dibuja.
export function ahora() {
  return Date.now()
}

// Fecha de hoy como "AAAA-MM-DD" en hora local. "sv-SE" es el formato que usan
// los <input type="date">, así que se puede comparar como texto.
export function hoyISO() {
  return new Date().toLocaleDateString('sv-SE')
}

// Fecha ISO de dentro de N días (N puede ser 0 o negativo).
export function sumarDiasISO(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toLocaleDateString('sv-SE')
}

// Une una fecha "2026-11-06" y una hora "18:30" en milisegundos.
// Sin "Z" al final, JavaScript usa la hora local, que es la que queremos.
export function fechaHoraMs(fecha, hora) {
  return new Date(`${fecha}T${hora}`).getTime()
}

// Número de compra simulado, por ejemplo "IM-483920". Usa un número al azar,
// así que solo se pide dentro de manejadores de eventos.
export function generarNumeroCompra() {
  return 'IM-' + Math.floor(100000 + Math.random() * 900000)
}

// Código QR único de cada entrada (como el UUID del backend).
// randomUUID existe en navegadores modernos; si no, usamos un respaldo.
export function generarCodigoQR() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'qr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

// Siguiente id disponible para una lista: el mayor id actual + 1.
export function siguienteId(lista) {
  return Math.max(0, ...lista.map((x) => x.id)) + 1
}

// Convierte una fecha "2026-11-06" en un texto legible: "Vie 6/11".
// Le agregamos "T00:00:00" para que JavaScript la interprete en la hora local
// (sin eso, a veces mostraría el día anterior por la zona horaria).
export function formatearDia(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00')
  const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
  return dia.charAt(0).toUpperCase() + dia.slice(1) + ' ' + fecha.getDate() + '/' + (fecha.getMonth() + 1)
}

// Fecha y hora de un momento en milisegundos: "Vie 6/11 · 18:30"
export function formatearFechaHora(ms) {
  const fecha = new Date(ms)
  return formatearDia(fecha.toLocaleDateString('sv-SE')) + ' · ' + horaDe(ms)
}

// ¿Esta fecha (en milisegundos) es de hoy? toDateString() da algo como
// "Wed Nov 05 2026", así comparamos solo el día e ignoramos la hora.
export function esHoy(fecha) {
  return new Date(fecha).toDateString() === new Date().toDateString()
}

// Hora de una fecha en milisegundos: "10:35"
export function formatearHora(fecha) {
  return horaDe(fecha)
}

// Formatea un número como pesos: 13000 → "$ 13.000"
export function formatearPrecio(valor) {
  return '$ ' + valor.toLocaleString('es-AR')
}

// Día corto para la franja de fechas: "2026-11-13" → { dia: 'VIE', numero: '13/11' }
export function diaCorto(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00')
  const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase()
  const numero = String(fecha.getDate()).padStart(2, '0') + '/' + String(fecha.getMonth() + 1).padStart(2, '0')
  return { dia, numero }
}

// Hora de una fecha en milisegundos, en formato de 24 horas: "18:30" (como en la cartelera).
export function horaDe(ms) {
  const fecha = new Date(ms)
  return String(fecha.getHours()).padStart(2, '0') + ':' + String(fecha.getMinutes()).padStart(2, '0')
}

// Duración en minutos → "1h 55m" (como en la cartelera de referencia)
export function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return `${horas}h ${String(resto).padStart(2, '0')}m`
}

// Número de pedido de candy, por ejemplo "PD-483920". Como generarNumeroCompra(),
// solo se pide dentro de manejadores de eventos.
export function generarNumeroPedido() {
  return 'PD-' + Math.floor(100000 + Math.random() * 900000)
}
