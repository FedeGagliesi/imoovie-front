// Resumen fijo de la compra, a la derecha de cada paso (como en la referencia).
// Muestra la película, el cine, el día y horario, las entradas, el candy y las butacas.
// Los totales van en la barra de abajo de cada paso.
//
// PROPS:
//   pelicula, funcion, sala, sucursal, butacas (ids), candyLines, totales

import Afiche from '../Afiche'
import { formatearDia, formatearPrecio, horaDe } from '../../data/formato'
import { inicioFuncion } from '../../data/funciones'

function ResumenCompra({ pelicula, funcion, sala, sucursal, butacas, candyLines, totales }) {
  const cantidad = butacas.length

  return (
    <aside className="resumen-compra" aria-label="Resumen de tu compra">
      <h2 className="resumen-titulo">Resumen</h2>

      <section className="resumen-bloque" aria-label="Película">
        <p className="resumen-etiqueta">Película</p>
        <div className="resumen-pelicula">
          <Afiche pelicula={pelicula} className="resumen-afiche" />
          <div>
            <p className="resumen-pelicula-titulo">{pelicula.titulo}</p>
            <p className="resumen-pelicula-formato">{funcion.formato ?? '2D'} · {funcion.idioma}</p>
          </div>
        </div>
      </section>

      <section className="resumen-bloque">
        <p className="resumen-etiqueta">Cine, día y horario</p>
        <p className="resumen-linea"><strong>{sucursal.nombre}</strong></p>
        <p className="resumen-linea">{sala.nombre}</p>
        <p className="resumen-linea">
          {formatearDia(funcion.fecha)} · {horaDe(inicioFuncion(funcion))}
        </p>
      </section>

      <section className="resumen-bloque">
        <p className="resumen-etiqueta">Entradas</p>
        {cantidad > 0 ? (
          <>
            <p className="resumen-linea">{cantidad} · entrada general <span className="resumen-monto">{formatearPrecio(totales.subtotalEntradas)}</span></p>
            <p className="resumen-linea">Cargo por servicio entradas <span className="resumen-monto">{formatearPrecio(totales.cargoServicio)}</span></p>
          </>
        ) : (
          <p className="resumen-linea">Todavía no elegiste butacas.</p>
        )}
      </section>

      {candyLines.length > 0 && (
        <section className="resumen-bloque">
          <p className="resumen-etiqueta">Candy</p>
          {candyLines.map((l) => (
            <p key={l.id} className="resumen-linea">
              {l.cantidad} × {l.nombre} <span className="resumen-monto">{formatearPrecio(l.precio * l.cantidad)}</span>
            </p>
          ))}
        </section>
      )}

      {cantidad > 0 && (
        <section className="resumen-bloque">
          <p className="resumen-etiqueta">Butacas</p>
          <p className="resumen-linea">{[...butacas].sort().join(' · ')}</p>
        </section>
      )}
    </aside>
  )
}

export default ResumenCompra
