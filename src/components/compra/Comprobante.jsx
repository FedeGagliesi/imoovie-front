// Comprobante final: un solo QR por compra, con todas sus butacas listadas debajo.
//
// PROPS: compra ({ numeroCompra, entradas, totales, metodoPago }), pelicula, sucursal, sala, etiquetaFuncionTexto.

import ComprobanteQR from '../ComprobanteQR'
import { formatearPrecio } from '../../data/formato'

function Comprobante({ compra, pelicula, sucursal, sala, etiquetaFuncionTexto }) {
  return (
    <section className="contenedor-compra" aria-labelledby="titulo-listo">
      <h2 id="titulo-listo" className="titulo-seccion">¡Compra confirmada!</h2>
      <p role="status" className="comprobante-numero">Compra Nº {compra.numeroCompra}</p>
      <p>
        {pelicula.titulo} · {sucursal.nombre} · {etiquetaFuncionTexto}
      </p>
      <p>
        <strong>Total {formatearPrecio(compra.totales.total)}</strong> · pagado con {compra.metodoPago}
      </p>

      <ComprobanteQR
        grupo={compra}
        sala={sala}
        pelicula={pelicula.titulo}
        sucursal={sucursal.nombre}
        funcion={etiquetaFuncionTexto}
      />
    </section>
  )
}

export default Comprobante
