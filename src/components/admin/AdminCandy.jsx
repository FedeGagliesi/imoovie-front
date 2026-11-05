// Pestaña "Candy" del panel de administración (Parte 12).
//
// CRUD completo de productos de candy:
//   - Listar y Alta (con validación)
//   - Cambiar el precio de un producto (edición en la misma fila de la tabla)
//   - Dar de baja / reactivar (baja lógica: no se borra)

import { useState } from 'react'
import { obtenerProductos, guardarProductos } from '../../data/candy'
import { formatearPrecio } from '../../data/formato'

const FORM_VACIO = { nombre: '', descripcion: '', precio: '' }

// Devuelve el texto del error, o '' si el precio está bien. La usamos en el alta
// y en el cambio de precio para no repetir la regla.
function validarPrecio(texto) {
  const numero = Number(texto)
  if (texto === '' || !Number.isInteger(numero) || numero < 500 || numero > 50000) {
    return 'El precio debe ser un número entero entre 500 y 50.000.'
  }
  return ''
}

function validar(datos, lista) {
  const errores = {}
  const nombre = datos.nombre.trim()

  if (nombre.length < 3) {
    errores.nombre = 'Ingresá el nombre del producto (mínimo 3 caracteres).'
  } else if (lista.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = 'Ya existe un producto con ese nombre.'
  }

  if (datos.descripcion.trim().length < 3) {
    errores.descripcion = 'Ingresá una descripción breve (mínimo 3 caracteres).'
  }

  const errorPrecio = validarPrecio(datos.precio)
  if (errorPrecio) {
    errores.precio = errorPrecio
  }

  return errores
}

