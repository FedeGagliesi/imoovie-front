// Franja de fechas (HOY, VIE 13/11, SÁB 14/11...). Elegir una fecha filtra los horarios.
//
// PROPS:
//   fechas:      lista de fechas "AAAA-MM-DD" con funciones a la venta
//   seleccionada: la fecha activa
//   onElegir:    recibe la fecha elegida

import { hoyISO, diaCorto } from '../../data/formato'

function FranjaFechas({ fechas, seleccionada, onElegir }) {
  const hoy = hoyISO()

  return (
    <div className="franja-fechas" role="group" aria-label="Elegí el día">
      {fechas.map((fecha) => {
        const { dia, numero } = diaCorto(fecha)
        const activa = fecha === seleccionada
        return (
          <button
            key={fecha}
            type="button"
            className={`franja-dia ${activa ? 'franja-dia-activa' : ''}`}
            aria-pressed={activa}
            onClick={() => onElegir(fecha)}
          >
            <span className="franja-dia-nombre">{fecha === hoy ? 'HOY' : dia}</span>
            {fecha !== hoy && <span className="franja-dia-numero">{numero}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default FranjaFechas
