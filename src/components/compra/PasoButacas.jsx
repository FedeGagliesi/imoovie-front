// Paso 1 de la compra: elegir las butacas en el mapa de la sala.
// Es un componente de presentación: recibe la sala y el estado, y avisa lo que toca la persona.

import MapaSala from './MapaSala'

function PasoButacas({ sala, ocupadas, seleccionadas, onToggle }) {
  return (
    <section aria-labelledby="titulo-butacas">
      <h2 id="titulo-butacas" className="titulo-seccion">Seleccioná tu butaca</h2>
      <p className="texto-suave">Podés elegir hasta 6 butacas.</p>
      <MapaSala
        butacas={sala.butacas}
        ocupadas={ocupadas}
        seleccionadas={seleccionadas}
        onToggle={onToggle}
      />
    </section>
  )
}

export default PasoButacas
