// Pestaña "Sucursales" del panel de administración (Parte 11).
//
// Mismo patrón que AdminPeliculas: listar, dar de alta con validación y
// dar de baja / reactivar. Una sucursal dada de baja deja de ofrecerse en
// la compra de entradas, pero no se borra (baja lógica).

import { useState } from 'react'
import { obtenerSucursales, guardarSucursales } from '../../data/sucursales'

const FORM_VACIO = { nombre: '', direccion: '' }

function validar(datos, lista) {
  const errores = {}
  const nombre = datos.nombre.trim()

  if (nombre.length < 3) {
    errores.nombre = 'Ingresá el nombre de la sucursal (mínimo 3 caracteres).'
  } else if (lista.some((s) => s.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = 'Ya existe una sucursal con ese nombre.'
  }

  if (datos.direccion.trim().length < 5) {
    errores.direccion = 'Ingresá la dirección (mínimo 5 caracteres).'
  }

  return errores
}

function AdminSucursales() {
  const [lista, setLista] = useState(() => obtenerSucursales())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [aviso, setAviso] = useState('')

  const cantidadActivas = lista.filter((s) => s.activa).length

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarSucursales(nueva)
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

    const nueva = {
      id: Math.max(0, ...lista.map((s) => s.id)) + 1,
      nombre: datos.nombre.trim(),
      direccion: datos.direccion.trim(),
      activa: true,
    }

    actualizarLista([...lista, nueva])
    setMensaje(`Se agregó la sucursal "${nueva.nombre}".`)
    setDatos(FORM_VACIO)
  }

  function handleToggle(sucursal) {
    setMensaje('')

    // Tiene que quedar al menos una sucursal activa para poder vender entradas.
    if (sucursal.activa && cantidadActivas === 1) {
      setAviso('Tiene que quedar al menos una sucursal activa.')
      return
    }

    setAviso('')
    actualizarLista(
      lista.map((s) => (s.id === sucursal.id ? { ...s, activa: !s.activa } : s)),
    )
  }

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-sucursal">
        <h2 id="titulo-alta-sucursal" className="titulo-paso">Agregar sucursal</h2>

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
              <p id="error-suc-nombre" className="error" role="alert">
                {errores.nombre}
              </p>
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
              <p id="error-suc-direccion" className="error" role="alert">
                {errores.direccion}
              </p>
            )}
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <button type="submit" className="boton">Agregar sucursal</button>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-sucursales">
        <h2 id="titulo-lista-sucursales" className="titulo-paso historial-titulo">
          Sucursales cargadas
        </h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {cantidadActivas} {cantidadActivas === 1 ? 'activa' : 'activas'}
        </p>

        {aviso && (
          <p className="error" role="alert">
            {aviso}
          </p>
        )}

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-sucursales" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de sucursales</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Dirección</th>
                <th scope="col">Estado</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.nombre}</th>
                  <td>{s.direccion}</td>
                  <td>
                    <span className={`estado ${s.activa ? 'estado-activa' : 'estado-baja'}`}>
                      {s.activa ? 'Activa' : 'Dada de baja'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="boton-texto"
                      aria-label={`${s.activa ? 'Dar de baja' : 'Reactivar'} sucursal ${s.nombre}`}
                      onClick={() => handleToggle(s)}
                    >
                      {s.activa ? 'Dar de baja' : 'Reactivar'}
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

export default AdminSucursales
