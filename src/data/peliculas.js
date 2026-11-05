// DATOS SIMULADOS (mock) de películas.
//
// "peliculasIniciales" es la lista con la que arranca la app. Pero el admin
// puede agregar películas y darlas de baja, y esos cambios tienen que verse
// en TODAS las páginas (landing, compra, calificaciones). Como las páginas
// no comparten estado, la lista "real" se guarda en localStorage:
//   obtenerPeliculas()    → lee la lista guardada (o la inicial si no hay)
//   guardarPeliculas(lista) → guarda la lista completa
// Así cualquier componente pide "las películas de hoy" con obtenerPeliculas().

import { leer, guardar } from './almacenamiento'

const CLAVE = 'imoovie-peliculas'

export const peliculasIniciales = [
  {
    id: 1,
    titulo: 'La Última Función',
    genero: 'Drama',
    duracion: 112,
    clasificacion: 'ATP',
    sinopsis: 'Un proyeccionista veterano lucha por salvar el cine de su barrio.',
    color: '#ff7a0a',
    activa: true,
  },
  {
    id: 2,
    titulo: 'Órbita Cero',
    genero: 'Ciencia ficción',
    duracion: 128,
    clasificacion: '+13',
    sinopsis: 'Una tripulación queda a la deriva y tiene 48 horas para volver a casa.',
    color: '#3a86ff',
    activa: true,
  },
  {
    id: 3,
    titulo: 'Noche en la Pampa',
    genero: 'Suspenso',
    duracion: 104,
    clasificacion: '+16',
    sinopsis: 'Un viaje por la ruta se convierte en una noche que nadie olvida.',
    color: '#8338ec',
    activa: true,
  },
  {
    id: 4,
    titulo: 'Mi Abuela, la Campeona',
    genero: 'Comedia',
    duracion: 96,
    clasificacion: 'ATP',
    sinopsis: 'A los 80 años, Rosa decide anotarse en el torneo de truco del pueblo.',
    color: '#06a77d',
    activa: true,
  },
]

export function obtenerPeliculas() {
  return leer(CLAVE, peliculasIniciales)
}

export function guardarPeliculas(lista) {
  guardar(CLAVE, lista)
}

// Opciones para el formulario del admin.
export const GENEROS = ['Drama', 'Comedia', 'Suspenso', 'Ciencia ficción', 'Terror', 'Animación', 'Acción']
export const CLASIFICACIONES = ['ATP', '+13', '+16', '+18']

// Colores del afiche: a cada película nueva se le asigna uno de esta lista.
export const COLORES = ['#ff7a0a', '#3a86ff', '#8338ec', '#06a77d', '#e63946', '#f4a261']
