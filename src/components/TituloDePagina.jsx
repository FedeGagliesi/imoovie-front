// Actualiza el título de la pestaña del navegador según la página donde se está.
//
// Por qué importa (accesibilidad): el título es lo primero que lee un lector de
// pantalla al entrar a una página, y lo que se ve en las pestañas y el historial.
// En una app de una sola página el HTML es siempre el mismo, así que hay que
// cambiar el título "a mano" cada vez que cambia la ruta.
//
// useEffect: es un "efecto". Ejecuta código DESPUÉS de que React dibujó la
// pantalla, para tocar algo que está fuera de React (acá, document.title).
// La lista del final ([pathname]) dice CUÁNDO volver a ejecutarlo: solo cuando
// cambia la ruta, no en cada dibujo.
//
// Este componente no dibuja nada (devuelve null): existe solo por su efecto.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITULOS = {
  '/': 'Inicio',
  '/contacto': 'Contacto',
  '/nosotros': 'Quiénes somos',
  '/login': 'Ingresar',
  '/cliente': 'Mi cine',
  '/vendedor': 'Mostrador',
  '/admin': 'Panel admin',
  '/consultar': 'Consultar entrada',
  '/candy': 'Candy',
}

// Rutas con parámetros (/pelicula/3, /comprar/8): el título depende del prefijo.
const PREFIJOS = [
  ['/pelicula/', 'Película'],
  ['/comprar/', 'Comprar entradas'],
]

function TituloDePagina() {
  const { pathname } = useLocation()

  useEffect(() => {
    const prefijo = PREFIJOS.find(([p]) => pathname.startsWith(p))
    const nombre = TITULOS[pathname] || (prefijo ? prefijo[1] : 'Página no encontrada')
    document.title = nombre + ' · i-Moovie'
  }, [pathname])

  return null
}

export default TituloDePagina
