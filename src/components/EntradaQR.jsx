// Código QR de UNA entrada. En el backend cada entrada tiene su propio código
// (UUID); acá lo mismo: cada butaca comprada tiene su QR.
//
// Quien escanee el código ve el código de la entrada y los datos del comprobante.
// Con ese código, cualquiera puede consultar la entrada en la página pública
// "Consultar entrada" (igual que GET /api/entradas/qr/{codigo}).
//
// El dibujo del QR lo hace la librería "qrcode.react" (componente <QRCodeSVG>):
// calcular un QR a mano es muy complejo y fácil de equivocar.

import { QRCodeSVG } from 'qrcode.react'

function EntradaQR({ entradaId, codigoQR, pelicula, sucursal, funcion, butaca }) {
  // El contenido del QR: una línea por dato. .join('\n') une las líneas con saltos de línea.
  const contenido = [
    'i-Moovie · Entrada',
    `ID: ${entradaId}`,
    `Código: ${codigoQR}`,
    `Película: ${pelicula}`,
    `Sucursal: ${sucursal}`,
    `Función: ${funcion}`,
    `Butaca: ${butaca}`,
  ].join('\n')

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
          value={contenido}
          size={176}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#0b0a09"
          title={`Código QR de la butaca ${butaca}`}
        />
      </div>
      <figcaption>
        <strong>ID de entrada: {entradaId}</strong>
        <br />
        {/* El código completo se muestra en texto: es el que se pega en "Consultar entrada"
            y en la validación del vendedor */}
        <span className="entrada-qr-texto">Código: {codigoQR}</span>
        <br />
        Butaca {butaca} · Mostrá este código en el cine para ingresar.
      </figcaption>
    </figure>
  )
}

export default EntradaQR
