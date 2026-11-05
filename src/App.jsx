// App: la raíz de la aplicación. Define las rutas con react-router-dom.
//
// Idea clave: nuestra app es de UNA sola página HTML. El router mira la URL
// y decide qué componente mostrar. Cambiar de "página" no pide nada al
// servidor: React simplemente dibuja otro componente.
//
//  - BrowserRouter: activa el sistema de rutas (envuelve toda la app).
//  - Routes:        contenedor; elige UNA Route que coincida con la URL.
//  - Route:         "si la URL es path, mostrá element".
//  - path="*":      "cualquier otra URL" (la página 404).

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import NavBar from './components/NavBar'
import Footer from './components/Footer'
import RutaProtegida from './components/RutaProtegida'
import TituloDePagina from './components/TituloDePagina'
import Landing from './pages/Landing'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Login from './pages/Login'
import Cliente from './pages/Cliente'
import Vendedor from './pages/Vendedor'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

// basename: la carpeta donde está publicado el sitio (ver vite.config.js).
// Vite la entrega en import.meta.env.BASE_URL: "/" en desarrollo y
// "/imoovie-front/" en la versión publicada en GitHub Pages.
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TituloDePagina />

      {/* Enlace "saltar al contenido": queda oculto hasta que se lo enfoca con
          la tecla Tab. Le permite a quien navega con teclado o lector de pantalla
          saltear el menú y llegar directo al contenido de la página. */}
      <a href="#contenido" className="saltar">Saltar al contenido</a>

      {/* NavBar está FUERA de <Routes>, por eso se ve en todas las rutas */}
      <NavBar />

      {/* tabIndex={-1} permite que el enlace de arriba le dé foco a <main> */}
      <main id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/login" element={<Login />} />
          {/* Estas tres rutas están protegidas: sin la sesión del rol
              correcto, RutaProtegida redirige a /login */}
          <Route
            path="/cliente"
            element={<RutaProtegida rol="cliente"><Cliente /></RutaProtegida>}
          />
          <Route
            path="/vendedor"
            element={<RutaProtegida rol="vendedor"><Vendedor /></RutaProtegida>}
          />
          <Route
            path="/admin"
            element={<RutaProtegida rol="admin"><Admin /></RutaProtegida>}
          />
          {/* Si ninguna de las anteriores coincide, se muestra la 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Igual que NavBar, el pie está FUERA de <Routes>: se ve en todas las páginas */}
      <Footer />
    </BrowserRouter>
  )
}

export default App
