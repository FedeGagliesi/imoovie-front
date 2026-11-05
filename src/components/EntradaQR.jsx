// Código QR de una entrada. Se muestra en el comprobante, tanto en la compra
// online del cliente como en la venta de entradas del mostrador.
//
// Es un componente más, con props: recibe los datos de la entrada y arma el texto
// que va dentro del QR. Quien escanee el código con el celular ve esos datos.
//
// El dibujo del QR lo hace la librería "qrcode.react" (componente <QRCodeSVG>):
// calcular un QR a mano (con su corrección de errores) es muy complejo y fácil de
// equivocar, así que usamos una librería probada, igual que usamos react-router-dom
// para las rutas.

import { QRCodeSVG } from 'qrcode.react'

function EntradaQR({ numero, pelicula, sucursal, funcion, butacas }) {
  // El contenido del QR: una línea por dato. .join('\n') une las líneas con saltos de línea.
  const contenido = [
    `i-Moovie · Entrada ${numero}`,
    `Película: ${pelicula}`,
    `Sucursal: ${sucursal}`,
    `Función: ${funcion}`,
    `Butacas: ${butacas.join(', ')}`,
  ].join('\n')

  return (
    // <figure> + <figcaption>: una imagen con su descripción.
    <figure className="entrada-qr">
      <div className="entrada-qr-codigo">
        {/* Un QR tiene que ser oscuro sobre claro para que los lectores lo detecten
            bien: por eso lleva fondo blanco aunque el resto de la página sea oscura.
            - level="M": nivel medio de corrección de errores (todavía se lee si se ensucia un poco).
            - marginSize={4}: el margen blanco de 4 cuadraditos que pide el estándar.
            - title: el texto que lee un lector de pantalla (el dibujo en sí no se puede "leer"). */}
        <QRCodeSVG
          value={contenido}
          size={176}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#0b0a09"
          title={`Código QR de la entrada ${numero}`}
        />
      </div>
      <figcaption>Mostrá este código en el cine para ingresar.</figcaption>
    </figure>
  )
}

export default EntradaQR
