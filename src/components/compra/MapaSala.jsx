// Mapa de la sala con forma de sala de cine: pantalla arriba, bloques de butacas
// separados por pasillos, letra de fila a ambos lados y leyenda.
//
// PROPS:
//   butacas:      todas las butacas de la sala ({ id, fila, numero, tipo })
//   ocupadas:     ids que no se pueden elegir
//   seleccionadas: ids elegidos por la persona
//   onToggle:     recibe el id de la butaca tocada
//
// Cada fila se parte en tres bloques (izquierda, centro, derecha) con pasillos entre ellos.
// Así la sala se parece a una sala real aunque la cantidad de butacas cambie.

import { TIPOS_BUTACA } from '../../data/salas'

// Agrupa las butacas por fila, en el orden en que aparecen.
function agruparPorFila(butacas) {
  const filas = []
  butacas.forEach((b) => {
    let fila = filas.find((f) => f.letra === b.fila)
    if (!fila) {
      fila = { letra: b.fila, asientos: [] }
      filas.push(fila)
    }
    fila.asientos.push(b)
  })
  return filas.map((f) => ({ ...f, asientos: [...f.asientos].sort((a, b) => a.numero - b.numero) }))
}

// Parte una fila en [izquierda, centro, derecha]: el 20 % de cada lado (mínimo 1 butaca).
function bloquesDeFila(asientos) {
  const n = asientos.length
  const lado = Math.max(1, Math.round(n * 0.2))
  const izquierda = asientos.slice(0, lado)
  const derecha = asientos.slice(Math.max(lado, n - lado))
  const centro = asientos.slice(lado, Math.max(lado, n - lado))
  return [izquierda, centro, derecha].filter((bloque) => bloque.length > 0)
}

function MapaSala({ butacas, ocupadas, seleccionadas, onToggle }) {
  const filas = agruparPorFila(butacas)

  return (
    <div className="sala-mapa">
      <div className="pantalla-curva" aria-hidden="true">
        <span>PANTALLA</span>
      </div>

      <div className="sala-filas" role="group" aria-label="Mapa de butacas">
        {filas.map((fila) => (
          <div className="sala-fila" key={fila.letra} role="group" aria-label={`Fila ${fila.letra}`}>
            <span className="fila-letra" aria-hidden="true">{fila.letra}</span>

            <div className="sala-bloques">
              {bloquesDeFila(fila.asientos).map((bloque, indice) => (
                <div className="sala-bloque" key={indice}>
                  {bloque.map((b) => {
                    const ocupada = ocupadas.includes(b.id)
                    const elegida = seleccionadas.includes(b.id)
                    const estado = ocupada ? 'ocupada' : elegida ? 'seleccionada' : 'libre'
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className={`asiento asiento-${estado} asiento-tipo-${b.tipo.toLowerCase()}`}
                        disabled={ocupada}
                        aria-pressed={elegida}
                        aria-label={`Fila ${b.fila}, butaca ${b.numero}, ${TIPOS_BUTACA[b.tipo]}, ${
                          ocupada ? 'no disponible' : elegida ? 'seleccionada' : 'disponible'
                        }`}
                        onClick={() => onToggle(b.id)}
                      >
                        {ocupada ? '✕' : b.numero}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <span className="fila-letra" aria-hidden="true">{fila.letra}</span>
          </div>
        ))}
      </div>

      <ul className="leyenda-sala" aria-label="Referencias del mapa">
        <li><span className="asiento asiento-libre" aria-hidden="true" /> Disponible</li>
        <li><span className="asiento asiento-ocupada" aria-hidden="true">✕</span> No disponible</li>
        <li><span className="asiento asiento-seleccionada" aria-hidden="true" /> Seleccionado</li>
        <li><span className="asiento asiento-tipo-vip" aria-hidden="true" /> VIP</li>
        <li><span className="asiento asiento-tipo-premium" aria-hidden="true" /> Premium</li>
      </ul>
    </div>
  )
}

export default MapaSala
