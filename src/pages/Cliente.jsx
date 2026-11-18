// Zona cliente (ruta "/cliente")
//
// Es un CONTENEDOR con tres pestañas, cada una un componente:
//   - "Mis entradas"        → MisEntradas (reprogramar, cancelar, calificar, QR)
//   - "Mis pedidos de candy"→ MisPedidos (pedir candy para retirar)
//   - "Mis estadísticas"    → Estadisticas (el resumen personal)
// Cliente solo decide cuál mostrar; el trabajo lo hacen los componentes hijos.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerSesion } from '../data/sesion'
import MisEntradas from '../components/MisEntradas'
import MisPedidos from '../components/MisPedidos'
import Estadisticas from '../components/Estadisticas'

const PESTANAS = [
  { id: 'entradas', nombre: 'Mis entradas' },
  { id: 'pedidos', nombre: 'Mis pedidos de candy' },
  { id: 'estadisticas', nombre: 'Mis estadísticas' },
]

function Cliente() {
  const sesion = obtenerSesion()
  const [vista, setVista] = useState('entradas')

  return (
    <>
      <h1>Mi cine</h1>
      <p>
        Hola, {sesion.nombre || sesion.usuario}. <Link to="/" className="enlace-texto">Ver la cartelera</Link> · <Link to="/candy" className="enlace-texto">Comprar candy</Link>
      </p>

      {/* Botones que funcionan como pestañas. aria-pressed le avisa a los
          lectores de pantalla cuál está activa. */}
      <div className="pestanas" role="group" aria-label="Secciones de Mi cine">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="pestana"
            aria-pressed={vista === p.id}
            onClick={() => setVista(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {/* El atributo "hidden" oculta un bloque pero lo deja montado: así, si
          estás a mitad de una compra y mirás tus entradas, al volver la compra
          sigue donde la dejaste (si lo "desmontáramos", se perdería). */}
      <div hidden={vista !== 'entradas'}>
        <MisEntradas />
      </div>
      <div hidden={vista !== 'pedidos'}>
        <MisPedidos />
      </div>
      <div hidden={vista !== 'estadisticas'}>
        <Estadisticas />
      </div>
    </>
  )
}

export default Cliente
