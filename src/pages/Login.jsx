// Ingreso y registro (ruta "/login"), igual que los endpoints /api/auth del backend.
//
// Dos modos en la misma pantalla:
//   - "Ingresar": email + contraseña. El rol viene con la cuenta (no se elige).
//   - "Crear cuenta": registro de cliente (siempre con rol CLIENTE, como el backend).
//
// No hay backend: las cuentas están en data/usuarios.js y las nuevas se guardan en localStorage.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerUsuarios, buscarUsuarioPorEmail, registrarCliente, usuariosIniciales } from '../data/usuarios'
import { iniciarSesion } from '../data/sesion'

// Una validación simple de email: algo@algo.algo
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONO_VALIDO = /^\d{10,20}$/

const REGISTRO_VACIO = { nombre: '', email: '', clave: '', telefono: '' }

// Errores del formulario de registro (vacío = todo bien). Son las mismas reglas
// que el RegistroDTO del backend.
function validarRegistro(datos) {
  const errores = {}
  const nombre = datos.nombre.trim()
  if (nombre.length < 2 || nombre.length > 100) {
    errores.nombre = 'El nombre debe tener entre 2 y 100 caracteres.'
  }
  if (!EMAIL_VALIDO.test(datos.email.trim())) {
    errores.email = 'Ingresá un email válido.'
  } else if (buscarUsuarioPorEmail(datos.email)) {
    errores.email = 'Ya existe una cuenta con ese email.'
  }
  if (datos.clave.length < 6) {
    errores.clave = 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (datos.telefono.trim() !== '' && !TELEFONO_VALIDO.test(datos.telefono.trim())) {
    errores.telefono = 'El teléfono debe tener entre 10 y 20 dígitos (opcional).'
  }
  return errores
}

function Login() {
  // useNavigate devuelve una función para CAMBIAR DE RUTA desde el código.
  const navigate = useNavigate()

  const [modo, setModo] = useState('ingresar') // 'ingresar' | 'registrar'

  // Formulario de ingreso
  const [ingreso, setIngreso] = useState({ email: '', clave: '' })
  const [errorIngreso, setErrorIngreso] = useState('')

  // Formulario de registro
  const [registro, setRegistro] = useState(REGISTRO_VACIO)
  const [erroresRegistro, setErroresRegistro] = useState({})

  function handleIngresoChange(e) {
    setIngreso({ ...ingreso, [e.target.name]: e.target.value })
  }

  function handleRegistroChange(e) {
    setRegistro({ ...registro, [e.target.name]: e.target.value })
  }

  function handleIngresar(e) {
    e.preventDefault()

    if (ingreso.email.trim() === '' || ingreso.clave === '') {
      setErrorIngreso('Completá email y contraseña.')
      return
    }

    // .find() devuelve la PRIMERA cuenta que coincide, o undefined si ninguna.
    const cuenta = obtenerUsuarios().find(
      (u) => u.email.toLowerCase() === ingreso.email.trim().toLowerCase() && u.clave === ingreso.clave,
    )

    if (!cuenta) {
      setErrorIngreso('Email o contraseña incorrectos.')
      return
    }

    iniciarSesion(cuenta)
    setErrorIngreso('')
    navigate('/' + cuenta.rol)
  }

  function handleRegistrarse(e) {
    e.preventDefault()

    const encontrados = validarRegistro(registro)
    setErroresRegistro(encontrados)
    if (Object.keys(encontrados).length > 0) return

    // Las cuentas nuevas siempre son de cliente, como en el backend.
    const cuenta = registrarCliente(registro)
    iniciarSesion(cuenta)
    navigate('/cliente')
  }

  function cambiarModo(nuevo) {
    setModo(nuevo)
    setErrorIngreso('')
    setErroresRegistro({})
  }

  return (
    <section className="contenedor-form">
      <h1>{modo === 'ingresar' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

      {/* Dos botones que funcionan como pestañas: ingresar o crear cuenta */}
      <div className="pestanas" role="group" aria-label="Ingreso o registro">
        <button
          type="button"
          className="pestana"
          aria-pressed={modo === 'ingresar'}
          onClick={() => cambiarModo('ingresar')}
        >
          Ya tengo cuenta
        </button>
        <button
          type="button"
          className="pestana"
          aria-pressed={modo === 'registrar'}
          onClick={() => cambiarModo('registrar')}
        >
          Crear cuenta
        </button>
      </div>

      {modo === 'ingresar' ? (
        <form onSubmit={handleIngresar} noValidate>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={ingreso.email}
              onChange={handleIngresoChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <input
              id="clave"
              name="clave"
              type="password"
              autoComplete="current-password"
              value={ingreso.clave}
              onChange={handleIngresoChange}
            />
          </div>

          {errorIngreso && (
            <p className="error" role="alert">
              {errorIngreso}
            </p>
          )}

          <button type="submit" className="boton">Ingresar</button>
        </form>
      ) : (
        <form onSubmit={handleRegistrarse} noValidate>
          <div className="campo">
            <label htmlFor="reg-nombre">Nombre</label>
            <input
              id="reg-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={registro.nombre}
              onChange={handleRegistroChange}
              aria-invalid={erroresRegistro.nombre ? 'true' : 'false'}
              aria-describedby={erroresRegistro.nombre ? 'error-reg-nombre' : undefined}
            />
            {erroresRegistro.nombre && (
              <p id="error-reg-nombre" className="error" role="alert">{erroresRegistro.nombre}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              value={registro.email}
              onChange={handleRegistroChange}
              aria-invalid={erroresRegistro.email ? 'true' : 'false'}
              aria-describedby={erroresRegistro.email ? 'error-reg-email' : undefined}
            />
            {erroresRegistro.email && (
              <p id="error-reg-email" className="error" role="alert">{erroresRegistro.email}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="reg-clave">Contraseña (mínimo 6 caracteres)</label>
            <input
              id="reg-clave"
              name="clave"
              type="password"
              autoComplete="new-password"
              value={registro.clave}
              onChange={handleRegistroChange}
              aria-invalid={erroresRegistro.clave ? 'true' : 'false'}
              aria-describedby={erroresRegistro.clave ? 'error-reg-clave' : undefined}
            />
            {erroresRegistro.clave && (
              <p id="error-reg-clave" className="error" role="alert">{erroresRegistro.clave}</p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="reg-telefono">Teléfono (opcional, 10 a 20 dígitos)</label>
            <input
              id="reg-telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              value={registro.telefono}
              onChange={handleRegistroChange}
              aria-invalid={erroresRegistro.telefono ? 'true' : 'false'}
              aria-describedby={erroresRegistro.telefono ? 'error-reg-telefono' : undefined}
            />
            {erroresRegistro.telefono && (
              <p id="error-reg-telefono" className="error" role="alert">{erroresRegistro.telefono}</p>
            )}
          </div>

          <button type="submit" className="boton">Crear cuenta</button>
        </form>
      )}

      {/* Ayuda para probar (es una simulación): se borra en una app real */}
      <aside className="ayuda-demo" aria-label="Cuentas de prueba">
        <h2>Cuentas de prueba</h2>
        <ul>
          {usuariosIniciales.map((u) => (
            <li key={u.email}>
              <strong>{u.email}</strong> / {u.clave} ({u.rol})
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

export default Login
