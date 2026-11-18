// Página de inicio (ruta "/"): hero + carta de presentación + cartelera.

import { useState } from 'react'
import { obtenerPeliculas, GENEROS, estadoEstreno } from '../data/peliculas'
import { obtenerFunciones, formatosDePelicula } from '../data/funciones'
import { obtenerEntradas, promedioPelicula } from '../data/entradas'
import PeliculaCard from '../components/PeliculaCard'

function Landing() {

  // La cartelera muestra solo las películas activas (el admin puede darlas de baja).
  const peliculasActivas = obtenerPeliculas().filter((p) => p.activa)

  // Filtro por género (GET /api/peliculas/genero/{genero} del backend). '' = todos.
  const [genero, setGenero] = useState('')
  const visibles = genero === '' ? peliculasActivas : peliculasActivas.filter((p) => p.genero === genero)

  // Calificación promedio de cada película, calculada con las entradas calificadas.
  const entradas = obtenerEntradas()
  const funciones = obtenerFunciones()

  return (
    <>
      {/* HERO: la presentación grande de arriba */}
      <section className="hero" aria-labelledby="hero-titulo">
        <h1 id="hero-titulo">Tu cine, sin vueltas.</h1>
        <p>Elegí tu película, reservá tu entrada y pasá por el candy.</p>
      </section>

      {/* CARTELERA */}
      <section aria-labelledby="cartelera-titulo">
        <h2 id="cartelera-titulo">En cartelera</h2>

        <div className="campo campo-filtro">
          <label htmlFor="cartelera-genero">Género</label>
          <select id="cartelera-genero" value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">Todos</option>
            {GENEROS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="cartelera">
          {/* .map() recorre el array y devuelve UNA tarjeta por película.
              Es la forma de React de hacer un "for" dentro del JSX.

              key: React la necesita para distinguir un elemento de otro
              dentro de una lista. Debe ser única y estable (usamos el id). */}
          {visibles.map((pelicula) => (
            <PeliculaCard
              key={pelicula.id}
              pelicula={pelicula}
              formatos={formatosDePelicula(pelicula.id, funciones)}
              estado={estadoEstreno(pelicula)}
              promedio={promedioPelicula(pelicula.id, entradas, funciones)}
            />
          ))}
        </div>
        {visibles.length === 0 && <p>No hay películas de ese género en cartelera.</p>}
      </section>
    </>
  )
}

export default Landing
