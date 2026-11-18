// Mapa de butacas de una sala.
//
// Este componente NO guarda estado propio: todo lo que necesita se lo pasa
// el padre por props. Es un componente "tonto" y reutilizable:
//   - butacas:       la lista de butacas de la sala: { id: 'A1', fila, numero, tipo }
//   - ocupadas:      array de ids que no se pueden elegir (ej. ['A3', 'B1'])
//   - seleccionadas: array de ids que la persona eligió
//   - onToggle:      función que se llama al hacer clic en una butaca
//
// El tipo de butaca (VIP, Premium, Normal) se marca con el borde y se dice en el
// aria-label, así no depende solo del color.

import { TIPOS_BUTACA } from '../data/salas'

function MapaButacas({ butacas, ocupadas, seleccionadas, onToggle }) {
  // Agrupamos las butacas por fila para dibujar una línea por fila.
  const filas = []
  butacas.forEach((b) => {
    let fila = filas.find((f) => f.letra === b.fila)
    if (!fila) {
      fila = { letra: b.fila, lista: [] }
      filas.push(fila)
    }
    fila.lista.push(b)
  })

  return (
    <div className="sala">
      <div className="pantalla" aria-hidden="true">PANTALLA</div>

      {/* Un grupo con nombre para los lectores de pantalla */}
      <div role="group" aria-label="Mapa de butacas">
        {filas.map((fila) => (
          <div className="fila-butacas" key={fila.letra} role="group" aria-label={`Fila ${fila.letra}`}>
            <span className="fila-letra" aria-hidden="true">{fila.letra}</span>

            {fila.lista.map((butaca) => {
              const estaOcupada = ocupadas.includes(butaca.id)
              const estaSeleccionada = seleccionadas.includes(butaca.id)

              // El estado también se dice con TEXTO (aria-label), no solo con color.
              const estado = estaOcupada ? 'ocupada' : estaSeleccionada ? 'seleccionada' : 'libre'

              return (
                <button
                  key={butaca.id}
                  type="button"
                  className={`butaca butaca-${estado} butaca-tipo-${butaca.tipo.toLowerCase()}`}
                  disabled={estaOcupada}
                  aria-pressed={estaSeleccionada}
                  aria-label={`Fila ${butaca.fila}, butaca ${butaca.numero}, ${TIPOS_BUTACA[butaca.tipo]}, ${estado}`}
                  onClick={() => onToggle(butaca.id)}
                >
                  {butaca.numero}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Leyenda: explica qué significa cada estado y cada tipo de butaca */}
      <ul className="leyenda-butacas" aria-label="Referencias">
        <li><span className="butaca butaca-libre" aria-hidden="true" /> Libre</li>
        <li><span className="butaca butaca-seleccionada" aria-hidden="true" /> Elegida</li>
        <li><span className="butaca butaca-ocupada" aria-hidden="true" /> Ocupada</li>
        <li><span className="butaca butaca-tipo-vip" aria-hidden="true" /> VIP</li>
        <li><span className="butaca butaca-tipo-premium" aria-hidden="true" /> Premium</li>
      </ul>
    </div>
  )
}

export default MapaButacas
