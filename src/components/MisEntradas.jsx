// "Mis entradas": UNA tarjeta por compra, con todas sus butacas juntas.
// Espeja /api/cliente/entradas del backend (listar y calificar).
//
// El backend opera entrada por entrada. Acá la persona opera la compra completa, y la
// acción se aplica a cada entrada de esa compra:
//   - Ver QR: el único código QR de la compra, con sus butacas listadas.
//   - Calificar: una calificación para la película, guardada en cada entrada.
//
// Regla del backend: solo entradas propias; calificar solo después de que empieza la función.

import { useState } from 'react'
import { obtenerEntradas, guardarEntradas, estaVigente, agruparPorCompra, ESTADOS } from '../data/entradas'
import { obtenerFunciones, inicioFuncion, haComenzado, etiquetaFuncion } from '../data/funciones'
import { obtenerPeliculas } from '../data/peliculas'
import { obtenerSalas, TIPOS_BUTACA } from '../data/salas'
import { obtenerSucursales } from '../data/sucursales'
import { obtenerSesion } from '../data/sesion'
import { formatearFechaHora, formatearPrecio } from '../data/formato'
import Estrellas from './Estrellas'
import ComprobanteQR from './ComprobanteQR'

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

  // Acción abierta en una compra: { numeroCompra, accion } con accion 'qr' | 'calificar'
  const [abierta, setAbierta] = useState(null)
  const [borrador, setBorrador] = useState({ estrellas: 0, comentario: '' })
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
    setBorrador({ estrellas: calificacion || 0, comentario: comentario || '' })
  }

  function cerrar() {
    setAbierta(null)
    setError('')
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
    cambiarCompra(grupo.numeroCompra, (e) => ({ ...e, calificacion: estrellas, comentario: borrador.comentario.trim() }))
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
            const calificacion = Math.max(...grupo.entradas.map((e) => e.calificacion))
            const comentario = grupo.entradas.find((e) => e.comentario)?.comentario ?? ''
            const total = grupo.entradas.reduce((s, e) => s + e.monto, 0)
            const accion = abierta && abierta.numeroCompra === grupo.numeroCompra ? abierta.accion : null
            const estados = [...new Set(grupo.entradas.map((e) => ESTADOS[e.estado]))].join(' · ')

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
                    {comenzo && (
                      <button type="button" className="boton-texto" onClick={() => abrir(grupo.numeroCompra, 'calificar', calificacion, comentario)}>
                        {calificacion > 0 ? 'Editar calificación' : 'Calificar película'}
                      </button>
                    )}
                  </div>
                )}

                {accion === 'qr' && funcion && pelicula && sucursal && (
                  <>
                    <ComprobanteQR
                      grupo={grupo}
                      sala={sala}
                      pelicula={pelicula.titulo}
                      sucursal={sucursal.nombre}
                      funcion={etiquetaFuncion(funcion, sala)}
                    />
                    <button type="button" className="boton-texto" onClick={cerrar}>Cerrar</button>
                  </>
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
