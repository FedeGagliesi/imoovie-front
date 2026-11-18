// BÚSQUEDA DE FUNCIONES
//
// Funciones comunes (no son componentes) que arman la lista de funciones que
// se pueden comprar y la filtran según lo que eligió la persona. Separar esto
// del componente deja al buscador solo con la tarea de dibujar.
//
// Los filtros siguen los parámetros de GET /api/funciones del backend
// (película, sala, idioma, subtítulos, doblaje, accesibilidad y solo con butacas libres),
// más sucursal, día, franja horaria, precio y orden, que son de la interfaz.

import { butacasLibres } from './entradas'
import { haComenzado } from './funciones'

// Valores iniciales de los filtros: '' significa "sin filtrar por este criterio".
export const FILTROS_VACIOS = {
  sucursal: '',
  pelicula: '',
  formato: '',
  dia: '',
  franja: '',
  idioma: '',
  subtitulos: '',
  doblaje: '',
  accesibilidad: '',
  asientos: '',
  precioMax: '',
  orden: 'horario',
}

// Franjas horarias: "desde" incluido y "hasta" excluido (en horas).
export const FRANJAS = [
  { valor: 'manana', nombre: 'Mañana (antes de las 12:00)', desde: 0, hasta: 12 },
  { valor: 'tarde', nombre: 'Tarde (12:00 a 18:59)', desde: 12, hasta: 19 },
  { valor: 'noche', nombre: 'Noche (19:00 en adelante)', desde: 19, hasta: 24 },
]

export const OPCIONES_ASIENTOS = [
  { valor: '', nombre: 'Cualquiera' },
  { valor: '1', nombre: 'Con lugar (1 o más)' },
  { valor: '2', nombre: '2 o más' },
  { valor: '4', nombre: '4 o más' },
  { valor: '6', nombre: '6 o más' },
]

// Para los filtros de "sí / no": si se elige "Sí", solo se muestran las funciones con esa opción.
export const OPCIONES_SI = [
  { valor: '', nombre: 'Indistinto' },
  { valor: 'si', nombre: 'Sí' },
]

export const OPCIONES_ORDEN = [
  { valor: 'horario', nombre: 'Más próximas primero' },
  { valor: 'precio', nombre: 'Precio: menor a mayor' },
  { valor: 'asientos', nombre: 'Más butacas libres primero' },
]

// Arma una fila por cada función que se puede comprar, con todo lo necesario
// para mostrarla. Se descartan las funciones dadas de baja, las que ya comenzaron,
// y las de películas, salas o sucursales dadas de baja.
export function armarResultados({ funciones, peliculas, sucursales, salas, entradas }) {
  const resultados = []

  funciones.forEach((funcion) => {
    if (!funcion.activa || haComenzado(funcion)) return
    const pelicula = peliculas.find((p) => p.id === funcion.peliculaId)
    const sala = salas.find((s) => s.id === funcion.salaId)
    const sucursal = sala && sucursales.find((s) => s.id === sala.sucursalId)
    if (!pelicula || !pelicula.activa || !sala || !sala.activa || !sucursal || !sucursal.activa) {
      return // salta a la siguiente función
    }
    const libres = butacasLibres(funcion, sala, entradas).length
    resultados.push({ funcion, pelicula, sucursal, sala, libres, total: sala.butacas.length })
  })

  return resultados
}

// Lista de días (únicos y ordenados) en los que hay funciones, para el filtro "Día".
export function diasDisponibles(resultados) {
  // Set saca los repetidos; sort() ordena el texto "AAAA-MM-DD" cronológicamente.
  return [...new Set(resultados.map((r) => r.funcion.fecha))].sort()
}

// Se queda con los resultados que cumplen TODOS los filtros elegidos y los ordena.
export function filtrarResultados(resultados, filtros) {
  const encontrados = resultados.filter(({ funcion, sala, libres }) => {
    if (filtros.sucursal !== '' && sala.sucursalId !== Number(filtros.sucursal)) return false
    if (filtros.formato !== '' && funcion.formato !== filtros.formato) return false
    if (filtros.pelicula !== '' && funcion.peliculaId !== Number(filtros.pelicula)) return false
    if (filtros.dia !== '' && funcion.fecha !== filtros.dia) return false

    if (filtros.franja !== '') {
      const franja = FRANJAS.find((f) => f.valor === filtros.franja)
      const hora = Number(funcion.hora.slice(0, 2)) // "18:30" → 18
      if (hora < franja.desde || hora >= franja.hasta) return false
    }

    if (filtros.idioma !== '' && funcion.idioma !== filtros.idioma) return false
    if (filtros.subtitulos === 'si' && !funcion.conSubtitulos) return false
    if (filtros.doblaje === 'si' && !funcion.conDoblaje) return false
    if (filtros.accesibilidad === 'si' && !funcion.conAccesibilidad) return false

    if (filtros.asientos !== '' && libres < Number(filtros.asientos)) return false
    if (filtros.precioMax !== '' && funcion.precio > Number(filtros.precioMax)) return false

    return true // pasó todos los filtros
  })

  // Cada criterio de orden es una función de comparación: devuelve un número
  // negativo si "a" va antes que "b", positivo si va después, y 0 si empatan.
  const comparar = {
    horario: (a, b) => (a.funcion.fecha + a.funcion.hora).localeCompare(b.funcion.fecha + b.funcion.hora),
    precio: (a, b) => a.funcion.precio - b.funcion.precio,
    asientos: (a, b) => b.libres - a.libres,
  }

  // .filter() ya devolvió un array NUEVO, así que ordenarlo no toca al original.
  return encontrados.sort(comparar[filtros.orden])
}
