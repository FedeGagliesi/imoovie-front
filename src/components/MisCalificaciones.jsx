// Calificar películas y ver el historial de calificaciones (Parte 8a).
//
// El historial se guarda en localStorage (data/calificaciones.js), una lista
// por persona, así sobrevive aunque cambies de página o recargues.
// Cada elemento del historial es:
//   { id, peliculaId, estrellas, comentario, fecha }
// Hay UNA calificación por película: si volvés a calificarla, reemplaza la anterior.

import { useState } from 'react'
import { obtenerPeliculas } from '../data/peliculas'
import { obtenerCalificaciones, guardarCalificaciones } from '../data/calificaciones'
import { obtenerSesion } from '../data/sesion'
import { ahora } from '../data/formato'
import Estrellas from './Estrellas'
import EstrellasFijas from './EstrellasFijas'

function MisCalificaciones({ peliculaInicial }) {
  const sesion = obtenerSesion()
  const peliculas = obtenerPeliculas()
  // Para calificar solo se ofrecen las activas; el historial, en cambio,
  // busca el título entre TODAS (una película dada de baja sigue figurando).
  const peliculasActivas = peliculas.filter((p) => p.activa)
  // Cada usuario tiene su propia lista de calificaciones (ver data/calificaciones.js).
  const usuario = sesion ? sesion.usuario : 'anonimo'

  // Inicialización "perezosa": pasar una FUNCIÓN a useState hace que se ejecute
  // solo en el primer render. Si pasáramos obtenerCalificaciones(usuario) directo,
  // se leería el almacenamiento en cada render, aunque el resultado se descarte.
  const [historial, setHistorial] = useState(() => obtenerCalificaciones(usuario))

  const [peliculaId, setPeliculaId] = useState(peliculaInicial || peliculasActivas[0].id)
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Dato derivado: ¿ya había calificado la película elegida?
  const previa = historial.find((h) => h.peliculaId === peliculaId)

  // Actualiza el estado Y lo guarda en localStorage (siempre juntos).
  function actualizarHistorial(nuevo) {
    setHistorial(nuevo)
    guardarCalificaciones(usuario, nuevo)
  }

  function handlePelicula(e) {
    setPeliculaId(Number(e.target.value))
    setEstrellas(0)
    setComentario('')
    setError('')
    setMensaje('')
  }

  function handleGuardar(e) {
    e.preventDefault()
    setMensaje('')

    if (estrellas === 0) {
      setError('Elegí cuántas estrellas le das a la película.')
      return
    }

    const momento = ahora() // milisegundos desde 1970: sirve de id único y de fecha
    const nueva = {
      id: momento,
      peliculaId,
      estrellas,
      comentario: comentario.trim(),
      fecha: momento,
    }

    // Sacamos la calificación anterior de esta película (si había) y ponemos
    // la nueva primero: el historial queda ordenado de más nueva a más vieja.
    actualizarHistorial([nueva, ...historial.filter((h) => h.peliculaId !== peliculaId)])

    const titulo = peliculas.find((p) => p.id === peliculaId).titulo
    setMensaje(`¡Listo! Guardaste tu calificación de "${titulo}".`)
    setError('')
    setEstrellas(0)
    setComentario('')
  }

  function handleEliminar(id) {
    actualizarHistorial(historial.filter((h) => h.id !== id))
    setMensaje('')
  }

  return (
    <div className="contenedor-form">
      <h2 className="titulo-paso">Calificá una película</h2>

      <form onSubmit={handleGuardar} noValidate>
        <div className="campo">
          <label htmlFor="cal-pelicula">Película</label>
          <select id="cal-pelicula" value={peliculaId} onChange={handlePelicula}>
            {peliculasActivas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </select>
        </div>

        {previa && (
          <p className="aviso">
            Ya la calificaste con {previa.estrellas} ★. Si guardás de nuevo, se reemplaza tu
            calificación anterior.
          </p>
        )}

        {/* nombre="cal-estrellas": agrupa los 5 radios del selector */}
        <Estrellas nombre="cal-estrellas" valor={estrellas} onChange={setEstrellas} />

        <div className="campo">
          <label htmlFor="cal-comentario">Comentario (opcional)</label>
          <textarea
            id="cal-comentario"
            rows="3"
            maxLength={300}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <p className="contador">{comentario.length} / 300</p>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {mensaje && <p role="status">{mensaje}</p>}

        <button type="submit" className="boton">Guardar calificación</button>
      </form>

      <h2 className="titulo-paso historial-titulo">Tu historial</h2>

      {historial.length === 0 ? (
        <p>Todavía no calificaste ninguna película.</p>
      ) : (
        <ul className="historial">
          {historial.map((h) => {
            const pelicula = peliculas.find((p) => p.id === h.peliculaId)
            const titulo = pelicula ? pelicula.titulo : 'Película retirada'
            return (
              <li key={h.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>{titulo}</strong>
                  <EstrellasFijas valor={h.estrellas} />
                </div>
                {h.comentario && <p className="historial-comentario">“{h.comentario}”</p>}
                <div className="historial-pie">
                  <span>{new Date(h.fecha).toLocaleDateString('es-AR')}</span>
                  <button
                    type="button"
                    className="boton-texto"
                    aria-label={`Eliminar mi calificación de ${titulo}`}
                    onClick={() => handleEliminar(h.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MisCalificaciones
