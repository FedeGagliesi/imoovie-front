// PARTE 4 · Formulario de contacto (ruta "/contacto")
//
// Acá aparece useState: la "memoria" de un componente.
//   const [valor, setValor] = useState(valorInicial)
// Cuando llamamos a setValor(...), React vuelve a ejecutar el componente
// y la pantalla se actualiza con el valor nuevo.

import { useState } from 'react'

// Esta función NO es un componente: es una función común que revisa los
// datos y devuelve un objeto con los errores encontrados.
// Si el objeto queda vacío ({}), significa que todo está bien.
function validar(datos) {
  const errores = {}

  if (datos.nombre.trim().length < 2) {
    errores.nombre = 'Ingresá tu nombre (mínimo 2 letras).'
  }

  // Revisión simple de email: algo + @ + algo + . + algo
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) {
    errores.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.'
  }

  if (datos.mensaje.trim().length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.'
  }

  return errores
}

function Contacto() {
  // ESTADO 1: lo que el usuario escribió en cada campo.
  const [datos, setDatos] = useState({ nombre: '', email: '', mensaje: '' })

  // ESTADO 2: los errores a mostrar (vacío al principio).
  const [errores, setErrores] = useState({})

  // ESTADO 3: ¿ya se "envió" el formulario?
  const [enviado, setEnviado] = useState(false)

  // Se ejecuta cada vez que el usuario escribe en cualquier campo.
  // e.target es el input que cambió; su "name" dice cuál campo es.
  // [e.target.name] entre corchetes usa el VALOR de name como clave:
  // si name="email", esto actualiza solo datos.email.
  // "...datos" copia los demás campos para no perderlos.
  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    // Sin esto, el navegador recargaría la página al enviar el formulario.
    e.preventDefault()

    const erroresEncontrados = validar(datos)
    setErrores(erroresEncontrados)

    // Object.keys(...) devuelve la lista de claves; si hay 0, no hay errores.
    if (Object.keys(erroresEncontrados).length === 0) {
      setEnviado(true) // Envío simulado: no hay backend.
    }
  }

  function enviarOtro() {
    setDatos({ nombre: '', email: '', mensaje: '' })
    setErrores({})
    setEnviado(false)
  }

  // RENDERIZADO CONDICIONAL: si ya se envió, mostramos la confirmación
  // en lugar del formulario.
  if (enviado) {
    return (
      <section className="contenedor-form">
        <h1>¡Gracias, {datos.nombre}!</h1>
        {/* role="status" hace que los lectores de pantalla anuncien el mensaje */}
        <p role="status">
          Recibimos tu mensaje y te vamos a responder a {datos.email}.
        </p>
        <button type="button" className="boton" onClick={enviarOtro}>
          Enviar otro mensaje
        </button>
      </section>
    )
  }

  return (
    <section className="contenedor-form">
      <h1>Contacto</h1>
      <p>Escribinos y te respondemos a la brevedad.</p>

      {/* noValidate desactiva los carteles automáticos del navegador
          para que se vean NUESTROS mensajes de error. */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="campo">
          {/* htmlFor + id unen la etiqueta con su input: al hacer clic en
              la etiqueta se enfoca el campo, y los lectores de pantalla
              saben qué se está pidiendo. */}
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={datos.nombre}
            onChange={handleChange}
            aria-invalid={errores.nombre ? 'true' : 'false'}
            aria-describedby={errores.nombre ? 'error-nombre' : undefined}
          />
          {/* && : si hay error de nombre, mostramos el mensaje; si no, nada */}
          {errores.nombre && (
            <p id="error-nombre" className="error" role="alert">
              {errores.nombre}
            </p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={datos.email}
            onChange={handleChange}
            aria-invalid={errores.email ? 'true' : 'false'}
            aria-describedby={errores.email ? 'error-email' : undefined}
          />
          {errores.email && (
            <p id="error-email" className="error" role="alert">
              {errores.email}
            </p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows="5"
            value={datos.mensaje}
            onChange={handleChange}
            aria-invalid={errores.mensaje ? 'true' : 'false'}
            aria-describedby={errores.mensaje ? 'error-mensaje' : undefined}
          />
          {errores.mensaje && (
            <p id="error-mensaje" className="error" role="alert">
              {errores.mensaje}
            </p>
          )}
        </div>

        <button type="submit" className="boton">Enviar</button>
      </form>
    </section>
  )
}

export default Contacto
