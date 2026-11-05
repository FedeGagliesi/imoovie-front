// Página 404: se muestra cuando la URL no coincide con ninguna ruta
// (por ejemplo /hola). Es la última <Route path="*"> de App.jsx.

import { Link } from 'react-router-dom'
import { obtenerSesion } from '../data/sesion'
import { zonas } from '../data/usuarios'

function NotFound() {
  const sesion = obtenerSesion()

  return (
    <section className="hero" aria-labelledby="titulo-404">
      <p className="indicador-paso">Error 404</p>
      <h1 id="titulo-404">Esta página no existe</h1>
      <p>La dirección que escribiste no corresponde a ninguna sección de i-Moovie.</p>

      <div className="hero-acciones">
        <Link to="/" className="boton">Volver al inicio</Link>
        {/* Si hay sesión, también ofrecemos volver directo a la zona de la persona */}
        {sesion && (
          <Link to={'/' + sesion.rol} className="boton boton-secundario">
            {zonas[sesion.rol].boton}
          </Link>
        )}
      </div>
    </section>
  )
}

export default NotFound
