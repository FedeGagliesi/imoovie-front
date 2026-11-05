// Página de inicio (ruta "/"): hero + carta de presentación + cartelera.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerPeliculas } from '../data/peliculas'
import PeliculaCard from '../components/PeliculaCard'
import FichaPelicula from '../components/FichaPelicula'
import { obtenerSesion } from '../data/sesion'
import { zonas } from '../data/usuarios'

// Los tres pasos que se muestran en la presentación. Es una lista de objetos
// que se recorre con .map(), igual que la cartelera de películas.
const PASOS = [
  {
    id: 1,
    numero: '01',
    titulo: 'Elegí tu función',
    texto: 'Filtrá por sucursal, película, día, horario y butacas libres.',
  },
  {
    id: 2,
    numero: '02',
    titulo: 'Elegí tu butaca',
    texto: 'Mirá el mapa de la sala y reservá exactamente donde querés sentarte.',
  },
  {
    id: 3,
    numero: '03',
    titulo: 'Sumá tu candy',
    texto: 'Pedí pochoclos y bebidas junto con tu entrada y retiralos en el mostrador.',
  },
]

function Landing() {
  // ¿Hay alguien con sesión iniciada? (null si no)
  const sesion = obtenerSesion()

  // Qué película tiene su ficha abierta (null = ninguna). Es un useState como
  // los de los formularios: al cambiar, la pantalla se actualiza sola.
  const [abierta, setAbierta] = useState(null)

  // La cartelera muestra solo las películas activas (el admin puede darlas de baja).
  const peliculasActivas = obtenerPeliculas().filter((p) => p.activa)

  return (
    <>
      {/* HERO: la presentación grande de arriba */}
      <section className="hero" aria-labelledby="hero-titulo">
        <h1 id="hero-titulo">Tu cine, sin vueltas.</h1>
        <p>Elegí tu película, reservá tu entrada y pasá por el candy.</p>
        <div className="hero-acciones">
          {/* Con sesión: acceso directo a la zona de la persona.
              Sin sesión: botón para ingresar. */}
          {sesion ? (
            <Link to={'/' + sesion.rol} className="boton">{zonas[sesion.rol].boton}</Link>
          ) : (
            <Link to="/login" className="boton">Ingresar</Link>
          )}
          <Link to="/contacto" className="boton boton-secundario">Contacto</Link>
        </div>
      </section>

      {/* CARTA DE PRESENTACIÓN: presenta la plataforma. A la izquierda el texto
          y a la derecha los tres pasos (en pantallas angostas quedan uno debajo del otro). */}
      <section className="presentacion" aria-labelledby="presentacion-titulo">
        <div className="presentacion-carta">
          <p className="presentacion-kicker">Carta de presentación</p>
          <h2 id="presentacion-titulo">Bienvenido a i-Moovie</h2>
          <p>
            i-Moovie es la plataforma de nuestro cine para que ir a ver una película sea simple
            de principio a fin. Desde acá podés mirar la cartelera, buscar la función que mejor
            te quede por sucursal, día y horario, y elegir tus butacas en el mapa de la sala.
          </p>
          <p>
            También podés sumar el candy antes de llegar, calificar las películas que viste y
            llevar tu historial. Y quienes atienden el mostrador usan la misma plataforma para
            vender entradas, entregar pedidos y mantener la cartelera al día.
          </p>
          <p>
            Nació como un proyecto de la materia Aplicaciones Interactivas (UADE) y lo
            construimos con muchas ganas. Esperamos que lo disfrutes.
          </p>
          <p className="firma">El equipo de i-Moovie</p>
          {/* La raya de la firma se agrega con CSS (::before) para que un lector de
              pantalla no lea un guion suelto. */}
          <Link to="/nosotros" className="enlace-texto">Conocé al equipo</Link>
        </div>

        {/* Una lista ordenada (<ol>): son pasos con un orden. El número grande
            es decorativo (aria-hidden) porque la lista ya los numera. */}
        <ol className="pasos">
          {PASOS.map((paso) => (
            <li key={paso.id} className="paso">
              <span className="paso-numero" aria-hidden="true">{paso.numero}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CARTELERA */}
      <section aria-labelledby="cartelera-titulo">
        <h2 id="cartelera-titulo">En cartelera</h2>
        <p className="cartelera-ayuda">Tocá una película para ver su duración, edad y sinopsis.</p>

        <div className="cartelera">
          {/* .map() recorre el array y devuelve UNA tarjeta por película.
              Es la forma de React de hacer un "for" dentro del JSX.

              key: React la necesita para distinguir un elemento de otro
              dentro de una lista. Debe ser única y estable (usamos el id). */}
          {peliculasActivas.map((pelicula) => (
            // onAbrir: le pasamos la función que guarda cuál película se tocó.
            <PeliculaCard key={pelicula.id} pelicula={pelicula} onAbrir={setAbierta} />
          ))}
        </div>
      </section>

      {/* La ficha solo existe mientras haya una película elegida (renderizado
          condicional con &&). Al cerrarla, onCerrar vuelve el estado a null y
          el <dialog> desaparece. El "?." de sesion?.rol evita un error si no
          hay sesión (sesion es null). */}
      {abierta && (
        <FichaPelicula
          key={abierta.id}
          pelicula={abierta}
          sesion={sesion}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </>
  )
}

export default Landing
