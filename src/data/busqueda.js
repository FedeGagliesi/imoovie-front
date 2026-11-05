// BÚSQUEDA DE FUNCIONES
//
// Funciones comunes (no son componentes) que arman la lista de funciones que
// se pueden comprar y la filtran según lo que eligió la persona. Separar esto
// del componente deja al buscador solo con la tarea de dibujar.

import { butacasNoDisponibles, TOTAL_BUTACAS } from './funciones'
import { obtenerCompras } from './compras'

// Valores iniciales de los filtros: '' significa "sin filtrar por este criterio".
export const FILTROS_VACIOS = {
  sucursal: '',
  pelicula: '',
  dia: '',
  franja: '',
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

export const OPCIONES_ORDEN = [
  { valor: 'horario', nombre: 'Más próximas primero' },
  { valor: 'precio', nombre: 'Precio: menor a mayor' },
  { valor: 'asientos', nombre: 'Más butacas libres primero' },
]

// Arma una fila por cada función que se puede comprar, con todo lo necesario
// para mostrarla: la función, su película, su sucursal y las butacas libres.
// Se descartan las funciones de películas o sucursales dadas de baja.
export function armarResultados({ funciones, peliculas, sucursales }) {
  const compras = obtenerCompras() // se lee una sola vez para todas las funciones
  const resultados = []

  funciones.forEach((funcion) => {
    const pelicula = peliculas.find((p) => p.id === funcion.peliculaId)
    const sucursal = sucursales.find((s) => s.id === funcion.sucursalId)
    if (!pelicula || !pelicula.activa || !sucursal || !sucursal.activa) {
      return // salta a la siguiente función
    }
    const libres = TOTAL_BUTACAS - butacasNoDisponibles(funcion.id, compras).length
    resultados.push({ funcion, pelicula, sucursal, libres })
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
  const encontrados = resultados.filter(({ funcion, libres }) => {
    if (filtros.sucursal !== '' && funcion.sucursalId !== Number(filtros.sucursal)) return false
    if (filtros.pelicula !== '' && funcion.peliculaId !== Number(filtros.pelicula)) return false
    if (filtros.dia !== '' && funcion.fecha !== filtros.dia) return false

    if (filtros.franja !== '') {
      const franja = FRANJAS.find((f) => f.valor === filtros.franja)
      const hora = Number(funcion.hora.slice(0, 2)) // "18:30" → 18
      if (hora < franja.desde || hora >= franja.hasta) return false
    }

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
