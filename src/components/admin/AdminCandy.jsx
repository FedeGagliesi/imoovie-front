// Pestaña "Candy" del panel de administración. Espeja:
//   - /api/admin/productos: alta, edición (nombre, descripción, precio) y baja lógica.
//   - /api/admin/candy/pedidos/{id}/retirar: registrar que un pedido online se entregó.
//
// Los productos dados de baja dejan de ofrecerse, pero no se borran. El precio que
// figura en un pedido ya hecho no cambia cuando se edita el producto.

import { useState } from 'react'
import { obtenerProductos, guardarProductos } from '../../data/candy'
import { obtenerPedidos, guardarPedidos, montoTotalPedido } from '../../data/pedidos'
import { formatearPrecio, formatearFechaHora, fechaHoraMs, siguienteId } from '../../data/formato'

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', imagen: '', oferta: false }

// Regla del precio: entero entre 500 y 50.000, igual que antes en esta pantalla.
function validarPrecio(texto) {
  const numero = Number(texto)
  if (texto === '' || !Number.isInteger(numero) || numero < 500 || numero > 50000) {
    return 'El precio debe ser un número entero entre 500 y 50.000.'
  }
  return ''
}

function validar(datos, lista, idEditado) {
  const errores = {}
  const nombre = datos.nombre.trim()

  if (nombre.length < 3) {
    errores.nombre = 'Ingresá el nombre del producto (mínimo 3 caracteres).'
  } else if (lista.some((p) => p.id !== idEditado && p.nombre.toLowerCase() === nombre.toLowerCase())) {
    errores.nombre = 'Ya existe un producto con ese nombre.'
  }

  if (datos.descripcion.trim().length < 3) {
    errores.descripcion = 'Ingresá una descripción breve (mínimo 3 caracteres).'
  }

  const errorPrecio = validarPrecio(datos.precio)
  if (errorPrecio) errores.precio = errorPrecio

  return errores
}

