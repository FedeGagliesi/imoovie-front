// "Mis entradas": UNA tarjeta por compra, con todas sus butacas juntas.
// Espeja /api/cliente/entradas del backend (listar, reprogramar, cancelar, calificar).
//
// El backend opera entrada por entrada. Acá la persona opera la compra completa, y la
// acción se aplica a cada entrada de esa compra:
//   - Ver QR: un código por butaca.
//   - Reprogramar: elige función y vuelve a elegir la misma cantidad de butacas en el mapa.
//   - Cancelar: cancela las entradas vigentes (libera las butacas).
//   - Calificar: una calificación para la película, guardada en cada entrada.
//
// Reglas del backend: solo entradas propias; UTILIZADA y CANCELADA no se operan;
// reprogramar y cancelar solo antes de que empiece la función; calificar solo después.

import { useState } from 'react'
import { obtenerEntradas, guardarEntradas, butacasLibres, estaVigente, agruparPorCompra, ESTADOS } from '../data/entradas'
import { obtenerFunciones, inicioFuncion, haComenzado, etiquetaFuncion } from '../data/funciones'
import { obtenerPeliculas } from '../data/peliculas'
import { obtenerSalas, TIPOS_BUTACA } from '../data/salas'
import { obtenerSucursales } from '../data/sucursales'
import { obtenerSesion } from '../data/sesion'
import { pedidosAsociadosA, cancelarPedidos } from '../data/pedidos'
import { formatearFechaHora, formatearPrecio } from '../data/formato'
import Estrellas from './Estrellas'
import CarruselQR from './CarruselQR'
import MapaSala from './compra/MapaSala'

// Busca película, sala y sucursal de una función.
function datosDeFuncion(funcion) {
  const pelicula = obtenerPeliculas().find((p) => p.id === funcion.peliculaId)
  const sala = obtenerSalas().find((s) => s.id === funcion.salaId)
  const sucursal = sala && obtenerSucursales().find((s) => s.id === sala.sucursalId)
  return { pelicula, sala, sucursal }
}

