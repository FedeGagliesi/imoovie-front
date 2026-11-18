// FUNCIONES (mock). Espejan la entidad Funcion del backend: una película, en una
// sala, un día y una hora, con un precio y sus opciones (idioma, subtítulos,
// doblaje y accesibilidad).
//
//   peliculaId → conecta con una película (data/peliculas.js)
//   salaId     → conecta con una sala (data/salas.js); la sala dice la sucursal
// Es la misma idea que una clave foránea en una base de datos.
//
// La lista "real" vive en localStorage: obtenerFunciones() / guardarFunciones(lista).
//
// Reglas del backend que se copian acá:
//   - Una sala no puede tener dos funciones solapadas. El intervalo ocupado va
//     desde el horario de inicio hasta inicio + duración + 15 minutos de limpieza.
//   - No se programan funciones con horario pasado.
//   - Una función "comenzó" cuando llega su horario: ya no se vende ni se reprograma.
//   - Dar de baja una función es baja lógica (activa: false).

import { leer, guardar } from './almacenamiento'
import { formatearDia, fechaHoraMs, sumarDiasISO, ahora, horaDe } from './formato'

const CLAVE = 'imoovie-funciones'

export const MINUTOS_ENTRE_FUNCIONES = 15
export const IDIOMAS = ['Español', 'Inglés', 'Portugués']
// Formato de proyección de la función: lo elige el cliente junto con el horario.
export const FORMATOS = ['2D', '3D', '4D', 'VIP']

// Las funciones de ejemplo se programan a partir de HOY, así siempre hay funciones
// a la venta (si las fechas fueran fijas, quedarían en el pasado).
export const funcionesIniciales = [
  { id: 1, peliculaId: 1, salaId: 1, fecha: sumarDiasISO(1), hora: '18:30', idioma: 'Español', precio: 6500, conSubtitulos: true, conDoblaje: false, conAccesibilidad: false, formato: '2D', activa: true },
  { id: 2, peliculaId: 2, salaId: 2, fecha: sumarDiasISO(1), hora: '20:00', idioma: 'Inglés', precio: 7500, conSubtitulos: true, conDoblaje: false, conAccesibilidad: false, formato: '3D', activa: true },
  { id: 3, peliculaId: 3, salaId: 3, fecha: sumarDiasISO(2), hora: '23:00', idioma: 'Español', precio: 7500, conSubtitulos: false, conDoblaje: false, conAccesibilidad: true, formato: 'VIP', activa: true },
  { id: 4, peliculaId: 4, salaId: 1, fecha: sumarDiasISO(2), hora: '16:00', idioma: 'Español', precio: 6000, conSubtitulos: false, conDoblaje: true, conAccesibilidad: false, formato: '2D', activa: true },
  { id: 5, peliculaId: 1, salaId: 4, fecha: sumarDiasISO(3), hora: '21:00', idioma: 'Español', precio: 7500, conSubtitulos: false, conDoblaje: false, conAccesibilidad: false, formato: '4D', activa: true },
  { id: 6, peliculaId: 2, salaId: 5, fecha: sumarDiasISO(4), hora: '17:15', idioma: 'Inglés', precio: 6500, conSubtitulos: true, conDoblaje: false, conAccesibilidad: false, formato: '3D', activa: true },
  { id: 7, peliculaId: 3, salaId: 4, fecha: sumarDiasISO(4), hora: '21:30', idioma: 'Español', precio: 7500, conSubtitulos: false, conDoblaje: false, conAccesibilidad: false, formato: '2D', activa: true },
  { id: 8, peliculaId: 4, salaId: 5, fecha: sumarDiasISO(5), hora: '15:30', idioma: 'Español', precio: 6000, conSubtitulos: false, conDoblaje: false, conAccesibilidad: true, formato: 'VIP', activa: true },
]

// Las funciones guardadas antes de existir el formato se leen como 2D.
export function obtenerFunciones() {
  return leer(CLAVE, funcionesIniciales).map((f) => ({ formato: '2D', ...f }))
}

export function guardarFunciones(lista) {
  guardar(CLAVE, lista)
}

// Momento de inicio de una función, en milisegundos.
export function inicioFuncion(funcion) {
  return fechaHoraMs(funcion.fecha, funcion.hora)
}

// ¿Ya llegó el horario de la función? Una función que comenzó no se vende,
// no se reprograma ni se cancela; solo se puede calificar.
export function haComenzado(funcion) {
  return inicioFuncion(funcion) <= ahora()
}

// Texto corto de una función: "Vie 6/11 · 18:30 · 3D" (y "· Sala 1" si se pasa la sala).
export function etiquetaFuncion(funcion, sala) {
  const base = `${formatearDia(funcion.fecha)} · ${funcion.hora} · ${funcion.formato ?? '2D'}`
  return sala ? `${base} · ${sala.nombre}` : base
}

// Devuelve un mensaje de error si la función se solapa con otra de la misma sala,
// o '' si el horario está libre. "excluirId" evita que una función choque consigo
// misma cuando se la edita.
export function errorSolapamiento(lista, peliculas, { salaId, fecha, hora, peliculaId, excluirId }) {
  const duracionNueva = peliculas.find((p) => p.id === Number(peliculaId))?.duracion ?? 0
  const inicio = fechaHoraMs(fecha, hora)
  const fin = inicio + (duracionNueva + MINUTOS_ENTRE_FUNCIONES) * 60000

  for (const existente of lista) {
    if (existente.salaId !== Number(salaId) || !existente.activa || existente.id === excluirId) continue
    const duracion = peliculas.find((p) => p.id === existente.peliculaId)?.duracion ?? 0
    const inicioExistente = inicioFuncion(existente)
    const finExistente = inicioExistente + (duracion + MINUTOS_ENTRE_FUNCIONES) * 60000
    if (inicio < finExistente && inicioExistente < fin) {
      const fin = horaDe(finExistente)
      return `La sala ya tiene una función el ${etiquetaFuncion(existente)} que termina a las ${fin} (con limpieza).`
    }
  }
  return ''
}

// Funciones de una película que todavía se pueden comprar (activas y no comenzadas).
export function funcionesVigentes(peliculaId, funciones) {
  return funciones.filter((f) => f.peliculaId === peliculaId && f.activa && !haComenzado(f))
}

// Formatos disponibles de una película, en el orden de FORMATOS (ej. ['2D', 'VIP']).
export function formatosDePelicula(peliculaId, funciones) {
  const usados = new Set(funcionesVigentes(peliculaId, funciones).map((f) => f.formato ?? '2D'))
  return FORMATOS.filter((f) => usados.has(f))
}
