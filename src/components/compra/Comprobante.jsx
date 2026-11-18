// Comprobante final: un QR por entrada, como en la compra online del backend.
//
// PROPS: compra ({ numeroCompra, entradas, totales, metodoPago }), pelicula, sucursal, sala, etiquetaFuncionTexto.

import CarruselQR from '../CarruselQR'
import { formatearPrecio } from '../../data/formato'
import { TIPOS_BUTACA } from '../../data/salas'

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

      <CarruselQR
        entradas={compra.entradas.map((e) => ({
          id: e.id,
          codigoQR: e.codigoQR,
          butaca: e.butaca,
          tipo: TIPOS_BUTACA[sala.butacas.find((b) => b.id === e.butaca)?.tipo ?? 'NORMAL'],
        }))}
        pelicula={pelicula.titulo}
        sucursal={sucursal.nombre}
        funcion={etiquetaFuncionTexto}
      />
    </section>
  )
}

export default Comprobante
