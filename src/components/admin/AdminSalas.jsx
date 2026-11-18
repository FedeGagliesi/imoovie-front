// Pestaña "Salas" del panel de administración. Espeja /api/admin/salas del backend:
//   - Alta (POST): al crear la sala se generan sus butacas solas.
//   - Edición (PUT): cambia nombre y capacidad. Como en el backend, NO vuelve a
//     generar las butacas: el mapa de la sala queda como se creó.
//   - Baja lógica (DELETE): la sala deja de ofrecerse para nuevas funciones.

import { useState } from 'react'
import { obtenerSalas, guardarSalas, crearSala } from '../../data/salas'
import { obtenerSucursales } from '../../data/sucursales'
import { siguienteId } from '../../data/formato'

const FORM_VACIO = { nombre: '', capacidad: '', sucursalId: '' }

function validar(datos, lista, idEditado) {
  const errores = {}
  const nombre = datos.nombre.trim()
  if (nombre.length < 2) {
    errores.nombre = 'Ingresá el nombre de la sala (mínimo 2 caracteres).'
  } else if (lista.some((s) => s.id !== idEditado && s.sucursalId === Number(datos.sucursalId) && s.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = 'Ya existe una sala con ese nombre en esa sucursal.'
  }
  const capacidad = Number(datos.capacidad)
  if (datos.capacidad === '' || !Number.isInteger(capacidad) || capacidad < 1 || capacidad > 300) {
    errores.capacidad = 'La capacidad debe ser un número entero entre 1 y 300.'
  }
  return errores
}

function AdminSalas() {
  const sucursales = obtenerSucursales()
  const sucursalesActivas = sucursales.filter((s) => s.activa)

  const [lista, setLista] = useState(() => obtenerSalas())
  const [datos, setDatos] = useState({ ...FORM_VACIO, sucursalId: String(sucursalesActivas[0]?.id ?? '') })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [filtro, setFiltro] = useState('') // '' = todas las sucursales

  const editando = editandoId !== null

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarSalas(nueva)
  }

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
    setMensaje('')
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setDatos({ ...FORM_VACIO, sucursalId: String(sucursalesActivas[0]?.id ?? '') })
    setErrores({})
  }

  function handleEditar(sala) {
    setEditandoId(sala.id)
    setDatos({ nombre: sala.nombre, capacidad: String(sala.capacidad), sucursalId: String(sala.sucursalId) })
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

    if (editando) {
      // Solo cambian nombre y capacidad; las butacas ya creadas se mantienen (como el backend).
      actualizarLista(
        lista.map((s) =>
          s.id === editandoId
            ? { ...s, nombre: datos.nombre.trim(), capacidad: Number(datos.capacidad) }
            : s,
        ),
      )
      setMensaje(`Se actualizó la sala "${datos.nombre.trim()}".`)
      cancelarEdicion()
      return
    }

    const nueva = crearSala({
      id: siguienteId(lista),
      nombre: datos.nombre.trim(),
      capacidad: Number(datos.capacidad),
      sucursalId: Number(datos.sucursalId),
    })
    actualizarLista([...lista, nueva])
    setMensaje(`Se creó "${nueva.nombre}" con ${nueva.butacas.length} butacas.`)
    setDatos({ ...FORM_VACIO, sucursalId: datos.sucursalId })
  }

  // Baja lógica: la sala queda inactiva; sus funciones ya programadas no se borran.
  function handleDarDeBaja(sala) {
    actualizarLista(lista.map((s) => (s.id === sala.id ? { ...s, activa: false } : s)))
    setMensaje(`La sala "${sala.nombre}" fue dada de baja.`)
    if (editandoId === sala.id) cancelarEdicion()
  }

  const sucursalDe = (id) => sucursales.find((s) => s.id === id)?.nombre ?? 'Sucursal retirada'
  const visibles = lista.filter((s) => filtro === '' || s.sucursalId === Number(filtro))

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-sala">
        <h2 id="titulo-alta-sala" className="titulo-paso">
          {editando ? 'Editar sala' : 'Agregar sala'}
        </h2>
        {editando && (
          <p className="resultado-datos">
            Al editar, las butacas no cambian: se generan una sola vez, al crear la sala.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="sala-nombre">Nombre</label>
            <input
              id="sala-nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              aria-invalid={errores.nombre ? 'true' : 'false'}
              aria-describedby={errores.nombre ? 'error-sala-nombre' : undefined}
            />
            {errores.nombre && (
              <p id="error-sala-nombre" className="error" role="alert">{errores.nombre}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="sala-capacidad">Capacidad (butacas)</label>
            <input
              id="sala-capacidad"
              name="capacidad"
              type="number"
              min="1"
              max="300"
              value={datos.capacidad}
              onChange={handleChange}
              aria-invalid={errores.capacidad ? 'true' : 'false'}
              aria-describedby={errores.capacidad ? 'error-sala-capacidad' : undefined}
            />
            {errores.capacidad && (
              <p id="error-sala-capacidad" className="error" role="alert">{errores.capacidad}</p>
            )}
          </div>

          {/* La sucursal no se cambia al editar (igual que en el backend). */}
          {!editando && (
            <div className="campo">
              <label htmlFor="sala-sucursal">Sucursal</label>
              <select id="sala-sucursal" name="sucursalId" value={datos.sucursalId} onChange={handleChange}>
                {sucursalesActivas.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="hero-acciones">
            <button type="submit" className="boton">
              {editando ? 'Guardar cambios' : 'Agregar sala'}
            </button>
            {editando && (
              <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-salas">
        <h2 id="titulo-lista-salas" className="titulo-paso historial-titulo">Salas</h2>

        <div className="campo campo-filtro">
          <label htmlFor="sala-filtro">Ver salas de</label>
          <select id="sala-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-salas" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de salas</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Sucursal</th>
                <th scope="col">Capacidad</th>
                <th scope="col">Butacas</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.nombre}</th>
                  <td>{sucursalDe(s.sucursalId)}</td>
                  <td>{s.capacidad}</td>
                  <td>{s.butacas.length}</td>
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
                          aria-label={`Editar sala ${s.nombre} de ${sucursalDe(s.sucursalId)}`}
                          onClick={() => handleEditar(s)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-texto"
                          aria-label={`Dar de baja sala ${s.nombre} de ${sucursalDe(s.sucursalId)}`}
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
        {visibles.length === 0 && <p>No hay salas para mostrar.</p>}
      </section>
    </>
  )
}

export default AdminSalas
