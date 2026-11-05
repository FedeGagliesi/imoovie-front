// Zona cliente (ruta "/cliente")
//
// Ahora es un CONTENEDOR con dos pestañas:
//   - "Comprar entradas"     → componente CompraEntradas (el flujo por pasos)
//   - "Mis calificaciones"   → componente MisCalificaciones (Parte 8a)
// Cliente solo decide cuál mostrar; el trabajo lo hacen los componentes hijos.

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { obtenerSesion } from '../data/sesion'
import CompraEntradas from '../components/CompraEntradas'
import MisCalificaciones from '../components/MisCalificaciones'

function Cliente() {
  const sesion = obtenerSesion()

  // Si venimos del botón "Calificar" de la cartelera, Link nos mandó datos en
  // location.state. Si entramos de otra forma, state es null y usamos los
  // valores por defecto.
  const { state } = useLocation()
  const [vista, setVista] = useState(state?.vista || 'comprar')

  return (
    <>
      <h1>Mi cine</h1>
      <p>Hola, {sesion.nombre || sesion.usuario}. ¿Qué querés hacer hoy?</p>

      {/* Botones que funcionan como pestañas. aria-pressed le avisa a los
          lectores de pantalla cuál está activa. */}
      <div className="pestanas" role="group" aria-label="Secciones de Mi cine">
        <button
          type="button"
          className="pestana"
          aria-pressed={vista === 'comprar'}
          onClick={() => setVista('comprar')}
        >
          Comprar entradas
        </button>
        <button
          type="button"
          className="pestana"
          aria-pressed={vista === 'calificaciones'}
          onClick={() => setVista('calificaciones')}
        >
          Mis calificaciones
        </button>
      </div>

      {/* El atributo "hidden" oculta un bloque pero lo deja montado: así, si
          estás a mitad de una compra y mirás tus calificaciones, al volver la
          compra sigue donde la dejaste (si lo "desmontáramos", se perdería). */}
      <div hidden={vista !== 'comprar'}>
        <CompraEntradas />
      </div>
      <div hidden={vista !== 'calificaciones'}>
        <MisCalificaciones peliculaInicial={state?.peliculaId} />
      </div>
    </>
  )
}

export default Cliente
