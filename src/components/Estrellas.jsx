// Selector de estrellas (1 a 5) para calificar.
//
// Por dentro son 5 botones de radio (<input type="radio">): así funciona con
// el teclado (flechas) y los lectores de pantalla entienden que es UNA
// elección entre 5 opciones. Visualmente el radio está oculto y lo que se ve
// es la estrella de su <label>.
//
// Props:  nombre (único, agrupa los radios) · valor (0 a 5) · onChange(n)

function Estrellas({ nombre, valor, onChange }) {
  return (
    <fieldset className="estrellas">
      <legend>Tu calificación</legend>

      {[1, 2, 3, 4, 5].map((n) => (
        <span className="estrella" key={n}>
          <input
            type="radio"
            id={`${nombre}-${n}`}
            name={nombre}
            value={n}
            checked={valor === n}
            onChange={() => onChange(n)}
          />
          {/* Se pinta llena si su número es menor o igual al valor elegido */}
          <label htmlFor={`${nombre}-${n}`} className={n <= valor ? 'estrella-llena' : ''}>
            <span aria-hidden="true">★</span>
            {/* Texto solo para lectores de pantalla (queda oculto a la vista) */}
            <span className="solo-lectores">
              {n} {n === 1 ? 'estrella' : 'estrellas'}
            </span>
          </label>
        </span>
      ))}
    </fieldset>
  )
}

export default Estrellas
