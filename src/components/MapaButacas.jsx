// Mapa de butacas de una sala.
//
// Este componente NO guarda estado propio: todo lo que necesita se lo pasa
// el padre (Cliente) por props. Es un componente "tonto" y reutilizable:
//   - ocupadas:      array de ids que no se pueden elegir (ej. ['A3', 'B1'])
//   - seleccionadas: array de ids que la persona eligió
//   - onToggle:      función que se llama al hacer clic en una butaca
//
// El estado vive en Cliente ("levantar el estado"): así Cliente también
// puede usar las butacas elegidas para el total y el resumen.

import { FILAS, COLUMNAS } from '../data/funciones'

function MapaButacas({ ocupadas, seleccionadas, onToggle }) {
  return (
    <div className="sala">
      <div className="pantalla" aria-hidden="true">PANTALLA</div>

      {/* Un grupo con nombre para los lectores de pantalla */}
      <div role="group" aria-label="Mapa de butacas">
        {FILAS.map((fila) => (
          <div className="fila-butacas" key={fila} role="group" aria-label={`Fila ${fila}`}>
            <span className="fila-letra" aria-hidden="true">{fila}</span>

            {/* Array.from({ length: 8 }) crea 8 posiciones para recorrer con .map() */}
            {Array.from({ length: COLUMNAS }, (_, i) => {
              const numero = i + 1
              const id = fila + numero
              const estaOcupada = ocupadas.includes(id)
              const estaSeleccionada = seleccionadas.includes(id)

              // El estado también se dice con TEXTO (aria-label), no solo con color.
              const estado = estaOcupada
                ? 'ocupada'
                : estaSeleccionada
                  ? 'seleccionada'
                  : 'libre'

              return (
                <button
                  key={id}
                  type="button"
                  className={`butaca butaca-${estado}`}
                  disabled={estaOcupada}
                  aria-pressed={estaSeleccionada}
                  aria-label={`Fila ${fila}, butaca ${numero}, ${estado}`}
                  onClick={() => onToggle(id)}
                >
                  {numero}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Leyenda: explica qué significa cada tipo de butaca */}
      <ul className="leyenda-butacas" aria-label="Referencias">
        <li><span className="butaca butaca-libre" aria-hidden="true" /> Libre</li>
        <li><span className="butaca butaca-seleccionada" aria-hidden="true" /> Elegida</li>
        <li><span className="butaca butaca-ocupada" aria-hidden="true" /> Ocupada</li>
      </ul>
    </div>
  )
}

export default MapaButacas
