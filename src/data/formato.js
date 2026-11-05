// Funciones de formato compartidas por varias páginas.

// Momento actual en milisegundos desde 1970. Cambia en cada llamada, por eso
// SOLO se pide dentro de manejadores de eventos (al hacer clic o enviar un
// formulario), nunca mientras el componente se dibuja.
export function ahora() {
  return Date.now()
}

// Número de entrada simulado, por ejemplo "IM-483920". Usa un número al azar,
// así que (igual que ahora()) solo se pide dentro de manejadores de eventos.
export function generarNumeroEntrada() {
  return 'IM-' + Math.floor(100000 + Math.random() * 900000)
}

// Convierte una fecha "2026-11-06" en un texto legible: "Vie 6/11".
// Le agregamos "T00:00:00" para que JavaScript la interprete en la hora local
// (sin eso, a veces mostraría el día anterior por la zona horaria).
export function formatearDia(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00')
  const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
  return dia.charAt(0).toUpperCase() + dia.slice(1) + ' ' + fecha.getDate() + '/' + (fecha.getMonth() + 1)
}

// ¿Esta fecha (en milisegundos) es de hoy? toDateString() da algo como
// "Wed Nov 05 2026", así comparamos solo el día e ignoramos la hora.
export function esHoy(fecha) {
  return new Date(fecha).toDateString() === new Date().toDateString()
}

// Hora de una fecha en milisegundos: "10:35"
export function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

// Formatea un número como pesos: 13000 → "$ 13.000"
export function formatearPrecio(valor) {
  return '$ ' + valor.toLocaleString('es-AR')
}
