// Compra de una función (ruta "/comprar/:funcionId", solo clientes).
//
// Pasos: 1) butacas → 2) candy (opcional) → 3) pago y términos → comprobante.
// El resumen de la compra queda fijo a la derecha durante todos los pasos, y la barra
// de abajo muestra el total y el botón del paso actual.
//
// La lógica (totales, validaciones y guardado) vive en data/compra.js; esta página
// solo maneja el paso actual y el estado que la persona completa.

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { obtenerFunciones, etiquetaFuncion, haComenzado } from '../data/funciones'
import { obtenerPeliculas } from '../data/peliculas'
import { obtenerSalas } from '../data/salas'
import { obtenerSucursales } from '../data/sucursales'
import { obtenerEntradas, butacasLibres } from '../data/entradas'
import { obtenerProductos } from '../data/candy'
import { obtenerSesion } from '../data/sesion'
import { formatearPrecio } from '../data/formato'
import { calcularTotales, errorCompra, confirmarCompra, METODOS_PAGO } from '../data/compra'
import ResumenCompra from '../components/compra/ResumenCompra'
import PasoButacas from '../components/compra/PasoButacas'
import PasoCandy from '../components/compra/PasoCandy'
import PasoPago from '../components/compra/PasoPago'
import Comprobante from '../components/compra/Comprobante'

const MAX_BUTACAS = 6
const PASOS = ['butacas', 'candy', 'pago']
const NOMBRE_PASO = { butacas: 'Butacas', candy: 'Candy', pago: 'Pago' }

