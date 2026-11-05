// Una fila de producto de candy con botones − y + para cambiar la cantidad.
//
// Igual que MapaButacas, no guarda estado: el padre le pasa
//   - producto:  el objeto { id, nombre, descripcion, precio }
//   - cantidad:  cuántas unidades hay elegidas
//   - onCambiar: función que se llama con el producto y el cambio (+1 o -1)
// Un mismo componente sirve para el cliente y, más adelante, para el vendedor.

function ProductoCandy({ producto, cantidad, onCambiar }) {
  return (
    <li className="producto-candy">
      <div className="producto-info">
        <strong>{producto.nombre}</strong>
        <span>{producto.descripcion}</span>
        <span className="producto-precio">$ {producto.precio.toLocaleString('es-AR')}</span>
      </div>

      <div className="producto-cantidad">
        {/* aria-label: el botón solo muestra "−" o "+", así que un lector
            de pantalla necesita un texto que diga qué hace */}
        <button
          type="button"
          className="boton-cantidad"
          aria-label={`Quitar ${producto.nombre}`}
          disabled={cantidad === 0}
          onClick={() => onCambiar(producto.id, -1)}
        >
          −
        </button>

        {/* <output> es la etiqueta semántica para un resultado calculado */}
        <output aria-label={`Cantidad de ${producto.nombre}`}>{cantidad}</output>

        <button
          type="button"
          className="boton-cantidad"
          aria-label={`Agregar ${producto.nombre}`}
          onClick={() => onCambiar(producto.id, 1)}
        >
          +
        </button>
      </div>
    </li>
  )
}

export default ProductoCandy
