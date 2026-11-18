// DATOS SIMULADOS (mock) de películas. Espejan la entidad Pelicula del backend.
//
// "peliculasIniciales" es la lista con la que arranca la app. El admin puede
// agregar películas, editarlas y darlas de baja (baja lógica: "activa: false").
// Como las páginas no comparten estado, la lista "real" se guarda en localStorage:
//   obtenerPeliculas()      → lee la lista guardada (o la inicial si no hay)
//   guardarPeliculas(lista) → guarda la lista completa
//
// "calificacionPromedio" no se guarda: se calcula a partir de las calificaciones
// de las entradas (ver data/entradas.js → promedioPelicula), igual que el backend
// lo recalcula cada vez que un cliente califica.

import { leer, guardar } from './almacenamiento'
import { hoyISO, sumarDiasISO } from './formato'

const CLAVE = 'imoovie-peliculas'

export const peliculasIniciales = [
  {
    id: 1,
    titulo: 'La Última Función',
    genero: 'Drama',
    duracion: 112,
    clasificacion: 'PG',
    sinopsis: 'Un proyeccionista veterano lucha por salvar el cine de su barrio.',
    color: '#ff7a0a',
    imagen: '',
    fechaEstreno: sumarDiasISO(-3),
    activa: true,
  },
  {
    id: 2,
    titulo: 'Órbita Cero',
    genero: 'Ciencia ficción',
    duracion: 128,
    clasificacion: '13',
    sinopsis: 'Una tripulación queda a la deriva y tiene 48 horas para volver a casa.',
    color: '#3a86ff',
    imagen: '',
    fechaEstreno: sumarDiasISO(-30),
    activa: true,
  },
  {
    id: 3,
    titulo: 'Noche en la Pampa',
    genero: 'Suspenso',
    duracion: 104,
    clasificacion: '16',
    sinopsis: 'Un viaje por la ruta se convierte en una noche que nadie olvida.',
    color: '#8338ec',
    imagen: '',
    fechaEstreno: sumarDiasISO(-20),
    activa: true,
  },
  {
    id: 4,
    titulo: 'Mi Abuela, la Campeona',
    genero: 'Comedia',
    duracion: 96,
    clasificacion: 'G',
    sinopsis: 'A los 80 años, Rosa decide anotarse en el torneo de truco del pueblo.',
    color: '#06a77d',
    imagen: '',
    fechaEstreno: sumarDiasISO(-60),
    activa: true,
  },
  {
    id: 5,
    titulo: 'Madre Siniestra',
    genero: 'Terror',
    duracion: 93,
    clasificacion: '13',
    sinopsis: 'Una niña empieza a escuchar una voz que quiere ocupar el lugar de su madre.',
    color: '#e63946',
    imagen: '',
    fechaEstreno: sumarDiasISO(10),
    activa: true,
  },
]

// Estado de estreno según la fecha: "Próximamente" si todavía no se estrenó,
// "Estreno" si se estrenó hace menos de 14 días, y null en cualquier otro caso.
export function estadoEstreno(pelicula, hoy = hoyISO()) {
  if (!pelicula.fechaEstreno) return null
  if (pelicula.fechaEstreno > hoy) return 'Próximamente'
  if (pelicula.fechaEstreno >= sumarDiasISO(-14)) return 'Estreno'
  return null
}

export function obtenerPeliculas() {
  return leer(CLAVE, peliculasIniciales)
}

export function guardarPeliculas(lista) {
  guardar(CLAVE, lista)
}

// Opciones para el formulario del admin. Las clasificaciones son las del backend.
export const GENEROS = ['Drama', 'Comedia', 'Suspenso', 'Ciencia ficción', 'Terror', 'Animación', 'Acción']
export const CLASIFICACIONES = ['G', 'PG', '13', '16', '18']

// Colores del afiche: a cada película nueva se le asigna uno de esta lista.
export const COLORES = ['#ff7a0a', '#3a86ff', '#8338ec', '#06a77d', '#e63946', '#f4a261']

// Texto de la clasificación, para la página de la película.
export const CLASIFICACION_TEXTO = {
  G: 'Apta para todo público',
  PG: 'Se recomienda compañía de un adulto',
  13: 'Restringida menores de 13 años',
  16: 'Restringida menores de 16 años',
  18: 'Restringida menores de 18 años',
}
