// Paso 2 de la compra: candy opcional, en tarjetas con imagen, sello OFERTA y controles + / −.
// El estado (cuánto de cada producto) vive en la página de compra: acá solo se muestra y se cambia.
//
// PROPS:
//   productos: productos activos ({ id, nombre, descripcion, precio, imagen, oferta })
//   cantidades: { [idProducto]: cantidad }
//   onCambiar:  (idProducto, cambio) → +1 o −1
//   texto:      aclaración bajo el título (opcional)

import { formatearPrecio } from '../../data/formato'

const MAX_POR_PRODUCTO = 10

function TarjetaProducto({ producto, cantidad, onCambiar }) {
  return (
    <li className="producto-tarjeta">
      <div className="producto-imagen">
        {producto.imagen ? (
          <img src={producto.imagen} alt="" loading="lazy" />
        ) : (
          <div className="producto-imagen-fondo" aria-hidden="true">
            <span>{producto.nombre.charAt(0)}</span>
          </div>
        )}
        {producto.oferta && <span className="sello-oferta" aria-hidden="true">OFERTA</span>}
      </div>

      <h3 className="producto-nombre">{producto.nombre}</h3>
      <p className="producto-desc">{producto.descripcion}</p>

      <div className="producto-pie">
        <span className="producto-precio">{formatearPrecio(producto.precio)}</span>
        <div className="producto-cantidad">
          <button
            type="button"
            className="boton-cantidad"
            aria-label={`Quitar ${producto.nombre}`}
            disabled={cantidad === 0}
            onClick={() => onCambiar(producto.id, -1)}
          >
            −
          </button>
          <output aria-label={`Cantidad de ${producto.nombre}`}>{cantidad}</output>
          <button
            type="button"
            className="boton-cantidad"
            aria-label={`Agregar ${producto.nombre}`}
            disabled={cantidad >= MAX_POR_PRODUCTO}
            onClick={() => onCambiar(producto.id, 1)}
          >
            +
          </button>
        </div>
      </div>
    </li>
  )
}

function PasoCandy({ productos, cantidades, onCambiar, texto = 'Es opcional. Lo retirás al inicio de la función.' }) {
  return (
    <section aria-labelledby="titulo-candy">
      <h2 id="titulo-candy" className="titulo-seccion">Candy</h2>
      <p className="texto-suave">{texto}</p>

      <ul className="lista-productos">
        {productos.map((p) => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            cantidad={cantidades[p.id] || 0}
            onCambiar={onCambiar}
          />
        ))}
      </ul>
    </section>
  )
}

export default PasoCandy
