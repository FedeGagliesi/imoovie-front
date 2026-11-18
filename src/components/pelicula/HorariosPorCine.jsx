// Horarios de una película, agrupados por cine y por formato + idioma.
// Cada horario es un botón que lleva a comprar esa función.
//
// PROPS:
//   cines:        [{ sucursal, grupos: [{ clave, horarios: [{ funcion, hora, nivel }] }] }]
//   onElegir:     recibe la función elegida


import { TEXTO_NIVEL } from '../../data/compra'

function HorariosPorCine({ cines, onElegir }) {
  if (cines.length === 0) {
    return <p>No hay horarios para esta fecha con esos filtros.</p>
  }

  return (
    <div className="horarios-cines">
      {cines.map((cine) => (
        <section key={cine.sucursal.id} className="cine-bloque" aria-labelledby={`cine-${cine.sucursal.id}`}>
          <h3 id={`cine-${cine.sucursal.id}`} className="cine-nombre">{cine.sucursal.nombre}</h3>
          <p className="cine-direccion">Dirección: {cine.sucursal.direccion}</p>

          {cine.grupos.map((grupo) => (
            <div key={grupo.clave} className="grupo-horarios">
              <p className="grupo-clave">{grupo.clave}</p>
              <ul className="lista-horarios">
                {grupo.horarios.map((h) => (
                  <li key={h.funcion.id}>
                    <button
                      type="button"
                      className={`horario nivel-${h.nivel}`}
                      disabled={h.nivel === 'completa'}
                      aria-label={`${h.hora}, sala ${h.sala}, disponibilidad ${TEXTO_NIVEL[h.nivel]}`}
                      onClick={() => onElegir(h.funcion)}
                    >
                      <span className="horario-punto" aria-hidden="true" />
                      {h.hora}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

// Leyenda de disponibilidad, como en la referencia: Alta · Media · Baja · Completa.
export function LeyendaDisponibilidad() {
  return (
    <ul className="leyenda-disponibilidad" aria-label="Disponibilidad de butacas">
      {Object.keys(TEXTO_NIVEL).map((nivel) => (
        <li key={nivel} className={`nivel-${nivel}`}>
          <span className="horario-punto" aria-hidden="true" /> {TEXTO_NIVEL[nivel]}
        </li>
      ))}
    </ul>
  )
}

export default HorariosPorCine
