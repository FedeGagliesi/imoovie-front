// Código QR de UNA COMPRA. En vez de un QR por butaca, cada compra tiene un solo QR
// cuyo contenido es su número de compra (numeroCompra, que ya comparten todas sus entradas).
// Quien lo escanee en la puerta valida de una sola vez todas las butacas de la compra.
//
// Debajo del QR se listan las butacas con su tipo (VIP / Premium / Normal) y los datos
// de la función.
//
// PROPS:
//   grupo: { numeroCompra, entradas: [{ id, butaca }] }  → la compra (la misma forma que arma agruparPorCompra)
//   sala: la sala de la función (para saber el tipo de cada butaca)
//   pelicula, sucursal, funcion: textos del comprobante
//
// El dibujo del QR lo hace la librería "qrcode.react" (componente <QRCodeSVG>):
// calcular un QR a mano es muy complejo y fácil de equivocar.

import { QRCodeSVG } from 'qrcode.react'
import { TIPOS_BUTACA } from '../data/salas'

function ComprobanteQR({ grupo, sala, pelicula, sucursal, funcion }) {
  // .localeCompare con { numeric: true } ordena C2 antes que C10.
  const butacas = [...grupo.entradas].sort((a, b) => a.butaca.localeCompare(b.butaca, 'es', { numeric: true }))

  return (
    // <figure> + <figcaption>: una imagen con su descripción.
    <figure className="entrada-qr">
      <div className="entrada-qr-codigo">
        {/* Un QR tiene que ser oscuro sobre claro para que los lectores lo detecten
            bien: por eso lleva fondo blanco aunque el resto de la página sea oscura.
            - level="M": nivel medio de corrección de errores.
            - marginSize={4}: el margen blanco que pide el estándar.
            - title: el texto que lee un lector de pantalla. */}
        <QRCodeSVG
          value={grupo.numeroCompra}
          size={176}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#0b0a09"
          title={`Código QR de la compra ${grupo.numeroCompra}`}
        />
      </div>
      <figcaption>
        <strong>Compra Nº {grupo.numeroCompra}</strong>
        <br />
        {pelicula} · {sucursal} · {funcion}
        <br />
        Mostrá este código en el cine para ingresar con todas tus butacas.
      </figcaption>
      <ul className="butacas-compra" aria-label="Butacas de la compra">
        {butacas.map((e) => {
          const tipo = sala?.butacas.find((b) => b.id === e.butaca)?.tipo ?? 'NORMAL'
          return (
            <li key={e.butaca} className="butaca-chip">
              {e.butaca} · {TIPOS_BUTACA[tipo]}
            </li>
          )
        })}
      </ul>
    </figure>
  )
}

export default ComprobanteQR
