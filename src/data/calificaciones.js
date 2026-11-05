// CALIFICACIONES de películas, guardadas en localStorage.
//
// Cada cliente tiene su propia lista, así no se mezclan los historiales:
// la clave incluye el nombre de usuario ("imoovie-calificaciones-cliente").
//
// Cada calificación es: { id, peliculaId, estrellas, comentario, fecha }
// y hay UNA por película y por persona.

import { leer, guardar } from './almacenamiento'

function claveDe(usuario) {
  return 'imoovie-calificaciones-' + usuario
}

export function obtenerCalificaciones(usuario) {
  return leer(claveDe(usuario), [])
}

export function guardarCalificaciones(usuario, lista) {
  guardar(claveDe(usuario), lista)
}
