// PARTE 10 · Pestaña "Películas" del panel de administración (pages/Admin.jsx)
//
// CRUD simple:
//   - Listar:  tabla con todas las películas
//   - Alta:    formulario con validación
//   - Baja / reactivar: botón que alterna el estado "activa" de una película
// Una película dada de baja deja de verse en la cartelera y en la compra,
// pero no se borra: se puede reactivar.
//
// La lista se guarda en localStorage (obtenerPeliculas / guardarPeliculas),
// así los cambios se ven en el resto de las páginas.

import { useState } from 'react'
import {
  obtenerPeliculas,
  guardarPeliculas,
  GENEROS,
  CLASIFICACIONES,
  COLORES,
} from '../../data/peliculas'

const FORM_VACIO = {
  titulo: '',
  genero: GENEROS[0],
  duracion: '',
  clasificacion: CLASIFICACIONES[0],
  sinopsis: '',
}

// Devuelve un objeto con los errores (vacío = todo bien). Es una función común,
// igual que la del formulario de Contacto.
function validar(datos, lista) {
  const errores = {}
  const titulo = datos.titulo.trim()

  if (titulo.length < 2) {
    errores.titulo = 'Ingresá el título (mínimo 2 caracteres).'
  } else if (lista.some((p) => p.titulo.toLowerCase() === titulo.toLowerCase())) {
    // .some() devuelve true si AL MENOS UN elemento cumple la condición
    errores.titulo = 'Ya existe una película con ese título.'
  }

  const duracion = Number(datos.duracion)
  if (datos.duracion === '' || !Number.isInteger(duracion) || duracion < 30 || duracion > 300) {
    errores.duracion = 'La duración debe ser un número entero entre 30 y 300 minutos.'
  }

  if (datos.sinopsis.trim().length < 10) {
    errores.sinopsis = 'La sinopsis debe tener al menos 10 caracteres.'
  }

  return errores
}

function AdminPeliculas() {
  const [lista, setLista] = useState(() => obtenerPeliculas())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [aviso, setAviso] = useState('')

  const cantidadActivas = lista.filter((p) => p.activa).length

  // Actualiza el estado Y lo guarda, siempre juntos.
  function actualizarLista(nueva) {
    setLista(nueva)
    guardarPeliculas(nueva)
  }

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
    setMensaje('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setAviso('')

    const erroresEncontrados = validar(datos, lista)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensaje('')
      return
    }

    // Nuevo id = el mayor id actual + 1. Los "..." dentro de Math.max reparten
    // el array como argumentos sueltos: Math.max(1, 2, 3, 4). El 0 inicial
    // cubre el caso de una lista vacía.
    const nuevoId = Math.max(0, ...lista.map((p) => p.id)) + 1

    const nueva = {
      id: nuevoId,
      titulo: datos.titulo.trim(),
      genero: datos.genero,
      duracion: Number(datos.duracion),
      clasificacion: datos.clasificacion,
      sinopsis: datos.sinopsis.trim(),
      color: COLORES[nuevoId % COLORES.length],
      activa: true,
    }

    actualizarLista([...lista, nueva])
    setMensaje(`Se agregó "${nueva.titulo}" a la cartelera.`)
    setDatos(FORM_VACIO)
  }

  // Baja o reactivación: invierte el valor de "activa" de UNA película.
  function handleToggle(pelicula) {
    setMensaje('')

    // No dejamos la cartelera vacía: tiene que quedar al menos una activa.
    if (pelicula.activa && cantidadActivas === 1) {
      setAviso('Tiene que quedar al menos una película activa.')
      return
    }

    setAviso('')
    // Para cambiar UN elemento de una lista: recorremos con .map() y devolvemos
    // una copia modificada ({ ...p, activa: !p.activa }) solo de esa película;
    // las demás pasan sin cambios.
    actualizarLista(
      lista.map((p) => (p.id === pelicula.id ? { ...p, activa: !p.activa } : p)),
    )
  }

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta">
        <h2 id="titulo-alta" className="titulo-paso">Agregar película</h2>

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
              <p id="error-titulo" className="error" role="alert">
                {errores.titulo}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="genero">Género</label>
            <select id="genero" name="genero" value={datos.genero} onChange={handleChange}>
              {GENEROS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="duracion">Duración (minutos)</label>
            <input
              id="duracion"
              name="duracion"
              type="number"
              min="30"
              max="300"
              value={datos.duracion}
              onChange={handleChange}
              aria-invalid={errores.duracion ? 'true' : 'false'}
              aria-describedby={errores.duracion ? 'error-duracion' : undefined}
            />
            {errores.duracion && (
              <p id="error-duracion" className="error" role="alert">
                {errores.duracion}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="clasificacion">Clasificación</label>
            <select
              id="clasificacion"
              name="clasificacion"
              value={datos.clasificacion}
              onChange={handleChange}
            >
              {CLASIFICACIONES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="sinopsis">Sinopsis</label>
            <textarea
              id="sinopsis"
              name="sinopsis"
              rows="3"
              maxLength={200}
              value={datos.sinopsis}
              onChange={handleChange}
              aria-invalid={errores.sinopsis ? 'true' : 'false'}
              aria-describedby={errores.sinopsis ? 'error-sinopsis' : undefined}
            />
            {errores.sinopsis && (
              <p id="error-sinopsis" className="error" role="alert">
                {errores.sinopsis}
              </p>
            )}
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <button type="submit" className="boton">Agregar película</button>
        </form>
      </section>

      <section aria-labelledby="titulo-lista">
        <h2 id="titulo-lista" className="titulo-paso historial-titulo">Películas cargadas</h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {cantidadActivas} {cantidadActivas === 1 ? 'activa' : 'activas'}
        </p>

        {aviso && (
          <p className="error" role="alert">
            {aviso}
          </p>
        )}

        {/* En pantallas angostas la tabla se desplaza hacia el costado dentro de
            su contenedor, sin romper el ancho de la página. tabIndex={0} permite
            desplazarla con el teclado. */}
        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de películas</caption>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Género</th>
                <th scope="col">Duración</th>
                <th scope="col">Clasif.</th>
                <th scope="col">Estado</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.titulo}</th>
                  <td>{p.genero}</td>
                  <td>{p.duracion} min</td>
                  <td>{p.clasificacion}</td>
                  <td>
                    {/* El estado se dice con TEXTO, no solo con color */}
                    <span className={`estado ${p.activa ? 'estado-activa' : 'estado-baja'}`}>
                      {p.activa ? 'Activa' : 'Dada de baja'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="boton-texto"
                      aria-label={`${p.activa ? 'Dar de baja' : 'Reactivar'} ${p.titulo}`}
                      onClick={() => handleToggle(p)}
                    >
                      {p.activa ? 'Dar de baja' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default AdminPeliculas
