// Tarjeta de un integrante del grupo.
//
// Funciona igual que PeliculaCard: recibe UN objeto por props
//   <IntegranteCard integrante={algo} />
// y así una sola tarjeta dibuja a cualquier integrante.

function IntegranteCard({ integrante }) {
  return (
    // <article>: un bloque de contenido independiente, como cada película.
    <article className="integrante-card">
      {/* Todavía no hay fotos: se usa un círculo de color con la inicial.
          aria-hidden="true" lo oculta a los lectores de pantalla, porque es
          decorativo y el nombre ya está escrito abajo. */}
      <div
        className="integrante-avatar"
        style={{ background: integrante.color }}
        aria-hidden="true"
      >
        {integrante.nombre.charAt(0)}
      </div>

      <h3>{integrante.nombre}</h3>
      <p className="integrante-rol">{integrante.rol}</p>
    </article>
  )
}

export default IntegranteCard