function MisEntradas() {
  const sesion = obtenerSesion()
  const email = sesion ? sesion.usuario : ''

  // Se relee el almacenamiento en cada render. "version" fuerza un render tras guardar.
  const [, setVersion] = useState(0)
  const todas = obtenerEntradas()
  const funciones = obtenerFunciones()
  const compras = agruparPorCompra(todas.filter((e) => e.usuario === email), funciones)

  // Acción abierta en una compra: { numeroCompra, accion } con accion 'qr' | 'reprogramar' | 'cancelar' | 'calificar'
  const [abierta, setAbierta] = useState(null)
  const [borrador, setBorrador] = useState({ funcionId: '', butacas: [], estrellas: 0, comentario: '' })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  function guardarCambios(lista) {
    guardarEntradas(lista)
    setVersion((v) => v + 1)
  }

  // Cambia las entradas de UNA compra (aplica la función a cada una).
  function cambiarCompra(numeroCompra, transformar) {
    guardarCambios(todas.map((e) => (e.numeroCompra === numeroCompra ? transformar(e) : e)))
  }

  function abrir(numeroCompra, accion, calificacion, comentario) {
    setError('')
    setMensaje('')
    setAbierta({ numeroCompra, accion })
    setBorrador({ funcionId: '', butacas: [], estrellas: calificacion || 0, comentario: comentario || '' })
  }

  function cerrar() {
    setAbierta(null)
    setError('')
  }

  // ---------- Reprogramar ----------
  function handleReprogramar(grupo, vigentes) {
    const nueva = funciones.find((f) => f.id === Number(borrador.funcionId))
    const { sala } = nueva ? datosDeFuncion(nueva) : {}
    if (!nueva || !sala || !nueva.activa) {
      setError('Elegí una función disponible.')
      return
    }
    if (haComenzado(nueva)) {
      setError('La función elegida ya comenzó.')
      return
    }
    if (borrador.butacas.length !== vigentes.length) {
      setError(`Elegí ${vigentes.length} butaca${vigentes.length > 1 ? 's' : ''} para la nueva función.`)
      return
    }
    const libres = butacasLibres(nueva, sala, todas).map((b) => b.id)
    const tomadas = borrador.butacas.filter((b) => !libres.includes(b))
    if (tomadas.length > 0) {
      setError(`Estas butacas ya no están libres: ${tomadas.join(', ')}.`)
      return
    }

    // Asigna las butacas nuevas en orden a cada entrada vigente.
    const nuevas = [...borrador.butacas].sort()
    const ordenVigentes = vigentes.map((e) => e.id)
    cambiarCompra(grupo.numeroCompra, (e) => {
      const i = ordenVigentes.indexOf(e.id)
      if (i < 0) return e
      return { ...e, funcionId: nueva.id, sucursalId: sala.sucursalId, butaca: nuevas[i], estado: 'REPROGRAMADA' }
    })
    setMensaje('Compra reprogramada. Los códigos QR siguen siendo los mismos.')
    cerrar()
  }

  // ---------- Cancelar ----------
  // Cancela las entradas vigentes de la compra. Si "conCandy" es true, también
  // cancela los pedidos de candy asociados a esas entradas.
  function handleCancelar(grupo, conCandy) {
    cambiarCompra(grupo.numeroCompra, (e) => (estaVigente(e) ? { ...e, estado: 'CANCELADA' } : e))
    let mensajeFinal = 'Compra cancelada. Las butacas quedaron disponibles para la venta.'
    if (conCandy) {
      const ids = pedidosAsociadosA(email, grupo.entradas.map((e) => e.id)).map((p) => p.id)
      cancelarPedidos(ids)
      if (ids.length > 0) mensajeFinal += ' También se cancelaron los pedidos de candy asociados.'
    }
    setMensaje(mensajeFinal)
    cerrar()
  }

  // ---------- Calificar ----------
  function handleCalificar(grupo) {
    const estrellas = Number(borrador.estrellas)
    if (estrellas < 1 || estrellas > 5) {
      setError('Elegí entre 1 y 5 estrellas.')
      return
    }
    const funcion = funciones.find((f) => f.id === grupo.entradas[0].funcionId)
    if (!funcion || !haComenzado(funcion)) {
      setError('Todavía no podés calificar una función que no comenzó.')
      return
    }
    cambiarCompra(grupo.numeroCompra, (e) =>
      e.estado === 'CANCELADA' ? e : { ...e, calificacion: estrellas, comentario: borrador.comentario.trim() },
    )
    setMensaje('¡Gracias! Tu calificación quedó guardada.')
    cerrar()
  }

  return (
    <section aria-labelledby="titulo-mis-entradas">
      <h2 id="titulo-mis-entradas" className="titulo-paso">Mis entradas</h2>

      {mensaje && <p role="status">{mensaje}</p>}

      {compras.length === 0 ? (
        <p>Todavía no compraste entradas. Cuando compres, van a aparecer acá.</p>
      ) : (
        <ul className="lista-compras">
          {compras.map((grupo) => {
            const primera = grupo.entradas[0]
            const funcion = funciones.find((f) => f.id === primera.funcionId)
            const { pelicula, sala, sucursal } = funcion ? datosDeFuncion(funcion) : {}
            const comenzo = funcion ? haComenzado(funcion) : true
            const vigentes = grupo.entradas.filter(estaVigente)
            const noCanceladas = grupo.entradas.filter((e) => e.estado !== 'CANCELADA')
            const operable = vigentes.length > 0 && !comenzo
            const calificacion = Math.max(...grupo.entradas.map((e) => e.calificacion))
            const comentario = grupo.entradas.find((e) => e.comentario)?.comentario ?? ''
            const total = grupo.entradas.reduce((s, e) => s + e.monto, 0)
            const accion = abierta && abierta.numeroCompra === grupo.numeroCompra ? abierta.accion : null
            const estados = [...new Set(grupo.entradas.map((e) => ESTADOS[e.estado]))].join(' · ')
            const candyAsociado = pedidosAsociadosA(email, grupo.entradas.map((e) => e.id))

            // Opciones de reprogramación: funciones futuras y activas, distintas de la actual.
            const opcionesFuncion = funciones.filter((f) => f.activa && !haComenzado(f) && f.id !== primera.funcionId)
            const funcionNueva = funciones.find((f) => f.id === Number(borrador.funcionId))
            const datosNueva = funcionNueva ? datosDeFuncion(funcionNueva) : null
            const libresNueva = datosNueva?.sala ? butacasLibres(funcionNueva, datosNueva.sala, todas).map((b) => b.id) : []
            const ocupadasNueva = datosNueva?.sala
              ? datosNueva.sala.butacas.map((b) => b.id).filter((id) => !libresNueva.includes(id))
              : []

            return (
              <li key={grupo.numeroCompra} className="compra-tarjeta">
                <div className="compra-cabecera-tarjeta">
                  <div>
                    <h3 className="compra-titulo">{pelicula?.titulo ?? 'Función retirada'}</h3>
                    <p className="compra-detalle">
                      {sucursal?.nombre ?? ''} · {funcion ? formatearFechaHora(inicioFuncion(funcion)) : ''} · {sala?.nombre ?? ''}
                    </p>
                  </div>
                  <span className={`estado ${vigentes.length === 0 ? 'estado-baja' : 'estado-activa'}`}>{estados}</span>
                </div>

                <p className="compra-detalle">
                  Compra {grupo.numeroCompra} · {grupo.entradas.length} {grupo.entradas.length === 1 ? 'butaca' : 'butacas'} · {formatearPrecio(total)}
                </p>

                <ul className="butacas-compra" aria-label="Butacas de la compra">
                  {grupo.entradas.map((e) => {
                    const tipo = sala?.butacas.find((b) => b.id === e.butaca)?.tipo ?? 'NORMAL'
                    return (
                      <li key={e.id} className={`butaca-chip butaca-chip-${e.estado.toLowerCase()}`}>
                        {e.butaca} · {TIPOS_BUTACA[tipo]}
                      </li>
                    )
                  })}
                </ul>

                {calificacion > 0 && (
                  <p className="compra-detalle">
                    Tu calificación: {'★'.repeat(calificacion)} {comentario && `· “${comentario}”`}
                  </p>
                )}

                {accion === null && (
                  <div className="compra-acciones">
                    <button type="button" className="boton-texto" onClick={() => abrir(grupo.numeroCompra, 'qr')}>
                      Ver códigos QR
                    </button>
                    {operable && (
                      <>
                        <button type="button" className="boton-texto" onClick={() => abrir(grupo.numeroCompra, 'reprogramar')}>
                          Reprogramar
                        </button>
                        <button type="button" className="boton-texto" onClick={() => abrir(grupo.numeroCompra, 'cancelar')}>
                          Cancelar compra
                        </button>
                      </>
                    )}
                    {noCanceladas.length > 0 && comenzo && (
                      <button type="button" className="boton-texto" onClick={() => abrir(grupo.numeroCompra, 'calificar', calificacion, comentario)}>
                        {calificacion > 0 ? 'Editar calificación' : 'Calificar película'}
                      </button>
                    )}
                  </div>
                )}

                {accion === 'qr' && funcion && pelicula && sucursal && (
                  <>
                    <CarruselQR
                      entradas={grupo.entradas.map((e) => ({
                        id: e.id,
                        codigoQR: e.codigoQR,
                        butaca: e.butaca,
                        tipo: TIPOS_BUTACA[sala?.butacas.find((b) => b.id === e.butaca)?.tipo ?? 'NORMAL'],
                      }))}
                      pelicula={pelicula.titulo}
                      sucursal={sucursal.nombre}
                      funcion={etiquetaFuncion(funcion, sala)}
                    />
                    <button type="button" className="boton-texto" onClick={cerrar}>Cerrar</button>
                  </>
                )}

                {accion === 'cancelar' && (
                  <div className="formulario-accion">
                    <p>¿Seguro que querés cancelar la compra? Se liberan {vigentes.length} butacas.</p>
                    {candyAsociado.length > 0 && (
                      <p>
                        Tenés {candyAsociado.length} {candyAsociado.length === 1 ? 'pedido de candy asociado' : 'pedidos de candy asociados'} a esta función.
                        ¿Querés cancelarlos también?
                      </p>
                    )}
                    <div className="hero-acciones">
                      {candyAsociado.length > 0 ? (
                        <>
                          <button type="button" className="boton" onClick={() => handleCancelar(grupo, true)}>
                            Sí, cancelar entradas y candy
                          </button>
                          <button type="button" className="boton boton-secundario" onClick={() => handleCancelar(grupo, false)}>
                            Solo las entradas
                          </button>
                        </>
                      ) : (
                        <button type="button" className="boton" onClick={() => handleCancelar(grupo, false)}>Sí, cancelar</button>
                      )}
                      <button type="button" className="boton boton-secundario" onClick={cerrar}>No, volver</button>
                    </div>
                  </div>
                )}

                {accion === 'reprogramar' && (
                  <form
                    className="formulario-accion"
                    onSubmit={(e) => { e.preventDefault(); handleReprogramar(grupo, vigentes) }}
                    noValidate
                  >
                    <p>Elegí la nueva función y {vigentes.length} butaca{vigentes.length > 1 ? 's' : ''} en el mapa.</p>
                    <div className="campo">
                      <label htmlFor={`rep-${grupo.numeroCompra}`}>Nueva función</label>
                      <select
                        id={`rep-${grupo.numeroCompra}`}
                        value={borrador.funcionId}
                        onChange={(e) => setBorrador({ ...borrador, funcionId: e.target.value, butacas: [] })}
                      >
                        <option value="">Elegí una función…</option>
                        {opcionesFuncion.map((f) => {
                          const d = datosDeFuncion(f)
                          if (!d.pelicula || !d.sala || !d.sucursal) return null
                          return (
                            <option key={f.id} value={f.id}>
                              {d.pelicula.titulo} · {d.sucursal.nombre} · {etiquetaFuncion(f, d.sala)} · {f.formato ?? '2D'}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {datosNueva?.sala && (
                      <MapaSala
                        butacas={datosNueva.sala.butacas}
                        ocupadas={ocupadasNueva}
                        seleccionadas={borrador.butacas}
                        onToggle={(id) => {
                          setError('')
                          const sel = borrador.butacas
                          if (sel.includes(id)) setBorrador({ ...borrador, butacas: sel.filter((b) => b !== id) })
                          else if (sel.length < vigentes.length) setBorrador({ ...borrador, butacas: [...sel, id] })
                          else setError(`Elegí ${vigentes.length} butaca${vigentes.length > 1 ? 's' : ''}, no más.`)
                        }}
                      />
                    )}

                    {error && <p className="error" role="alert">{error}</p>}
                    <div className="hero-acciones">
                      <button type="submit" className="boton">Confirmar cambio</button>
                      <button type="button" className="boton boton-secundario" onClick={cerrar}>Volver</button>
                    </div>
                  </form>
                )}

                {accion === 'calificar' && (
                  <form
                    className="formulario-accion"
                    onSubmit={(e) => { e.preventDefault(); handleCalificar(grupo) }}
                    noValidate
                  >
                    <Estrellas
                      nombre={`calif-${grupo.numeroCompra}`}
                      valor={Number(borrador.estrellas)}
                      onChange={(n) => setBorrador({ ...borrador, estrellas: n })}
                    />
                    <div className="campo">
                      <label htmlFor={`com-${grupo.numeroCompra}`}>Comentario (opcional)</label>
                      <textarea
                        id={`com-${grupo.numeroCompra}`}
                        rows={3}
                        maxLength={300}
                        value={borrador.comentario}
                        onChange={(e) => setBorrador({ ...borrador, comentario: e.target.value })}
                      />
                    </div>
                    {error && <p className="error" role="alert">{error}</p>}
                    <div className="hero-acciones">
                      <button type="submit" className="boton">Guardar calificación</button>
                      <button type="button" className="boton boton-secundario" onClick={cerrar}>Volver</button>
                    </div>
                  </form>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MisEntradas
