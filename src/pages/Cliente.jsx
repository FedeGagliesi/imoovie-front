// Zona cliente (ruta "/cliente")
//
// Muestra "Mis entradas" (MisEntradas: ver el QR de cada compra y calificar).
// Cliente solo arma la página; el trabajo lo hace el componente hijo.

import { Link } from 'react-router-dom'
import { obtenerSesion } from '../data/sesion'
import MisEntradas from '../components/MisEntradas'

function Cliente() {
  const sesion = obtenerSesion()

  return (
    <>
      <h1>Mi cine</h1>
      <p>
        Hola, {sesion.nombre || sesion.usuario}. <Link to="/" className="enlace-texto">Ver la cartelera</Link> · <Link to="/candy" className="enlace-texto">Comprar candy</Link>
      </p>

      <MisEntradas />
    </>
  )
}

export default Cliente
