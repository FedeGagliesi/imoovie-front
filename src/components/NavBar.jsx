// Barra de navegación. Es un componente REUTILIZABLE: se escribe una vez
// y se muestra en todas las páginas porque App lo pone fuera de <Routes>.
//
// <Link> reemplaza al <a href>. La diferencia: un <a> normal recarga toda
// la página; <Link> cambia la URL y React solo cambia la parte que corresponde.
//
// Cambia según haya o no sesión iniciada (ver data/sesion.js).

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { obtenerSesion, cerrarSesion } from '../data/sesion'
import { zonas } from '../data/usuarios'
import Logo from './Logo'

function NavBar() {
  // useLocation "suscribe" este componente a los cambios de ruta: cada vez
  // que cambia la URL, NavBar se vuelve a dibujar y vuelve a leer la sesión.
  // Sin esta línea, la barra no se enteraría de que alguien inició sesión.
  // Además nos dice en qué página estamos (pathname) para resaltar su enlace.
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const sesion = obtenerSesion()

  // aria-current="page" le avisa a los lectores de pantalla cuál es la página
  // actual, y el CSS lo usa para resaltar el enlace. Devuelve undefined (no
  // pone el atributo) cuando el enlace no es el de la página actual.
  function actual(ruta) {
    return pathname === ruta ? 'page' : undefined
  }

  function handleSalir() {
    cerrarSesion()
    navigate('/')
  }

  return (
    // <header> y <nav> son etiquetas "semánticas": le dicen al navegador
    // y a los lectores de pantalla qué es cada cosa (parte de accesibilidad).
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <Logo />
      </Link>
      <nav aria-label="Navegación principal">
        <Link to="/" aria-current={actual('/')}>Inicio</Link>
        {/* "Quiénes somos" es público: se ve siempre, haya o no sesión iniciada */}
        <Link to="/nosotros" aria-current={actual('/nosotros')}>Quiénes somos</Link>

        {/* Renderizado condicional con ternario: una cosa u otra */}
        {sesion ? (
          <>
            <Link to={'/' + sesion.rol} aria-current={actual('/' + sesion.rol)}>
              {zonas[sesion.rol].menu}
            </Link>
            {/* "||" usa el valor de la derecha si el de la izquierda está vacío
                (por si quedó guardada una sesión vieja sin nombre) */}
            <span className="navbar-usuario">Hola, {sesion.nombre || sesion.usuario}</span>
            <button type="button" className="boton-texto" onClick={handleSalir}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/contacto" aria-current={actual('/contacto')}>Contacto</Link>
            <Link to="/login" aria-current={actual('/login')}>Ingresar</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default NavBar
