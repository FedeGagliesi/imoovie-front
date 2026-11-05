// Pie de página: se muestra debajo del contenido en todas las páginas
// (App lo pone fuera de <Routes>, igual que la barra de navegación).

import { Link } from 'react-router-dom'
import Logo from './Logo'

function Footer() {
  return (
    // <footer> es la etiqueta semántica del pie de página.
    <footer className="pie">
      <div className="pie-marca">
        <Logo />
        <p>Tu cine, sin vueltas.</p>
      </div>

      {/* Hay dos <nav> en la página (esta y la de arriba): cada una lleva su
          propio aria-label para que un lector de pantalla las distinga. */}
      <nav className="pie-enlaces" aria-label="Enlaces del pie de página">
        <Link to="/">Inicio</Link>
        <Link to="/nosotros">Quiénes somos</Link>
        <Link to="/contacto">Contacto</Link>
      </nav>

      <p className="pie-nota">Proyecto de Aplicaciones Interactivas · UADE</p>
    </footer>
  )
}

export default Footer
