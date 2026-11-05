// Protege una página: solo deja pasar a quien tenga la sesión del rol indicado.
//
// "children" es una prop especial: es TODO lo que se escribe entre las
// etiquetas del componente. En App.jsx:
//     <RutaProtegida rol="admin"> <Admin /> </RutaProtegida>
// children vale <Admin />.
//
// <Navigate> es el equivalente de useNavigate, pero para usar dentro del JSX:
// al dibujarse, redirige. "replace" reemplaza la entrada del historial para
// que el botón "atrás" del navegador no vuelva a la página prohibida.

import { Navigate } from 'react-router-dom'
import { obtenerSesion } from '../data/sesion'

function RutaProtegida({ rol, children }) {
  const sesion = obtenerSesion()

  if (!sesion || sesion.rol !== rol) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RutaProtegida
