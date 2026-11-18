// Pestaña "Películas" del panel de administración. Espeja los endpoints
// /api/admin/peliculas del backend:
//   - Alta (POST), edición (PUT) y baja lógica (DELETE → activa = false).
//   - Listar con la calificación promedio que calculan las entradas.
//
// Una película dada de baja deja de verse en la cartelera, pero no se borra.

import { useState } from 'react'
import {
  obtenerPeliculas,
  guardarPeliculas,
  GENEROS,
  CLASIFICACIONES,
  COLORES,
} from '../../data/peliculas'
import { obtenerEntradas, promedioPelicula } from '../../data/entradas'
import { obtenerFunciones } from '../../data/funciones'
import { siguienteId } from '../../data/formato'

const FORM_VACIO = {
  titulo: '',
  genero: GENEROS[0],
  duracion: '',
  clasificacion: CLASIFICACIONES[0],
  sinopsis: '',
  imagen: '',
  fechaEstreno: '',
}

// Devuelve un objeto con los errores (vacío = todo bien). Las reglas son las del
// backend (PeliculaDTO): título 1–200, género requerido, duración > 0, sinopsis ≤ 1000.
function validar(datos, lista, idEditado) {
  const errores = {}
  const titulo = datos.titulo.trim()

  if (titulo.length < 1 || titulo.length > 200) {
    errores.titulo = 'Ingresá el título (entre 1 y 200 caracteres).'
  } else if (lista.some((p) => p.id !== idEditado && p.titulo.toLowerCase() === titulo.toLowerCase())) {
    // .some() devuelve true si AL MENOS UN elemento cumple la condición
    errores.titulo = 'Ya existe una película con ese título.'
  }

  const duracion = Number(datos.duracion)
  if (datos.duracion === '' || !Number.isInteger(duracion) || duracion < 1) {
    errores.duracion = 'La duración debe ser un número entero de minutos, mayor a 0.'
  }

  if (datos.sinopsis.trim().length > 1000) {
    errores.sinopsis = 'La sinopsis no puede superar los 1000 caracteres.'
  }

  // La imagen es opcional, pero si se carga tiene que ser una URL http o https.
  if (datos.imagen.trim() !== '' && !/^https?:\/\//.test(datos.imagen.trim())) {
    errores.imagen = 'La imagen tiene que ser una URL que empiece con http:// o https://'
  }

  return errores
}

