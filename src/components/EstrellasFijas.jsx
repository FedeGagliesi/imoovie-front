// Estrellas de SOLO LECTURA, para mostrar una calificación ya guardada.
//
// '★'.repeat(4) devuelve '★★★★': repeat() repite un texto N veces.
// role="img" + aria-label hacen que un lector de pantalla diga
// "4 de 5 estrellas" en lugar de leer cada símbolo.

function EstrellasFijas({ valor }) {
  return (
    <span className="estrellas-fijas" role="img" aria-label={`${valor} de 5 estrellas`}>
      {'★'.repeat(valor)}
      {'☆'.repeat(5 - valor)}
    </span>
  )
}

export default EstrellasFijas