function Comprar() {
  const { funcionId } = useParams()
  const navigate = useNavigate()
  const sesion = obtenerSesion()

  // Datos de la función. Se leen en cada render, así reflejan los cambios del admin.
  const funcion = obtenerFunciones().find((f) => f.id === Number(funcionId))
  const sala = funcion ? obtenerSalas().find((s) => s.id === funcion.salaId) : null
  const sucursal = sala ? obtenerSucursales().find((s) => s.id === sala.sucursalId) : null
  const pelicula = funcion ? obtenerPeliculas().find((p) => p.id === funcion.peliculaId) : null
  const productos = obtenerProductos().filter((p) => p.activo)

  // Estado del flujo. Los hooks van antes de cualquier return condicional.
  const [paso, setPaso] = useState('butacas')
  const [butacas, setButacas] = useState([])
  const [candy, setCandy] = useState({})
  const [metodo, setMetodo] = useState(METODOS_PAGO[0].valor)
  const [menores, setMenores] = useState(false)
  const [terminos, setTerminos] = useState(false)
  const [error, setError] = useState('')
  const [comprobante, setComprobante] = useState(null)

  if (!funcion || !sala || !sucursal || !pelicula) {
    return (
      <section>
        <h1>Función no disponible</h1>
        <p><Link to="/" className="enlace-texto">Volver a la cartelera</Link></p>
      </section>
    )
  }

  if (comprobante) {
    return (
      <div className="compra-layout">
        <Comprobante
          compra={comprobante}
          pelicula={pelicula}
          sucursal={sucursal}
          sala={sala}
          etiquetaFuncionTexto={etiquetaFuncion(funcion, sala)}
        />
        <div className="hero-acciones">
          <button type="button" className="boton" onClick={() => navigate('/cliente')}>Ver mis entradas</button>
          <button type="button" className="boton boton-secundario" onClick={() => navigate('/')}>Volver a la cartelera</button>
        </div>
      </div>
    )
  }

  // Datos derivados
  const libres = butacasLibres(funcion, sala, obtenerEntradas()).map((b) => b.id)
  const ocupadas = sala.butacas.map((b) => b.id).filter((id) => !libres.includes(id))
  const candyLines = productos
    .filter((p) => (candy[p.id] || 0) > 0)
    .map((p) => ({ ...p, cantidad: candy[p.id] }))
  const totales = calcularTotales({ precio: funcion.precio, cantidad: butacas.length, candyLines })
  const indicePaso = PASOS.indexOf(paso)
  const restringida = !['G', 'PG'].includes(pelicula.clasificacion)
  const pagoListo = metodo !== '' && terminos && (!restringida || menores)

  // ---------- Manejadores ----------
  function handleToggleButaca(id) {
    setError('')
    if (butacas.includes(id)) {
      setButacas(butacas.filter((b) => b !== id))
    } else if (butacas.length >= MAX_BUTACAS) {
      setError(`Podés elegir hasta ${MAX_BUTACAS} butacas.`)
    } else {
      setButacas([...butacas, id])
    }
  }

  function handleCambiarCandy(productoId, cambio) {
    const actual = candy[productoId] || 0
    setCandy({ ...candy, [productoId]: Math.min(10, Math.max(0, actual + cambio)) })
  }

  function handleContinuar() {
    if (paso === 'butacas') {
      if (butacas.length === 0) {
        setError('Elegí al menos una butaca para continuar.')
        return
      }
      setError('')
      setPaso('candy')
    } else if (paso === 'candy') {
      setError('')
      setPaso('pago')
    }
  }

  function handleConfirmar() {
    const mensaje = errorCompra(funcion, sala, butacas)
    if (mensaje) {
      setError(mensaje)
      // Si se vendieron butacas mientras pagaba, la persona vuelve a elegir.
      if (mensaje.startsWith('Se acaban')) {
        setButacas(butacas.filter((b) => libres.includes(b)))
        setPaso('butacas')
      }
      return
    }
    const compra = confirmarCompra({
      funcion,
      sala,
      butacas,
      candyLines,
      usuario: sesion.usuario,
      metodoPago: metodo,
      totales,
    })
    setComprobante(compra)
  }

  // ---------- Barra de acción de cada paso ----------
  const accion = paso === 'pago'
    ? { texto: 'Confirmar compra', onClick: handleConfirmar, deshabilitado: !pagoListo || butacas.length === 0 }
    : { texto: paso === 'candy' && candyLines.length === 0 ? 'Continuar sin candy' : 'Continuar', onClick: handleContinuar, deshabilitado: paso === 'butacas' && butacas.length === 0 }

  return (
    <div className="compra-layout">
      <div className="compra-principal">
        <p className="indicador-paso">
          Paso {indicePaso + 1} de {PASOS.length} · {NOMBRE_PASO[paso]}
        </p>
        <p className="compra-cabecera">
          {pelicula.titulo} · {sucursal.nombre} · {etiquetaFuncion(funcion, sala)}
        </p>

        {paso === 'butacas' && (
          <PasoButacas sala={sala} ocupadas={ocupadas} seleccionadas={butacas} onToggle={handleToggleButaca} />
        )}
        {paso === 'candy' && (
          <PasoCandy productos={productos} cantidades={candy} onCambiar={handleCambiarCandy} />
        )}
        {paso === 'pago' && (
          <PasoPago
            sesion={sesion}
            clasificacion={pelicula.clasificacion}
            metodo={metodo}
            onMetodo={setMetodo}
            menores={menores}
            onMenores={setMenores}
            terminos={terminos}
            onTerminos={setTerminos}
          />
        )}

        {error && <p className="error" role="alert">{error}</p>}

        {/* Barra de acción, pegada al final de la columna principal */}
        <div className="barra-compra">
          <div className="barra-total">
            <span>Total</span>
            <strong>{formatearPrecio(totales.total)}</strong>
          </div>
          <div className="barra-acciones">
            {paso !== 'butacas' && (
              <button
                type="button"
                className="boton boton-secundario"
                onClick={() => setPaso(PASOS[indicePaso - 1])}
              >
                Volver
              </button>
            )}
            <button
              type="button"
              className="boton"
              disabled={accion.deshabilitado}
              onClick={accion.onClick}
            >
              {accion.texto}
            </button>
          </div>
        </div>

        <p className="enlace-volver">
          <Link to={`/pelicula/${pelicula.id}`} className="enlace-texto">Volver a la película</Link>
          {haComenzado(funcion) && ' · Esta función ya comenzó.'}
        </p>
      </div>

      <ResumenCompra
        pelicula={pelicula}
        funcion={funcion}
        sala={sala}
        sucursal={sucursal}
        butacas={butacas}
        candyLines={candyLines}
        totales={totales}
      />
    </div>
  )
}

export default Comprar