function AdminCandy() {
  const [lista, setLista] = useState(() => obtenerProductos())
  const [pedidos, setPedidos] = useState(() => obtenerPedidos())
  const [datos, setDatos] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mensajePedido, setMensajePedido] = useState('')

  const editando = editandoId !== null
  const cantidadActivos = lista.filter((p) => p.activo).length

  // Pedidos online que todavía no se entregaron, ordenados por horario de retiro.
  const pendientes = pedidos
    .filter((p) => !p.retirado && !p.cancelado)
    .sort((a, b) => fechaHoraMs(a.horarioRetiro.slice(0, 10), a.horarioRetiro.slice(11)) - fechaHoraMs(b.horarioRetiro.slice(0, 10), b.horarioRetiro.slice(11)))

  function actualizarLista(nueva) {
    setLista(nueva)
    guardarProductos(nueva)
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

  function handleEditar(producto) {
    setEditandoId(producto.id)
    setDatos({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: String(producto.precio),
      imagen: producto.imagen ?? '',
      oferta: Boolean(producto.oferta),
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
      descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio),
      imagen: datos.imagen.trim(),
      oferta: datos.oferta,
    }

    if (editando) {
      actualizarLista(lista.map((p) => (p.id === editandoId ? { ...p, ...campos } : p)))
      setMensaje(`Se actualizó "${campos.nombre}".`)
      cancelarEdicion()
      return
    }

    const nuevo = { id: siguienteId(lista), ...campos, activo: true }
    actualizarLista([...lista, nuevo])
    setMensaje(`Se agregó "${nuevo.nombre}" al candy.`)
    setDatos(FORM_VACIO)
  }

  // Baja lógica: el producto deja de ofrecerse, pero los pedidos ya hechos lo conservan.
  function handleDarDeBaja(producto) {
    if (producto.activo && cantidadActivos === 1) {
      setMensaje('Tiene que quedar al menos un producto activo.')
      return
    }
    actualizarLista(lista.map((p) => (p.id === producto.id ? { ...p, activo: false } : p)))
    setMensaje(`"${producto.nombre}" fue dado de baja.`)
    if (editandoId === producto.id) cancelarEdicion()
  }

  // Registra el retiro de un pedido: pasa a "retirado" y sale de la lista de pendientes.
  function handleRetirar(pedido) {
    const nuevos = pedidos.map((p) => (p.id === pedido.id ? { ...p, retirado: true } : p))
    setPedidos(nuevos)
    guardarPedidos(nuevos)
    setMensajePedido(`Pedido de ${pedido.cantidad} × ${pedido.nombre} entregado.`)
  }

  return (
    <>
      <section className="contenedor-form" aria-labelledby="titulo-alta-candy">
        <h2 id="titulo-alta-candy" className="titulo-paso">
          {editando ? 'Editar producto' : 'Agregar producto'}
        </h2>

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
              <p id="error-candy-nombre" className="error" role="alert">{errores.nombre}</p>
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
              <p id="error-candy-descripcion" className="error" role="alert">{errores.descripcion}</p>
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
              <p id="error-candy-precio" className="error" role="alert">{errores.precio}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="candy-imagen">Imagen (URL, opcional)</label>
            <input id="candy-imagen" name="imagen" type="url" placeholder="https://..." value={datos.imagen} onChange={handleChange} />
          </div>

          <label className="opcion-check">
            <input type="checkbox" checked={datos.oferta} onChange={(e) => setDatos({ ...datos, oferta: e.target.checked })} />
            Mostrar sello OFERTA
          </label>

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="hero-acciones">
            <button type="submit" className="boton">
              {editando ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            {editando && (
              <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-lista-candy">
        <h2 id="titulo-lista-candy" className="titulo-paso historial-titulo">Productos del candy bar</h2>
        <p className="seleccion-resumen">
          {lista.length} en total · {cantidadActivos} {cantidadActivos === 1 ? 'activo' : 'activos'}
        </p>

        <div className="tabla-contenedor" role="region" aria-labelledby="titulo-lista-candy" tabIndex={0}>
          <table className="tabla">
            <caption className="solo-lectores">Listado de productos</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col">Precio</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.nombre}</th>
                  <td>{p.descripcion}</td>
                  <td>{formatearPrecio(p.precio)}</td>
                  <td>
                    <span className={`estado ${p.activo ? 'estado-activa' : 'estado-baja'}`}>
                      {p.activo ? 'Activo' : 'Dado de baja'}
                    </span>
                  </td>
                  <td>
                    {p.activo && (
                      <>
                        <button
                          type="button"
                          className="boton-texto"
                          aria-label={`Editar ${p.nombre}`}
                          onClick={() => handleEditar(p)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-texto"
                          aria-label={`Dar de baja ${p.nombre}`}
                          onClick={() => handleDarDeBaja(p)}
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

      <section aria-labelledby="titulo-pedidos-admin">
        <h2 id="titulo-pedidos-admin" className="titulo-paso historial-titulo">Pedidos de candy pendientes</h2>
        <p className="seleccion-resumen" aria-live="polite">
          {pendientes.length} {pendientes.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
        </p>
        {mensajePedido && <p role="status">{mensajePedido}</p>}

        {pendientes.length === 0 ? (
          <p>No hay pedidos pendientes de retiro.</p>
        ) : (
          <ul className="historial">
            {pendientes.map((p) => (
              <li key={p.id} className="historial-item">
                <div className="historial-cabecera">
                  <strong>{p.cantidad} × {p.nombre}</strong>
                  <span>{p.usuario ?? 'Sin asignar'}</span>
                </div>
                <p className="historial-comentario">
                  Retiro: {formatearFechaHora(fechaHoraMs(p.horarioRetiro.slice(0, 10), p.horarioRetiro.slice(11)))}
                </p>
                <div className="historial-pie">
                  <span>Total {formatearPrecio(montoTotalPedido(p))}</span>
                  <button
                    type="button"
                    className="boton-texto"
                    aria-label={`Marcar como retirado el pedido de ${p.cantidad} × ${p.nombre}, id ${p.id}`}
                    onClick={() => handleRetirar(p)}
                  >
                    Marcar como retirado
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default AdminCandy