function AdminPeliculas() {
  const [lista, setLista] = useState(() => obtenerPeliculas())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  // id de la película que se está editando (null = alta de una nueva)
  const [editandoId, setEditandoId] = useState(null)

  const entradas = obtenerEntradas()
  const funciones = obtenerFunciones()

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarPeliculas(nueva)
  }

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
    setMensaje('')
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setDatos(FORM_VACIO)
    setErrores({})
  }

  // Carga los datos de una película en el formulario para editarla.
  function handleEditar(pelicula) {
    setEditandoId(pelicula.id)
    setDatos({
      titulo: pelicula.titulo,
      genero: pelicula.genero,
      duracion: String(pelicula.duracion),
      clasificacion: pelicula.clasificacion,
      sinopsis: pelicula.sinopsis ?? '',
      imagen: pelicula.imagen ?? '',
      fechaEstreno: pelicula.fechaEstreno ?? '',
    })
    setErrores({})
    setMensaje('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const erroresEncontrados = validar(datos, lista, editandoId)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensaje('')
      return
    }

    const campos = {
      titulo: datos.titulo.trim(),
      genero: datos.genero,
      duracion: Number(datos.duracion),
      clasificacion: datos.clasificacion,
      sinopsis: datos.sinopsis.trim(),
      imagen: datos.imagen.trim(),
      fechaEstreno: datos.fechaEstreno,
    }

    if (editandoId !== null) {
      // Cambia los campos de UNA película y deja las demás iguales.
      actualizarLista(lista.map((p) => (p.id === editandoId ? { ...p, ...campos } : p)))
      setMensaje(`Se actualizó "${campos.titulo}".`)
      cancelarEdicion()
      return
    }

    const nuevoId = siguienteId(lista)
    const nueva = {
      id: nuevoId,
      ...campos,
      color: COLORES[nuevoId % COLORES.length],
      activa: true,
    }
    actualizarLista([...lista, nueva])
    setMensaje(`Se agregó "${nueva.titulo}" a la cartelera.`)
    setDatos(FORM_VACIO)
  }

  // Baja lógica (DELETE del backend): la película deja de ofrecerse, no se borra.
  function handleDarDeBaja(pelicula) {
    actualizarLista(lista.map((p) => (p.id === pelicula.id ? { ...p, activa: false } : p)))
    setMensaje(`"${pelicula.titulo}" fue dada de baja.`)
    if (editandoId === pelicula.id) cancelarEdicion()
  }

  const editando = editandoId !== null

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta">
        <h2 id="titulo-alta" className="titulo-paso">
          {editando ? 'Editar película' : 'Agregar película'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              value={datos.titulo}
              onChange={handleChange}
              aria-invalid={errores.titulo ? 'true' : 'false'}
              aria-describedby={errores.titulo ? 'error-titulo' : undefined}
            />
            {errores.titulo && (
              <p id="error-titulo" className="error" role="alert">{errores.titulo}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="genero">Género</label>
            <select id="genero" name="genero" value={datos.genero} onChange={handleChange}>
              {GENEROS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="duracion">Duración (minutos)</label>
            <input
              id="duracion"
              name="duracion"
              type="number"
              min="1"
              value={datos.duracion}
              onChange={handleChange}
              aria-invalid={errores.duracion ? 'true' : 'false'}
              aria-describedby={errores.duracion ? 'error-duracion' : undefined}
            />
            {errores.duracion && (
              <p id="error-duracion" className="error" role="alert">{errores.duracion}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="clasificacion">Clasificación</label>
            <select id="clasificacion" name="clasificacion" value={datos.clasificacion} onChange={handleChange}>
              {CLASIFICACIONES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="sinopsis">Sinopsis (opcional)</label>
            <textarea
              id="sinopsis"
              name="sinopsis"
              rows={3}
              maxLength={1000}
              value={datos.sinopsis}
              onChange={handleChange}
              aria-invalid={errores.sinopsis ? 'true' : 'false'}
              aria-describedby={errores.sinopsis ? 'error-sinopsis' : undefined}
            />
            {errores.sinopsis && (
              <p id="error-sinopsis" className="error" role="alert">{errores.sinopsis}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="imagen">Imagen del afiche (URL, opcional)</label>
            <input
              id="imagen"
              name="imagen"
              type="url"
              placeholder="https://..."
              value={datos.imagen}
              onChange={handleChange}
              aria-invalid={errores.imagen ? 'true' : 'false'}
              aria-describedby={errores.imagen ? 'error-imagen' : undefined}
            />
            {errores.imagen && (
              <p id="error-imagen" className="error" role="alert">{errores.imagen}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="fecha-estreno">Fecha de estreno (opcional)</label>
            <input id="fecha-estreno" name="fechaEstreno" type="date" value={datos.fechaEstreno} onChange={handleChange} />
            <p className="resultado-datos">Si es futura se muestra "Próximamente"; si fue hace menos de 14 días, "Estreno".</p>
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="hero-acciones">
            <button type="submit" className="boton">
              {editando ? 'Guardar cambios' : 'Agregar película'}
            </button>
            {editando && (
              <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-lista">
        <h2 id="titulo-lista" className="titulo-paso historial-titulo">Películas cargadas</h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {lista.filter((p) => p.activa).length} activas
        </p>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de películas</caption>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Género</th>
                <th scope="col">Duración</th>
                <th scope="col">Clasif.</th>
                <th scope="col">Calificación</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const promedio = promedioPelicula(p.id, entradas, funciones)
                return (
                  <tr key={p.id}>
                    <th scope="row">{p.titulo}</th>
                    <td>{p.genero}</td>
                    <td>{p.duracion} min</td>
                    <td>{p.clasificacion}</td>
                    <td>{promedio > 0 ? `★ ${promedio}` : 'Sin calificar'}</td>
                    <td>
                      <span className={`estado ${p.activa ? 'estado-activa' : 'estado-baja'}`}>
                        {p.activa ? 'Activa' : 'Dada de baja'}
                      </span>
                    </td>
                    <td>
                      {p.activa && (
                        <>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Editar ${p.titulo}`}
                            onClick={() => handleEditar(p)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Dar de baja ${p.titulo}`}
                            onClick={() => handleDarDeBaja(p)}
                          >
                            Dar de baja
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default AdminPeliculas