function AdminCandy() {
  const [lista, setLista] = useState(() => obtenerProductos())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensajeAlta, setMensajeAlta] = useState('')
  const [mensajeLista, setMensajeLista] = useState('')

  // Edición de precio: qué producto se está editando (null = ninguno) y el
  // valor que se está escribiendo. Solo UNA fila puede estar en edición a la vez.
  const [editandoId, setEditandoId] = useState(null)
  const [precioEditado, setPrecioEditado] = useState('')
  const [errorPrecio, setErrorPrecio] = useState('')

  const cantidadActivos = lista.filter((p) => p.activo).length

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarProductos(nueva)
  }

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
    setMensajeAlta('')
  }

  function handleSubmit(e) {
    e.preventDefault()

    const erroresEncontrados = validar(datos, lista)
    setErrores(erroresEncontrados)
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensajeAlta('')
      return
    }

    const nuevo = {
      id: Math.max(0, ...lista.map((p) => p.id)) + 1,
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      activo: true,
    }

    actualizarLista([...lista, nuevo])
    setMensajeAlta(`Se agregó "${nuevo.nombre}" al candy.`)
    setDatos(FORM_VACIO)
  }

  function handleEditar(producto) {
    setEditandoId(producto.id)
    setPrecioEditado(String(producto.precio))
    setErrorPrecio('')
    setMensajeLista('')
  }

  function handleCancelarEdicion() {
    setEditandoId(null)
    setErrorPrecio('')
  }

  function handleGuardarPrecio(producto) {
    const mensajeError = validarPrecio(precioEditado)
    if (mensajeError) {
      setErrorPrecio(mensajeError)
      return
    }

    // Cambiamos el precio de UN producto (copia modificada) y dejamos los demás igual.
    actualizarLista(
      lista.map((p) => (p.id === producto.id ? { ...p, precio: Number(precioEditado) } : p)),
    )
    setEditandoId(null)
    setErrorPrecio('')
    setMensajeLista(`Nuevo precio de "${producto.nombre}": ${formatearPrecio(Number(precioEditado))}.`)
  }

  function handleToggle(producto) {
    setMensajeLista('')
    actualizarLista(
      lista.map((p) => (p.id === producto.id ? { ...p, activo: !p.activo } : p)),
    )
  }

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-candy">
        <h2 id="titulo-alta-candy" className="titulo-paso">Agregar producto</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="candy-nombre">Nombre</label>
            <input
              id="candy-nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              aria-invalid={errores.nombre ? 'true' : 'false'}
              aria-describedby={errores.nombre ? 'error-candy-nombre' : undefined}
            />
            {errores.nombre && (
              <p id="error-candy-nombre" className="error" role="alert">
                {errores.nombre}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="candy-descripcion">Descripción</label>
            <input
              id="candy-descripcion"
              name="descripcion"
              type="text"
              value={datos.descripcion}
              onChange={handleChange}
              aria-invalid={errores.descripcion ? 'true' : 'false'}
              aria-describedby={errores.descripcion ? 'error-candy-descripcion' : undefined}
            />
            {errores.descripcion && (
              <p id="error-candy-descripcion" className="error" role="alert">
                {errores.descripcion}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="candy-precio">Precio ($)</label>
            <input
              id="candy-precio"
              name="precio"
              type="number"
              min="500"
              max="50000"
              value={datos.precio}
              onChange={handleChange}
              aria-invalid={errores.precio ? 'true' : 'false'}
              aria-describedby={errores.precio ? 'error-candy-precio' : undefined}
            />
            {errores.precio && (
              <p id="error-candy-precio" className="error" role="alert">
                {errores.precio}
              </p>
            )}
          </div>

          {mensajeAlta && <p role="status">{mensajeAlta}</p>}

          <button type="submit" className="boton">Agregar producto</button>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-candy">
        <h2 id="titulo-lista-candy" className="titulo-paso historial-titulo">
          Productos de candy
        </h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {cantidadActivos} {cantidadActivos === 1 ? 'activo' : 'activos'}
        </p>

        {mensajeLista && <p role="status">{mensajeLista}</p>}

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-candy" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de productos de candy</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Descripción</th>
                <th scope="col">Precio</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const enEdicion = editandoId === p.id
                return (
                  <tr key={p.id}>
                    <th scope="row">{p.nombre}</th>
                    <td>{p.descripcion}</td>
                    <td>
                      {/* Renderizado condicional dentro de la tabla: la celda
                          muestra el precio o un campo para editarlo */}
                      {enEdicion ? (
                        <>
                          <input
                            type="number"
                            className="input-precio"
                            min="500"
                            max="50000"
                            value={precioEditado}
                            onChange={(e) => setPrecioEditado(e.target.value)}
                            aria-label={`Nuevo precio de ${p.nombre}`}
                            aria-invalid={errorPrecio ? 'true' : 'false'}
                          />
                          {errorPrecio && (
                            <p className="error" role="alert">
                              {errorPrecio}
                            </p>
                          )}
                        </>
                      ) : (
                        formatearPrecio(p.precio)
                      )}
                    </td>
                    <td>
                      <span className={`estado ${p.activo ? 'estado-activa' : 'estado-baja'}`}>
                        {p.activo ? 'Activo' : 'Dado de baja'}
                      </span>
                    </td>
                    <td>
                      {enEdicion ? (
                        <div className="acciones-tabla">
                          <button
                            type="button"
                            className="boton-texto"
                            onClick={() => handleGuardarPrecio(p)}
                          >
                            Guardar
                          </button>
                          <button type="button" className="boton-texto" onClick={handleCancelarEdicion}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="acciones-tabla">
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`Cambiar precio de ${p.nombre}`}
                            onClick={() => handleEditar(p)}
                          >
                            Cambiar precio
                          </button>
                          <button
                            type="button"
                            className="boton-texto"
                            aria-label={`${p.activo ? 'Dar de baja' : 'Reactivar'} ${p.nombre}`}
                            onClick={() => handleToggle(p)}
                          >
                            {p.activo ? 'Dar de baja' : 'Reactivar'}
                          </button>
                        </div>
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

export default AdminCandy
