// PARTE 5 · Login simulado (ruta "/login")
//
// No hay backend: comparamos lo que escribió la persona contra la lista
// de usuarios de prueba (data/usuarios.js). Si coincide, la mandamos a
// la página de su rol con useNavigate.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuarios, roles } from '../data/usuarios'
import { iniciarSesion } from '../data/sesion'

function Login() {
  // useNavigate devuelve una función para CAMBIAR DE RUTA desde el código.
  // <Link> sirve para que el usuario haga clic; navigate() sirve cuando
  // somos nosotros quienes decidimos redirigir (por ejemplo, tras validar).
  const navigate = useNavigate()

  // Mismo patrón que en Contacto: un estado con todos los campos.
  const [datos, setDatos] = useState({ usuario: '', clave: '', rol: 'cliente' })
  const [error, setError] = useState('')

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    // 1) Validación de campos vacíos
    if (datos.usuario.trim() === '' || datos.clave === '') {
      setError('Completá usuario y contraseña.')
      return // salimos de la función: no seguimos
    }

    // 2) .find() recorre el array y devuelve el PRIMER elemento que cumple
    //    la condición (o undefined si ninguno la cumple).
    const encontrado = usuarios.find(
      (u) =>
        u.usuario === datos.usuario.trim() &&
        u.clave === datos.clave &&
        u.rol === datos.rol
    )

    if (!encontrado) {
      setError('Usuario, contraseña o rol incorrectos.')
      return
    }

    // 3) Todo bien: guardamos la sesión (para que el resto de la app sepa
    //    quién ingresó) y redirigimos a /cliente, /vendedor o /admin
    iniciarSesion(encontrado)
    setError('')
    navigate('/' + encontrado.rol)
  }

  return (
    <section className="contenedor-form">
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="campo">
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            autoComplete="username"
            value={datos.usuario}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            value={datos.clave}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label htmlFor="rol">Ingresar como</label>
          {/* El <select> también es un input controlado: value + onChange.
              Sus opciones se generan con .map(), igual que la cartelera. */}
          <select id="rol" name="rol" value={datos.rol} onChange={handleChange}>
            {roles.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Renderizado condicional: el error solo aparece si hay texto */}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton">Ingresar</button>
      </form>

      {/* Ayuda para probar (es una simulación): se borra en una app real */}
      <aside className="ayuda-demo" aria-label="Usuarios de prueba">
        <h2>Usuarios de prueba</h2>
        <ul>
          {usuarios.map((u) => (
            <li key={u.usuario}>
              <strong>{u.usuario}</strong> / {u.clave}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

export default Login
