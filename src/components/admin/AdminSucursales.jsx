// Pestaña "Sucursales" del panel de administración. Espeja /api/admin/sucursales:
// alta (POST), edición (PUT) y baja lógica (DELETE → activa = false).
// Una sucursal dada de baja deja de ofrecerse en la venta, pero no se borra.

import { useState } from 'react'
import { obtenerSucursales, guardarSucursales } from '../../data/sucursales'
import { siguienteId } from '../../data/formato'

const FORM_VACIO = { nombre: '', direccion: '', ciudad: '', telefono: '' }
const TELEFONO_MAX = 20

function validar(datos, lista, idEditado) {
  const errores = {}
  const nombre = datos.nombre.trim()

  if (nombre.length < 3) {
    errores.nombre = 'Ingresá el nombre de la sucursal (mínimo 3 caracteres).'
  } else if (lista.some((s) => s.id !== idEditado && s.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = 'Ya existe una sucursal con ese nombre.'
  }
  if (datos.direccion.trim().length < 5) {
    errores.direccion = 'Ingresá la dirección (mínimo 5 caracteres).'
  }
  if (datos.ciudad.trim() === '') {
    errores.ciudad = 'Ingresá la ciudad.'
  }
  if (datos.telefono.length > TELEFONO_MAX) {
    errores.telefono = `El teléfono no puede superar los ${TELEFONO_MAX} caracteres.`
  }
  return errores
}

function AdminSucursales() {
  const [lista, setLista] = useState(() => obtenerSucursales())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  const editando = editandoId !== null
  const cantidadActivas = lista.filter((s) => s.activa).length

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarSucursales(nueva)
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

  function handleEditar(sucursal) {
    setEditandoId(sucursal.id)
    setDatos({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad ?? '',
      telefono: sucursal.telefono ?? '',
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
      nombre: datos.nombre.trim(),
      direccion: datos.direccion.trim(),
      ciudad: datos.ciudad.trim(),
      telefono: datos.telefono.trim(),
    }

    if (editando) {
      actualizarLista(lista.map((s) => (s.id === editandoId ? { ...s, ...campos } : s)))
      setMensaje(`Se actualizó la sucursal "${campos.nombre}".`)
      cancelarEdicion()
      return
    }

    const nueva = { id: siguienteId(lista), ...campos, activa: true }
    actualizarLista([...lista, nueva])
    setMensaje(`Se agregó la sucursal "${nueva.nombre}".`)
    setDatos(FORM_VACIO)
  }

  // Baja lógica. Tiene que quedar al menos una sucursal activa para poder vender.
  function handleDarDeBaja(sucursal) {
    if (cantidadActivas === 1) {
      setErrores({})
      setMensaje('Tiene que quedar al menos una sucursal activa.')
      return
    }
    actualizarLista(lista.map((s) => (s.id === sucursal.id ? { ...s, activa: false } : s)))
    setMensaje(`La sucursal "${sucursal.nombre}" fue dada de baja.`)
    if (editandoId === sucursal.id) cancelarEdicion()
  }

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-sucursal">
        <h2 id="titulo-alta-sucursal" className="titulo-paso">
          {editando ? 'Editar sucursal' : 'Agregar sucursal'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="suc-nombre">Nombre</label>
            <input
              id="suc-nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              aria-invalid={errores.nombre ? 'true' : 'false'}
              aria-describedby={errores.nombre ? 'error-suc-nombre' : undefined}
            />
            {errores.nombre && (
              <p id="error-suc-nombre" className="error" role="alert">{errores.nombre}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="suc-direccion">Dirección</label>
            <input
              id="suc-direccion"
              name="direccion"
              type="text"
              value={datos.direccion}
              onChange={handleChange}
              aria-invalid={errores.direccion ? 'true' : 'false'}
              aria-describedby={errores.direccion ? 'error-suc-direccion' : undefined}
            />
            {errores.direccion && (
              <p id="error-suc-direccion" className="error" role="alert">{errores.direccion}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="suc-ciudad">Ciudad</label>
            <input
              id="suc-ciudad"
              name="ciudad"
              type="text"
              value={datos.ciudad}
              onChange={handleChange}
              aria-invalid={errores.ciudad ? 'true' : 'false'}
              aria-describedby={errores.ciudad ? 'error-suc-ciudad' : undefined}
            />
            {errores.ciudad && (
              <p id="error-suc-ciudad" className="error" role="alert">{errores.ciudad}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="suc-telefono">Teléfono (opcional)</label>
            <input
              id="suc-telefono"
              name="telefono"
              type="tel"
              maxLength={TELEFONO_MAX}
              value={datos.telefono}
              onChange={handleChange}
              aria-invalid={errores.telefono ? 'true' : 'false'}
              aria-describedby={errores.telefono ? 'error-suc-telefono' : undefined}
            />
            {errores.telefono && (
              <p id="error-suc-telefono" className="error" role="alert">{errores.telefono}</p>
            )}
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="hero-acciones">
            <button type="submit" className="boton">
              {editando ? 'Guardar cambios' : 'Agregar sucursal'}
            </button>
            {editando && (
              <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-sucursales">
        <h2 id="titulo-lista-sucursales" className="titulo-paso historial-titulo">
          Sucursales cargadas
        </h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {cantidadActivas} {cantidadActivas === 1 ? 'activa' : 'activas'}
        </p>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-sucursales" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de sucursales</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Dirección</th>
                <th scope="col">Ciudad</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.nombre}</th>
                  <td>{s.direccion}</td>
                  <td>{s.ciudad}</td>
                  <td>
                    <span className={`estado ${s.activa ? 'estado-activa' : 'estado-baja'}`}>
                      {s.activa ? 'Activa' : 'Dada de baja'}
                    </span>
                  </td>
                  <td>
                    {s.activa && (
                      <>
                        <button
                          type="button"
                          className="boton-texto"
                          aria-label={`Editar sucursal ${s.nombre}`}
                          onClick={() => handleEditar(s)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-texto"
                          aria-label={`Dar de baja sucursal ${s.nombre}`}
                          onClick={() => handleDarDeBaja(s)}
                        >
                          Dar de baja
                        </button>
                      </>
                    )}
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

export default AdminSucursales
