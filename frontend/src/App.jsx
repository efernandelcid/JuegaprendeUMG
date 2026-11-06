
import { useState } from 'react'
import Juego from './components/Juego'
import './App.css'

const API_URL = '/api'

const misiones = {
  Preprimaria: [
    { id: 1, icono: '🎨', titulo: 'Laboratorio de colores', tipo: 'Observación', color: 'coral' },
    { id: 2, icono: '🔍', titulo: 'Detectives de patrones', tipo: 'Secuencias', color: 'verde' },
    { id: 3, icono: '🧺', titulo: 'El gran clasificador', tipo: 'Clasificación', color: 'amarillo' }
  ],
  Primaria: [
    { id: 4, icono: '➕', titulo: 'La ruta de las sumas', tipo: 'Matemáticas', color: 'coral' },
    { id: 5, icono: '➗', titulo: 'El desafío de dividir', tipo: 'Matemáticas', color: 'verde' },
    { id: 6, icono: '🧠', titulo: 'El enigma secreto', tipo: 'Lógica', color: 'amarillo' }
  ]
}

const estilos = {
  tarjeta: {
    background: '#fffdf7',
    borderRadius: 18,
    padding: 28,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    marginBottom: 24
  },
  campo: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    margin: '8px 0 18px',
    padding: 13,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 15
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: 14
  },
  celda: {
    padding: 12,
    borderBottom: '1px solid #e6e6e1'
  },
  error: { color: '#b42318', marginTop: 12 },
  exito: { color: '#21765a', marginTop: 12 }
}

function mostrarPromedio(valor) {
  if (valor === null || valor === undefined) return 'Sin notas'
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero.toFixed(1) : 'Sin notas'
}

function mostrarFecha(valor) {
  if (!valor) return 'Sin fecha'
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime())
    ? String(valor)
    : fecha.toLocaleString('es-GT', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
}

async function solicitar(ruta, opciones = {}) {
  let respuesta

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    const error = new Error(
      datos.mensaje || 'No se pudo completar la solicitud.'
    )
    error.estado = respuesta.status
    throw error
  }

  return datos
}

export default function App() {
  // ESTUDIANTE
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [nivel, setNivel] = useState('Preprimaria')
  const [codigoClase, setCodigoClase] = useState('')
  const [estudianteId, setEstudianteId] = useState(null)
  const [actividad, setActividad] = useState(null)
  const [pantalla, setPantalla] = useState('inicio')
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  // DOCENTE
  const [correoDocente, setCorreoDocente] = useState('')
  const [passwordDocente, setPasswordDocente] = useState('')
  const [docente, setDocente] = useState(null)
  const [tokenDocente, setTokenDocente] = useState('')
  const [errorDocente, setErrorDocente] = useState('')
  const [cargandoDocente, setCargandoDocente] = useState(false)

  // REGISTRO DOCENTE
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoCorreo, setNuevoCorreo] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [registroExito, setRegistroExito] = useState('')

  // CLASES
  const [clases, setClases] = useState([])
  const [nombreClase, setNombreClase] = useState('')
  const [nivelClase, setNivelClase] = useState('Primaria')
  const [creandoClase, setCreandoClase] = useState(false)
  const [errorClases, setErrorClases] = useState('')
  const [exitoClases, setExitoClases] = useState('')
  const [claseSeleccionada, setClaseSeleccionada] = useState('Todas')

  // EDICIÓN DE CLASES
  const [claseEditando, setClaseEditando] = useState(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  // ESTUDIANTES POR CLASE
  const [claseEstudiantesAbierta, setClaseEstudiantesAbierta] = useState(null)
  const [alumnosPorClase, setAlumnosPorClase] = useState({})
  const [cargandoAlumnosClase, setCargandoAlumnosClase] = useState(null)
  const [errorAlumnosClase, setErrorAlumnosClase] = useState('')

  // EDICIÓN DE ESTUDIANTES
  const [estudianteEditando, setEstudianteEditando] = useState(null)
  const [nombreAlumnoEditado, setNombreAlumnoEditado] = useState('')
  const [edadAlumnoEditada, setEdadAlumnoEditada] = useState('')
  const [guardandoAlumno, setGuardandoAlumno] = useState(false)
  const [errorEdicionAlumno, setErrorEdicionAlumno] = useState('')
  const [exitoEdicionAlumno, setExitoEdicionAlumno] = useState('')
  const [eliminandoAlumno, setEliminandoAlumno] = useState(null)

  // REPORTES
  const [estadisticas, setEstadisticas] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [resultados, setResultados] = useState([])
  const [cargandoReportes, setCargandoReportes] = useState(false)
  const [errorReportes, setErrorReportes] = useState('')
  const [reportesCargados, setReportesCargados] = useState(false)
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('Todos')
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('Todos')

  const estudiantesFiltrados = estudiantes.filter(e =>
    e.nombre.toLocaleLowerCase('es').includes(
      busquedaEstudiante.trim().toLocaleLowerCase('es')
    ) &&
    (filtroNivel === 'Todos' || e.nivel === filtroNivel)
  )

  const resultadosFiltrados = resultados.filter(r =>
    (filtroNivel === 'Todos' || r.nivel === filtroNivel) &&
    (estudianteSeleccionado === 'Todos' ||
      String(r.estudianteId) === estudianteSeleccionado) &&
    r.estudiante.toLocaleLowerCase('es').includes(
      busquedaEstudiante.trim().toLocaleLowerCase('es')
    )
  )

  function irAInicio() {
    setMensajeError('')
    setPantalla('inicio')
  }

  function irAAccesoDocente() {
    setErrorDocente('')
    setPantalla(
      docente && tokenDocente ? 'panel-docente' : 'login-docente'
    )
  }

  function manejarSesionExpirada(error) {
    if (error.estado === 401 || error.estado === 403) {
      setDocente(null)
      setTokenDocente('')
      setPantalla('login-docente')
      setErrorDocente(
        'Tu sesión ha expirado. Inicia sesión nuevamente.'
      )
    }
  }

  // REGISTRAR ESTUDIANTE
  async function comenzar(e) {
    e.preventDefault()
    if (cargando) return

    setMensajeError('')
    setMensajeExito('')

    const edadNumero = Number(edad)
    const codigo = codigoClase.trim().toUpperCase()

    if (
      !nombre.trim() ||
      nombre.trim().length > 100 ||
      !Number.isInteger(edadNumero) ||
      edadNumero < 3 ||
      edadNumero > 15
    ) {
      setMensajeError('Ingresa un nombre y una edad válida.')
      return
    }

    if (!codigo) {
      setMensajeError(
        'Debes ingresar el código que te proporcionó tu docente.'
      )
      return
    }

    setCargando(true)

    try {
      const datos = await solicitar('/estudiantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          edad: edadNumero,
          nivel,
          codigoClase: codigo
        })
      })

      if (!datos.estudianteId) {
        throw new Error(
          'El servidor no devolvió el ID del estudiante.'
        )
      }

      setEstudianteId(datos.estudianteId)
      setPantalla('misiones')
    } catch (error) {
      setMensajeError(error.message)
    } finally {
      setCargando(false)
    }
  }

  function abrirMision(mision) {
    setActividad(mision)
    setMensajeError('')
    setMensajeExito('')
    setPantalla('juego')
  }

  async function finalizarMision(resultado) {
    if (!estudianteId || !actividad) {
      setMensajeError(
        'No se encontró el estudiante o la actividad.'
      )
      setPantalla('misiones')
      return
    }

    setCargando(true)
    setMensajeError('')
    setMensajeExito('')

    try {
      await solicitar('/resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteId,
          actividadId: actividad.id,
          puntuacion: resultado.puntuacion,
          aciertos: resultado.aciertos,
          totalPreguntas: resultado.totalPreguntas
        })
      })

      setMensajeExito(
        '¡Resultado guardado correctamente en MySQL!'
      )
    } catch (error) {
      setMensajeError(error.message)
    } finally {
      setCargando(false)
    }
  }

  function volverAMisiones() {
    setActividad(null)
    setPantalla('misiones')
  }

  // REGISTRO DE DOCENTES
  async function registrarDocente(e) {
    e.preventDefault()
    if (cargandoDocente) return

    setErrorDocente('')
    setRegistroExito('')

    if (!nuevoNombre.trim() || !nuevoCorreo.trim()) {
      setErrorDocente('Completa todos los campos.')
      return
    }

    if (nuevaPassword.length < 8) {
      setErrorDocente(
        'La contraseña debe tener al menos 8 caracteres.'
      )
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorDocente('Las contraseñas no coinciden.')
      return
    }

    setCargandoDocente(true)

    try {
      await solicitar('/docentes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          correo: nuevoCorreo.trim().toLowerCase(),
          password: nuevaPassword
        })
      })

      setCorreoDocente(nuevoCorreo.trim().toLowerCase())
      setPasswordDocente('')
      setNuevoNombre('')
      setNuevoCorreo('')
      setNuevaPassword('')
      setConfirmarPassword('')
      setRegistroExito(
        'Cuenta creada correctamente. Ahora inicia sesión.'
      )
      setPantalla('login-docente')
    } catch (error) {
      setErrorDocente(error.message)
    } finally {
      setCargandoDocente(false)
    }
  }

  // INICIO DE SESIÓN DOCENTE
  async function iniciarSesionDocente(e) {
    e.preventDefault()
    if (cargandoDocente) return

    setErrorDocente('')
    setRegistroExito('')
    setCargandoDocente(true)

    try {
      const datos = await solicitar('/docentes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correoDocente.trim().toLowerCase(),
          password: passwordDocente
        })
      })

      if (!datos.token || !datos.docente) {
        throw new Error(
          'La respuesta del servidor está incompleta.'
        )
      }

      setDocente(datos.docente)
      setTokenDocente(datos.token)
      setPasswordDocente('')
      setPantalla('panel-docente')

      await Promise.all([
        cargarClases(datos.token),
        cargarReportes(datos.token, 'Todas')
      ])
    } catch (error) {
      setErrorDocente(error.message)
    } finally {
      setCargandoDocente(false)
    }
  }

  function cerrarSesionDocente() {
    setDocente(null)
    setTokenDocente('')
    setCorreoDocente('')
    setPasswordDocente('')
    setClases([])
    setEstadisticas(null)
    setEstudiantes([])
    setResultados([])
    setReportesCargados(false)
    setBusquedaEstudiante('')
    setFiltroNivel('Todos')
    setEstudianteSeleccionado('Todos')
    setClaseSeleccionada('Todas')
    setClaseEditando(null)
    setNombreEditado('')
    setClaseEstudiantesAbierta(null)
    setAlumnosPorClase({})
    setEstudianteEditando(null)
    setNombreAlumnoEditado('')
    setEdadAlumnoEditada('')
    setErrorEdicionAlumno('')
    setExitoEdicionAlumno('')
    setEliminandoAlumno(null)
    setErrorDocente('')
    setPantalla('login-docente')
  }

  // CONSULTAR CLASES
  async function cargarClases(token = tokenDocente) {
    try {
      setErrorClases('')

      const datos = await solicitar('/docentes/clases', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setClases(datos)
    } catch (error) {
      setErrorClases(error.message)
      manejarSesionExpirada(error)
    }
  }

  // CREAR CLASE
  async function crearClase(e) {
    e.preventDefault()
    if (creandoClase) return

    setErrorClases('')
    setExitoClases('')

    if (!nombreClase.trim()) {
      setErrorClases('Escribe el nombre de la clase.')
      return
    }

    setCreandoClase(true)

    try {
      const datos = await solicitar('/docentes/clases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenDocente}`
        },
        body: JSON.stringify({
          nombre: nombreClase.trim(),
          nivel: nivelClase
        })
      })

      setNombreClase('')
      setExitoClases(
        `Clase creada correctamente. Código: ${datos.clase.codigo}`
      )

      await cargarClases(tokenDocente)
    } catch (error) {
      setErrorClases(error.message)
      manejarSesionExpirada(error)
    } finally {
      setCreandoClase(false)
    }
  }

  // ==========================================
  // NUEVA FUNCIÓN: EDITAR CLASE
  // ==========================================

  function comenzarEdicionClase(clase) {
    setClaseEditando(clase.id)
    setNombreEditado(clase.nombre)
    setErrorClases('')
    setExitoClases('')
  }

  function cancelarEdicionClase() {
    setClaseEditando(null)
    setNombreEditado('')
    setErrorClases('')
  }

  async function guardarEdicionClase(e, claseId) {
    e.preventDefault()

    if (guardandoEdicion) return

    setErrorClases('')
    setExitoClases('')

    const nuevoNombreClase = nombreEditado.trim()

    if (
      !nuevoNombreClase ||
      nuevoNombreClase.length > 100
    ) {
      setErrorClases(
        'El nombre debe tener entre 1 y 100 caracteres.'
      )
      return
    }

    setGuardandoEdicion(true)

    try {
      const datos = await solicitar(
        `/docentes/clases/${claseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenDocente}`
          },
          body: JSON.stringify({
            nombre: nuevoNombreClase
          })
        }
      )

      setClases(clasesActuales =>
        clasesActuales.map(clase =>
          clase.id === claseId
            ? {
                ...clase,
                nombre: datos.clase.nombre
              }
            : clase
        )
      )

      setClaseEditando(null)
      setNombreEditado('')

      setExitoClases(
        `La clase "${datos.clase.nombre}" se actualizó correctamente.`
      )

      await cargarClases(tokenDocente)
      await cargarReportes(
        tokenDocente,
        claseSeleccionada
      )
    } catch (error) {
      setErrorClases(error.message)
      manejarSesionExpirada(error)
    } finally {
      setGuardandoEdicion(false)
    }
  }

  // VER ESTUDIANTES DE UNA CLASE
  async function verEstudiantesClase(claseId) {
    if (claseEstudiantesAbierta === claseId) {
      setClaseEstudiantesAbierta(null)
      setErrorAlumnosClase('')
      return
    }

    setClaseEstudiantesAbierta(claseId)
    setCargandoAlumnosClase(claseId)
    setErrorAlumnosClase('')

    try {
      const datos = await solicitar(
        `/docentes/estudiantes?claseId=${encodeURIComponent(claseId)}`,
        {
          headers: {
            Authorization: `Bearer ${tokenDocente}`
          }
        }
      )

      if (!Array.isArray(datos)) {
        throw new Error('La lista de estudiantes no es válida.')
      }

      setAlumnosPorClase(actuales => ({
        ...actuales,
        [claseId]: datos
      }))
    } catch (error) {
      setErrorAlumnosClase(error.message)
      manejarSesionExpirada(error)
    } finally {
      setCargandoAlumnosClase(null)
    }
  }

  // EDITAR ESTUDIANTE (solo de una clase del docente autenticado)
  function comenzarEdicionAlumno(alumno) {
    setEstudianteEditando(alumno.id)
    setNombreAlumnoEditado(alumno.nombre)
    setEdadAlumnoEditada(String(alumno.edad))
    setErrorEdicionAlumno('')
    setExitoEdicionAlumno('')
  }

  function cancelarEdicionAlumno() {
    setEstudianteEditando(null)
    setNombreAlumnoEditado('')
    setEdadAlumnoEditada('')
    setErrorEdicionAlumno('')
  }

  async function guardarEdicionAlumno(evento) {
    evento.preventDefault()
    if (guardandoAlumno || estudianteEditando === null) return

    const nombreLimpio = nombreAlumnoEditado.trim()
    const edadNumero = Number(edadAlumnoEditada)

    if (!nombreLimpio || nombreLimpio.length > 120 ||
        !Number.isInteger(edadNumero) || edadNumero < 3 || edadNumero > 15) {
      setErrorEdicionAlumno('Ingresa un nombre y una edad válida entre 3 y 15 años.')
      return
    }

    setGuardandoAlumno(true)
    setErrorEdicionAlumno('')
    setExitoEdicionAlumno('')

    try {
      await solicitar(`/docentes/estudiantes/${estudianteEditando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenDocente}`
        },
        body: JSON.stringify({ nombre: nombreLimpio, edad: edadNumero })
      })

      // Reflejar el cambio inmediatamente en ambas tablas.
      const actualizar = alumno => alumno.id === estudianteEditando
        ? { ...alumno, nombre: nombreLimpio, edad: edadNumero }
        : alumno
      setEstudiantes(actuales => actuales.map(actualizar))
      setAlumnosPorClase(actuales => Object.fromEntries(
        Object.entries(actuales).map(([id, alumnos]) => [
          id, alumnos.map(actualizar)
        ])
      ))
      setResultados(actuales => actuales.map(resultado =>
        resultado.estudianteId === estudianteEditando
          ? { ...resultado, estudiante: nombreLimpio }
          : resultado
      ))

      setEstudianteEditando(null)
      setNombreAlumnoEditado('')
      setEdadAlumnoEditada('')
      setExitoEdicionAlumno(`Datos de ${nombreLimpio} actualizados correctamente.`)
    } catch (error) {
      setErrorEdicionAlumno(error.message)
      manejarSesionExpirada(error)
    } finally {
      setGuardandoAlumno(false)
    }
  }

  // ELIMINAR ESTUDIANTE Y SUS CALIFICACIONES (con confirmación)
  async function eliminarAlumno(alumno) {
    if (eliminandoAlumno !== null || guardandoAlumno) return

    const confirmado = window.confirm(
      `¿Eliminar definitivamente a "${alumno.nombre}"?\n\n` +
      'También se eliminarán todas sus calificaciones. ' +
      'Esta acción no se puede deshacer.'
    )
    if (!confirmado) return

    setEliminandoAlumno(alumno.id)
    setErrorEdicionAlumno('')
    setExitoEdicionAlumno('')

    try {
      await solicitar(`/docentes/estudiantes/${alumno.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenDocente}` }
      })

      setEstudiantes(actuales => actuales.filter(e => e.id !== alumno.id))
      setResultados(actuales => actuales.filter(r =>
        String(r.estudianteId) !== String(alumno.id)
      ))
      setAlumnosPorClase(actuales => Object.fromEntries(
        Object.entries(actuales).map(([id, alumnos]) => [
          id, alumnos.filter(e => e.id !== alumno.id)
        ])
      ))
      if (estudianteEditando === alumno.id) {
        setEstudianteEditando(null)
        setNombreAlumnoEditado('')
        setEdadAlumnoEditada('')
      }
      if (estudianteSeleccionado === String(alumno.id)) {
        setEstudianteSeleccionado('Todos')
      }
      setExitoEdicionAlumno(`Estudiante ${alumno.nombre} eliminado correctamente.`)
      await Promise.all([
        cargarClases(tokenDocente),
        cargarReportes(tokenDocente, claseSeleccionada)
      ])
    } catch (error) {
      setErrorEdicionAlumno(error.message)
      manejarSesionExpirada(error)
    } finally {
      setEliminandoAlumno(null)
    }
  }

  function formularioEditarAlumno() {
    return (
      <form onSubmit={guardarEdicionAlumno} style={{
        background: '#fffdf7', border: '1px solid #deded5',
        borderRadius: 10, padding: 14, margin: '10px 0'
      }}>
        <label htmlFor="editar-nombre-alumno">NOMBRE DEL ESTUDIANTE</label>
        <input
          id="editar-nombre-alumno"
          value={nombreAlumnoEditado}
          onChange={e => setNombreAlumnoEditado(e.target.value)}
          maxLength={120}
          required
          style={estilos.campo}
        />
        <label htmlFor="editar-edad-alumno">EDAD</label>
        <input
          id="editar-edad-alumno"
          type="number"
          min="3"
          max="15"
          step="1"
          value={edadAlumnoEditada}
          onChange={e => setEdadAlumnoEditada(e.target.value)}
          required
          style={estilos.campo}
        />
        {errorEdicionAlumno && (
          <p role="alert" style={estilos.error}>{errorEdicionAlumno}</p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" disabled={guardandoAlumno}
            style={{ background: '#102d3b', color: 'white', border: 0,
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
            {guardandoAlumno ? 'Guardando...' : '✓ Guardar cambios'}
          </button>
          <button type="button" onClick={cancelarEdicionAlumno}
            disabled={guardandoAlumno}
            style={{ border: '1px solid #ccc', background: 'white',
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  // REPORTES
  async function cargarReportes(
    token = tokenDocente,
    claseId = claseSeleccionada
  ) {
    if (!token) return

    setCargandoReportes(true)
    setErrorReportes('')
    setReportesCargados(false)

    try {
      const filtro = claseId === 'Todas'
        ? ''
        : `?claseId=${encodeURIComponent(claseId)}`

      const encabezados = {
        Authorization: `Bearer ${token}`
      }

      const rutas = [
        `/docentes/estadisticas${filtro}`,
        `/docentes/estudiantes${filtro}`,
        `/docentes/resultados${filtro}`
      ]

      const datos = await Promise.all(
        rutas.map(ruta =>
          solicitar(ruta, { headers: encabezados })
        )
      )

      setEstadisticas(datos[0])
      setEstudiantes(datos[1])
      setResultados(datos[2])
      setEstudianteSeleccionado('Todos')
      setReportesCargados(true)
    } catch (error) {
      setErrorReportes(error.message)
      setEstadisticas(null)
      setEstudiantes([])
      setResultados([])
      manejarSesionExpirada(error)
    } finally {
      setCargandoReportes(false)
    }
  }

  function seleccionarClase(valor) {
    setClaseSeleccionada(valor)
    cargarReportes(tokenDocente, valor)
  }

  function exportarResultadosCSV() {
    const encabezados = [
      'Estudiante',
      'Nivel',
      'Clase',
      'Actividad',
      'Nota',
      'Aciertos',
      'Total de preguntas',
      'Fecha'
    ]

    const filas = resultadosFiltrados.map(r => [
      r.estudiante,
      r.nivel,
      r.clase || '',
      r.actividad,
      r.puntuacion,
      r.aciertos,
      r.totalPreguntas,
      mostrarFecha(r.fecha)
    ])

    const escapar = valor =>
      `"${String(valor ?? '').replaceAll('"', '""')}"`

    const contenido = '\uFEFF' +
      [encabezados, ...filas]
        .map(fila => fila.map(escapar).join(';'))
        .join('\r\n')

    const url = URL.createObjectURL(
      new Blob(
        [contenido],
        { type: 'text/csv;charset=utf-8;' }
      )
    )

    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'juegaprendeumg-calificaciones.csv'
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
  }

  const esAreaDocente = [
    'login-docente',
    'registro-docente',
    'panel-docente'
  ].includes(pantalla)

  return (
    <div className="aplicacion">

      <aside className="lateral">
        <div className="logotipo">
          <span className="simbolo">✦</span>
          <div>
            <strong>JUEGAPRENDE</strong>
            <small>UMG · ACADEMIA</small>
          </div>
        </div>

        <div className="menu-titulo">EXPLORAR</div>

        <nav className="navegacion">
          <button
            className={pantalla === 'inicio' ? 'activo' : ''}
            onClick={irAInicio}
          >
            <span>⌂</span> Inicio
          </button>

          <button
            className={
              ['misiones', 'juego'].includes(pantalla)
                ? 'activo'
                : ''
            }
            onClick={volverAMisiones}
            disabled={!estudianteId}
          >
            <span>◇</span> Misiones
          </button>

          <button
            className={esAreaDocente ? 'activo' : ''}
            onClick={irAAccesoDocente}
          >
            <span>♙</span> Acceso docente
          </button>
        </nav>

        <div className="lateral-inferior">
          <div className="estrella">★</div>
          <strong>¡Cada reto cuenta!</strong>
          <p>Aprende algo nuevo en cada aventura.</p>
        </div>
      </aside>

      <div className="zona-principal">
        <header className="barra-superior">
          <span>ACADEMIA DE MISIONES / 2026</span>
          <span className="estado">
            <i /> Plataforma educativa
          </span>
        </header>

        {/* INICIO */}
        {pantalla === 'inicio' && (
          <main className="inicio">
            <section className="presentacion">
              <div className="numero-seccion">
                01 / TU PRÓXIMA AVENTURA
              </div>

              <div className="decoracion">✳</div>

              <h1>
                Tu curiosidad<br />
                es tu <em>superpoder.</em>
              </h1>

              <p className="descripcion">
                Entra a una academia donde cada desafío
                es una oportunidad para descubrir,
                pensar y aprender.
              </p>

              <div className="franja">
                <div>
                  <strong>06</strong>
                  <span>Misiones</span>
                </div>
                <div>
                  <strong>02</strong>
                  <span>Niveles</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>Curiosidad</span>
                </div>
              </div>

              <div className="mensaje">
                <span>✦</span>
                <p>
                  ¡El conocimiento es una aventura
                  que nunca termina!
                </p>
              </div>
            </section>

            <section className="panel-registro">
              <div className="panel-cabecera">
                <span>FICHA DE EXPLORADOR</span>
                <span>№ 001</span>
              </div>

              <div className="avatar">🧭</div>

              <h2>
                Identifícate,<br />
                explorador.
              </h2>

              <p>
                Completa tu ficha e ingresa el código
                que te proporcionó tu docente.
              </p>

              <form onSubmit={comenzar}>
                <label htmlFor="nombre">
                  NOMBRE COMPLETO
                </label>

                <input
                  id="nombre"
                  placeholder="¿Cómo te llamas?"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  maxLength={100}
                  required
                />

                <div className="campos-dobles">
                  <div>
                    <label htmlFor="edad">EDAD</label>
                    <input
                      id="edad"
                      type="number"
                      min="3"
                      max="15"
                      placeholder="Años"
                      value={edad}
                      onChange={e => setEdad(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="nivel">NIVEL</label>
                    <select
                      id="nivel"
                      value={nivel}
                      onChange={e => setNivel(e.target.value)}
                    >
                      <option>Preprimaria</option>
                      <option>Primaria</option>
                    </select>
                  </div>
                </div>

                <label htmlFor="codigo-clase">
                  CÓDIGO DE TU CLASE
                </label>

                <input
                  id="codigo-clase"
                  placeholder="Ej. UMG-PRI-A001"
                  value={codigoClase}
                  onChange={e =>
                    setCodigoClase(
                      e.target.value.toUpperCase()
                    )
                  }
                  maxLength={30}
                  autoComplete="off"
                  required
                />

                <p style={{
                  fontSize: 13,
                  marginBottom: 15
                }}>
                  Solicita este código a tu docente para
                  poder acceder a las misiones.
                </p>

                {mensajeError && (
                  <p role="alert" style={estilos.error}>
                    {mensajeError}
                  </p>
                )}

                <button
                  className="boton-principal"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando
                    ? 'Verificando código...'
                    : 'Entrar a la academia'}
                  <span>↗</span>
                </button>
              </form>
            </section>
          </main>
        )}

        {/* MISIONES */}
        {pantalla === 'misiones' && (
          <main className="tablero">
            <div className="numero-seccion">
              02 / TABLERO DE EXPLORACIÓN
            </div>

            <h1>
              ¡Hola, <em>{nombre}!</em>
            </h1>

            <p>
              Explorador de {nivel} · Edad: {edad} años
            </p>

            <p>
              <strong>Código de clase:</strong>{' '}
              {codigoClase}
            </p>

            {mensajeExito && (
              <p role="status" style={estilos.exito}>
                {mensajeExito}
              </p>
            )}

            {mensajeError && (
              <p role="alert" style={estilos.error}>
                {mensajeError}
              </p>
            )}

            <div className="cabecera-misiones">
              <h2>Selecciona tu próxima misión</h2>
              <span>3 DESAFÍOS DISPONIBLES</span>
            </div>

            <div className="lista-misiones">
              {misiones[nivel].map((mision, i) => (
                <article
                  className={`mision ${mision.color}`}
                  key={mision.id}
                >
                  <div className="mision-numero">
                    MISIÓN 0{i + 1}
                  </div>

                  <div className="mision-icono">
                    {mision.icono}
                  </div>

                  <h3>{mision.titulo}</h3>
                  <p>{mision.tipo}</p>

                  <button
                    type="button"
                    className="pendiente"
                    onClick={() => abrirMision(mision)}
                  >
                    Comenzar misión ↗
                  </button>
                </article>
              ))}
            </div>

            <button
              className="boton-volver"
              onClick={irAInicio}
            >
              ← Volver a la ficha
            </button>
          </main>
        )}

        {/* JUEGO */}
        {pantalla === 'juego' && actividad && (
          <div className="juego">
            <Juego
              key={actividad.id}
              actividad={actividad}
              onVolver={volverAMisiones}
              onFinalizar={finalizarMision}
            />
          </div>
        )}

        {/* LOGIN DOCENTE */}
        {pantalla === 'login-docente' && (
          <main
            className="tablero"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '70vh'
            }}
          >
            <section
              style={{
                ...estilos.tarjeta,
                width: '100%',
                maxWidth: 460,
                padding: 40
              }}
            >
              <div className="numero-seccion">
                03 / ÁREA DOCENTE
              </div>

              <div style={{
                fontSize: 48,
                margin: '20px 0'
              }}>
                👨‍🏫
              </div>

              <h1 style={{ fontSize: 36 }}>
                Acceso <em>docente.</em>
              </h1>

              <p style={{ margin: '15px 0 25px' }}>
                Ingresa a tu cuenta para administrar
                tus clases y consultar las calificaciones.
              </p>

              {registroExito && (
                <p role="status" style={estilos.exito}>
                  {registroExito}
                </p>
              )}

              <form onSubmit={iniciarSesionDocente}>
                <label htmlFor="correo-docente">
                  CORREO ELECTRÓNICO
                </label>

                <input
                  id="correo-docente"
                  type="email"
                  placeholder="docente@ejemplo.com"
                  value={correoDocente}
                  onChange={e =>
                    setCorreoDocente(e.target.value)
                  }
                  autoComplete="username"
                  required
                  style={estilos.campo}
                />

                <label htmlFor="password-docente">
                  CONTRASEÑA
                </label>

                <input
                  id="password-docente"
                  type="password"
                  placeholder="Tu contraseña"
                  value={passwordDocente}
                  onChange={e =>
                    setPasswordDocente(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                  style={estilos.campo}
                />

                {errorDocente && (
                  <p role="alert" style={estilos.error}>
                    {errorDocente}
                  </p>
                )}

                <button
                  className="boton-principal"
                  type="submit"
                  disabled={cargandoDocente}
                  style={{ width: '100%' }}
                >
                  {cargandoDocente
                    ? 'Verificando...'
                    : 'Iniciar sesión'}
                  <span>↗</span>
                </button>
              </form>

              <div style={{
                textAlign: 'center',
                marginTop: 25
              }}>
                <p>
                  ¿Eres docente y aún no tienes cuenta?
                </p>

                <button
                  type="button"
                  className="boton-principal"
                  onClick={() => {
                    setErrorDocente('')
                    setRegistroExito('')
                    setPantalla('registro-docente')
                  }}
                  style={{
                    width: '100%',
                    marginTop: 12
                  }}
                >
                  + Crear cuenta docente
                </button>
              </div>

              <button
                className="boton-volver"
                onClick={irAInicio}
                style={{ marginTop: 22 }}
              >
                ← Volver al inicio
              </button>
            </section>
          </main>
        )}

        {/* REGISTRO DOCENTE */}
        {pantalla === 'registro-docente' && (
          <main
            className="tablero"
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <section
              style={{
                ...estilos.tarjeta,
                width: '100%',
                maxWidth: 500,
                padding: 40
              }}
            >
              <div className="numero-seccion">
                04 / NUEVA CUENTA
              </div>

              <div style={{
                fontSize: 48,
                margin: '20px 0'
              }}>
                📚
              </div>

              <h1 style={{ fontSize: 36 }}>
                Únete como <em>docente.</em>
              </h1>

              <p style={{ margin: '15px 0 25px' }}>
                Crea tu cuenta para organizar tus clases,
                compartir códigos y consultar el progreso
                de tus estudiantes.
              </p>

              <form onSubmit={registrarDocente}>
                <label htmlFor="nuevo-nombre">
                  NOMBRE COMPLETO
                </label>

                <input
                  id="nuevo-nombre"
                  placeholder="Nombre del docente"
                  value={nuevoNombre}
                  onChange={e =>
                    setNuevoNombre(e.target.value)
                  }
                  maxLength={100}
                  required
                  style={estilos.campo}
                />

                <label htmlFor="nuevo-correo">
                  CORREO ELECTRÓNICO
                </label>

                <input
                  id="nuevo-correo"
                  type="email"
                  placeholder="docente@ejemplo.com"
                  value={nuevoCorreo}
                  onChange={e =>
                    setNuevoCorreo(e.target.value)
                  }
                  autoComplete="email"
                  required
                  style={estilos.campo}
                />

                <label htmlFor="nueva-password">
                  CONTRASEÑA
                </label>

                <input
                  id="nueva-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaPassword}
                  onChange={e =>
                    setNuevaPassword(e.target.value)
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                  style={estilos.campo}
                />

                <label htmlFor="confirmar-password">
                  CONFIRMAR CONTRASEÑA
                </label>

                <input
                  id="confirmar-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmarPassword}
                  onChange={e =>
                    setConfirmarPassword(e.target.value)
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                  style={estilos.campo}
                />

                {errorDocente && (
                  <p role="alert" style={estilos.error}>
                    {errorDocente}
                  </p>
                )}

                <button
                  className="boton-principal"
                  type="submit"
                  disabled={cargandoDocente}
                  style={{ width: '100%' }}
                >
                  {cargandoDocente
                    ? 'Creando cuenta...'
                    : 'Crear mi cuenta'}
                  <span>↗</span>
                </button>
              </form>

              <button
                type="button"
                className="boton-volver"
                onClick={() => {
                  setErrorDocente('')
                  setPantalla('login-docente')
                }}
                style={{ marginTop: 22 }}
              >
                ← Ya tengo cuenta
              </button>
            </section>
          </main>
        )}

        {/* PANEL DOCENTE */}
        {pantalla === 'panel-docente' && docente && (
          <main className="tablero">
            <div className="numero-seccion">
              05 / PANEL ACADÉMICO
            </div>

            <h1>
              ¡Bienvenido, <em>{docente.nombre}!</em>
            </h1>

            <p>
              Administra tus clases y consulta
              el rendimiento de tus estudiantes.
            </p>

            <section
              style={{
                ...estilos.tarjeta,
                marginTop: 25
              }}
            >
              <h2>👨‍🏫 Panel de control docente</h2>

              <p style={{ marginTop: 12 }}>
                <strong>Nombre:</strong> {docente.nombre}
              </p>

              <p>
                <strong>Correo:</strong> {docente.correo}
              </p>

              <p>
                <strong>Estado:</strong> Sesión iniciada
              </p>

              <button
                className="boton-principal"
                type="button"
                disabled={cargandoReportes}
                onClick={() => {
                  cargarClases()
                  cargarReportes()
                }}
                style={{
                  width: 'auto',
                  padding: '12px 22px',
                  marginTop: 18
                }}
              >
                {cargandoReportes
                  ? 'Actualizando...'
                  : '↻ Actualizar reportes'}
              </button>

              {errorReportes && (
                <p role="alert" style={estilos.error}>
                  {errorReportes}
                </p>
              )}
            </section>

            {/* ADMINISTRACIÓN DE CLASES */}
            <section style={estilos.tarjeta}>
              <div className="numero-seccion">
                06 / ADMINISTRACIÓN DE CLASES
              </div>

              <h2 style={{ marginTop: 15 }}>
                🏫 Mis clases
              </h2>

              <p style={{ margin: '12px 0 25px' }}>
                Crea y administra tus clases.
                Cada una tiene un código único
                para compartir con tus estudiantes.
              </p>

              <form onSubmit={crearClase}>
                <label htmlFor="nombre-clase">
                  NOMBRE DE LA CLASE
                </label>

                <input
                  id="nombre-clase"
                  placeholder="Ej. Primero Primaria A"
                  value={nombreClase}
                  onChange={e =>
                    setNombreClase(e.target.value)
                  }
                  maxLength={100}
                  required
                  style={estilos.campo}
                />

                <label htmlFor="nivel-clase">
                  NIVEL EDUCATIVO
                </label>

                <select
                  id="nivel-clase"
                  value={nivelClase}
                  onChange={e =>
                    setNivelClase(e.target.value)
                  }
                  style={estilos.campo}
                >
                  <option>Preprimaria</option>
                  <option>Primaria</option>
                </select>

                <button
                  className="boton-principal"
                  type="submit"
                  disabled={creandoClase}
                  style={{
                    width: 'auto',
                    padding: '12px 22px'
                  }}
                >
                  {creandoClase
                    ? 'Creando clase...'
                    : '+ Crear nueva clase'}
                </button>
              </form>

              {errorClases && (
                <p role="alert" style={estilos.error}>
                  {errorClases}
                </p>
              )}

              {exitoClases && (
                <p role="status" style={estilos.exito}>
                  {exitoClases}
                </p>
              )}

              <h3 style={{ margin: '30px 0 15px' }}>
                Clases registradas
              </h3>

              {clases.length === 0 ? (
                <p>
                  Todavía no tienes clases registradas.
                  Crea tu primera clase para obtener un código.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 16
                  }}
                >
                  {clases.map(clase => (
                    <div
                      key={clase.id}
                      style={{
                        background: '#f3f4ef',
                        padding: 20,
                        borderRadius: 12
                      }}
                    >
                      <div style={{ fontSize: 30 }}>
                        📚
                      </div>

                      {/* NOMBRE O FORMULARIO DE EDICIÓN */}
                      {claseEditando === clase.id ? (
                        <form
                          onSubmit={e =>
                            guardarEdicionClase(e, clase.id)
                          }
                          style={{
                            marginTop: 15,
                            padding: 15,
                            background: '#fffdf7',
                            borderRadius: 10,
                            border: '1px solid #deded5'
                          }}
                        >
                          <label
                            htmlFor={`editar-clase-${clase.id}`}
                          >
                            NUEVO NOMBRE DE LA CLASE
                          </label>

                          <input
                            id={`editar-clase-${clase.id}`}
                            value={nombreEditado}
                            onChange={e =>
                              setNombreEditado(e.target.value)
                            }
                            maxLength={100}
                            required
                            autoFocus
                            style={estilos.campo}
                          />

                          <p
                            style={{
                              fontSize: 12,
                              marginBottom: 15
                            }}
                          >
                            El nivel y el código de acceso
                            permanecerán iguales.
                          </p>

                          <button
                            className="boton-principal"
                            type="submit"
                            disabled={guardandoEdicion}
                            style={{
                              width: '100%',
                              marginBottom: 10
                            }}
                          >
                            {guardandoEdicion
                              ? 'Guardando...'
                              : '✓ Guardar cambios'}
                          </button>

                          <button
                            type="button"
                            disabled={guardandoEdicion}
                            onClick={cancelarEdicionClase}
                            style={{
                              width: '100%',
                              padding: 12,
                              borderRadius: 8,
                              border: '1px solid #ccc',
                              background: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : (
                        <>
                          <h3 style={{ margin: '10px 0' }}>
                            {clase.nombre}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              comenzarEdicionClase(clase)
                            }
                            disabled={guardandoEdicion}
                            style={{
                              background: '#102d3b',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 14px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginBottom: 15
                            }}
                          >
                            ✏️ Editar clase
                          </button>
                        </>
                      )}

                      <p>
                        <strong>Nivel:</strong>{' '}
                        {clase.nivel}
                      </p>

                      <p>
                        <strong>Estudiantes:</strong>{' '}
                        {clase.totalEstudiantes || 0}
                      </p>

                      <div
                        style={{
                          marginTop: 15,
                          padding: 12,
                          background: '#fff',
                          borderRadius: 8
                        }}
                      >
                        <p style={{ fontSize: 12 }}>
                          CÓDIGO DE LA CLASE
                        </p>

                        <strong
                          style={{
                            fontSize: 20,
                            overflowWrap: 'anywhere'
                          }}
                        >
                          {clase.codigo}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="boton-principal"
                        onClick={async () => {
                          setErrorClases('')
                          try {
                            await navigator.clipboard.writeText(
                              clase.codigo
                            )
                            setExitoClases(
                              `Código ${clase.codigo} copiado.`
                            )
                          } catch {
                            setErrorClases(
                              'No se pudo copiar. Selecciona el código manualmente.'
                            )
                          }
                        }}
                        style={{
                          width: '100%',
                          marginTop: 15
                        }}
                      >
                        📋 Copiar código
                      </button>

                      <button
                        type="button"
                        onClick={() => verEstudiantesClase(clase.id)}
                        disabled={cargandoAlumnosClase === clase.id}
                        style={{
                          width: '100%',
                          marginTop: 12,
                          padding: '13px 16px',
                          background: '#102d3b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {cargandoAlumnosClase === clase.id
                          ? 'Consultando estudiantes...'
                          : claseEstudiantesAbierta === clase.id
                            ? '✕ Cerrar estudiantes'
                            : '👨‍🎓 Ver estudiantes'}
                      </button>

                      {claseEstudiantesAbierta === clase.id && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 15,
                            background: '#fffdf7',
                            borderRadius: 10,
                            border: '1px solid #deded5'
                          }}
                        >
                          <h4 style={{ marginBottom: 12 }}>
                            👨‍🎓 Estudiantes de {clase.nombre}
                          </h4>
                          {exitoEdicionAlumno && (
                            <p role="status" style={estilos.exito}>{exitoEdicionAlumno}</p>
                          )}
                          {errorEdicionAlumno && estudianteEditando === null && (
                            <p role="alert" style={estilos.error}>{errorEdicionAlumno}</p>
                          )}

                          {errorAlumnosClase && (
                            <p role="alert" style={estilos.error}>
                              {errorAlumnosClase}
                            </p>
                          )}

                          {cargandoAlumnosClase === clase.id ? (
                            <p>Cargando estudiantes...</p>
                          ) : !errorAlumnosClase && (
                            (alumnosPorClase[clase.id] || []).length === 0 ? (
                              <p>
                                Esta clase todavía no tiene estudiantes.
                              </p>
                            ) : (
                              <div style={{ overflowX: 'auto' }}>
                                <table style={estilos.tabla}>
                                  <thead>
                                    <tr>
                                      {[
                                        'Nombre',
                                        'Edad',
                                        'Juegos',
                                        'Promedio',
                                        'Acciones'
                                      ].map(titulo => (
                                        <th
                                          key={titulo}
                                          style={estilos.celda}
                                        >
                                          {titulo}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {(alumnosPorClase[clase.id] || []).map(
                                      alumno => (
                                        <tr key={alumno.id}>
                                          <td style={estilos.celda}>
                                            {alumno.nombre}
                                          </td>
                                          <td style={estilos.celda}>
                                            {alumno.edad}
                                          </td>
                                          <td style={estilos.celda}>
                                            {alumno.juegosCompletados ?? 0}
                                          </td>
                                          <td style={estilos.celda}>
                                            {mostrarPromedio(alumno.promedio)}
                                          </td>
                                          <td style={estilos.celda}>
                                            <button type="button"
                                              disabled={guardandoAlumno}
                                              onClick={() => comenzarEdicionAlumno(alumno)}
                                              style={{ border: '1px solid #102d3b',
                                                borderRadius: 7, background: '#fff',
                                                padding: '8px 10px', cursor: 'pointer' }}>
                                              ✏️ Editar
                                            </button>
                                            <button type="button"
                                              disabled={eliminandoAlumno !== null || guardandoAlumno}
                                              onClick={() => eliminarAlumno(alumno)}
                                              style={{ border: '1px solid #b42318',
                                                borderRadius: 7, background: '#fff',
                                                color: '#b42318', marginLeft: 6,
                                                padding: '8px 10px', cursor: 'pointer' }}>
                                              {eliminandoAlumno === alumno.id ? 'Eliminando...' : '🗑️ Eliminar'}
                                            </button>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                                {(alumnosPorClase[clase.id] || []).some(
                                  alumno => alumno.id === estudianteEditando
                                ) && formularioEditarAlumno()}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FILTRO POR CLASE */}
            <section style={estilos.tarjeta}>
              <h2>🔎 Consultar una clase</h2>

              <p style={{ margin: '12px 0' }}>
                Selecciona una clase para ver únicamente
                sus estudiantes y calificaciones.
              </p>

              <label htmlFor="seleccionar-clase">
                CLASE
              </label>

              <select
                id="seleccionar-clase"
                value={claseSeleccionada}
                onChange={e =>
                  seleccionarClase(e.target.value)
                }
                style={estilos.campo}
              >
                <option value="Todas">
                  Todas mis clases
                </option>

                {clases.map(clase => (
                  <option
                    key={clase.id}
                    value={String(clase.id)}
                  >
                    {clase.nombre} — {clase.codigo}
                  </option>
                ))}
              </select>

              {cargandoReportes && (
                <p>Consultando información de MySQL...</p>
              )}
            </section>

            {/* ESTADÍSTICAS */}
            {estadisticas && (
              <>
                <div className="numero-seccion">
                  07 / RESUMEN ESTADÍSTICO
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 18,
                    margin: '20px 0 30px'
                  }}
                >
                  {[
                    [
                      '👨‍🎓',
                      estadisticas.totalEstudiantes,
                      'Estudiantes registrados'
                    ],
                    [
                      '🎮',
                      estadisticas.totalJuegos,
                      'Juegos completados'
                    ],
                    [
                      '📊',
                      mostrarPromedio(
                        estadisticas.promedioGeneral
                      ),
                      'Promedio / 100'
                    ],
                    [
                      '⭐',
                      estadisticas.respuestasCorrectas,
                      'Respuestas correctas'
                    ]
                  ].map(([icono, valor, etiqueta]) => (
                    <div
                      key={etiqueta}
                      style={estilos.tarjeta}
                    >
                      <div style={{ fontSize: 32 }}>
                        {icono}
                      </div>

                      <h2 style={{ fontSize: 38 }}>
                        {valor}
                      </h2>

                      <p>{etiqueta}</p>
                    </div>
                  ))}
                </div>

                <section style={estilos.tarjeta}>
                  <h2>📚 Estudiantes por nivel</h2>

                  <div
                    style={{
                      display: 'flex',
                      gap: 18,
                      flexWrap: 'wrap',
                      marginTop: 20
                    }}
                  >
                    {['Preprimaria', 'Primaria'].map(n => {
                      const registro =
                        estadisticas.estudiantesPorNivel?.find(
                          item => item.nivel === n
                        )

                      return (
                        <div
                          key={n}
                          style={{
                            background: '#f3f4ef',
                            padding: 20,
                            borderRadius: 12,
                            flex: '1 1 180px'
                          }}
                        >
                          <strong>{n}</strong>

                          <h2
                            style={{
                              fontSize: 32,
                              marginTop: 10
                            }}
                          >
                            {registro?.cantidad || 0}
                          </h2>

                          <p>Estudiantes</p>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </>
            )}

            {/* ESTUDIANTES */}
            {reportesCargados && (
              <section style={estilos.tarjeta}>
                <h2>👨‍🎓 Estudiantes registrados</h2>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 20
                  }}
                >
                  <div style={{ flex: '2 1 220px' }}>
                    <label htmlFor="buscar-estudiante">
                      BUSCAR POR NOMBRE
                    </label>

                    <input
                      id="buscar-estudiante"
                      type="search"
                      placeholder="Nombre del estudiante"
                      value={busquedaEstudiante}
                      onChange={e =>
                        setBusquedaEstudiante(e.target.value)
                      }
                      style={estilos.campo}
                    />
                  </div>

                  <div style={{ flex: '1 1 180px' }}>
                    <label htmlFor="filtrar-nivel">
                      FILTRAR POR NIVEL
                    </label>

                    <select
                      id="filtrar-nivel"
                      value={filtroNivel}
                      onChange={e =>
                        setFiltroNivel(e.target.value)
                      }
                      style={estilos.campo}
                    >
                      <option value="Todos">
                        Todos los niveles
                      </option>
                      <option>Preprimaria</option>
                      <option>Primaria</option>
                    </select>
                  </div>
                </div>

                <p>
                  {estudiantesFiltrados.length}{' '}
                  estudiante(s) encontrado(s).
                </p>

                {estudiantesFiltrados.length === 0 ? (
                  <p style={{ marginTop: 15 }}>
                    No hay estudiantes que coincidan
                    con los filtros.
                  </p>
                ) : (
                  <div
                    style={{
                      overflowX: 'auto',
                      marginTop: 20
                    }}
                  >
                    <table style={estilos.tabla}>
                      <thead
                        style={{
                          background: '#102d3b',
                          color: '#fff'
                        }}
                      >
                        <tr>
                          {[
                            'ID',
                            'Nombre',
                            'Edad',
                            'Nivel',
                            'Clase',
                            'Juegos',
                            'Promedio',
                            'Acciones'
                          ].map(t => (
                            <th
                              key={t}
                              style={estilos.celda}
                            >
                              {t}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {estudiantesFiltrados.map(e => (
                          <tr key={e.id}>
                            <td style={estilos.celda}>
                              {e.id}
                            </td>
                            <td style={estilos.celda}>
                              {e.nombre}
                            </td>
                            <td style={estilos.celda}>
                              {e.edad}
                            </td>
                            <td style={estilos.celda}>
                              {e.nivel}
                            </td>
                            <td style={estilos.celda}>
                              {e.clase || '-'}
                            </td>
                            <td style={estilos.celda}>
                              {e.juegosCompletados}
                            </td>
                            <td style={estilos.celda}>
                              {mostrarPromedio(e.promedio)}
                            </td>
                            <td style={estilos.celda}>
                              <button type="button" disabled={guardandoAlumno}
                                onClick={() => comenzarEdicionAlumno(e)}
                                style={{ border: '1px solid #102d3b',
                                  borderRadius: 7, background: '#fff',
                                  padding: '8px 10px', cursor: 'pointer' }}>
                                ✏️ Editar
                              </button>
                              <button type="button"
                                disabled={eliminandoAlumno !== null || guardandoAlumno}
                                onClick={() => eliminarAlumno(e)}
                                style={{ border: '1px solid #b42318',
                                  borderRadius: 7, background: '#fff',
                                  color: '#b42318', marginLeft: 6,
                                  padding: '8px 10px', cursor: 'pointer' }}>
                                {eliminandoAlumno === e.id ? 'Eliminando...' : '🗑️ Eliminar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                      {(claseEstudiantesAbierta === null ||
                        !(alumnosPorClase[claseEstudiantesAbierta] || []).some(
                          alumno => alumno.id === estudianteEditando
                        )) && estudiantesFiltrados.some(
                          alumno => alumno.id === estudianteEditando
                        ) && formularioEditarAlumno()}
                    </div>
                )}
                {exitoEdicionAlumno && (
                  <p role="status" style={estilos.exito}>{exitoEdicionAlumno}</p>
                )}
                {errorEdicionAlumno && estudianteEditando === null && (
                  <p role="alert" style={estilos.error}>{errorEdicionAlumno}</p>
                )}
              </section>
            )}

            {/* CALIFICACIONES */}
            {reportesCargados && (
              <section style={estilos.tarjeta}>
                <h2>🏆 Historial de calificaciones</h2>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: 20
                  }}
                >
                  <div style={{ flex: '2 1 240px' }}>
                    <label htmlFor="estudiante-calificaciones">
                      CALIFICACIONES DE
                    </label>

                    <select
                      id="estudiante-calificaciones"
                      value={estudianteSeleccionado}
                      onChange={e =>
                        setEstudianteSeleccionado(e.target.value)
                      }
                      style={estilos.campo}
                    >
                      <option value="Todos">
                        Todos los estudiantes
                      </option>

                      {estudiantes.map(e => (
                        <option
                          key={e.id}
                          value={String(e.id)}
                        >
                          {e.nombre} (ID {e.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <button
                      type="button"
                      className="boton-principal"
                      onClick={exportarResultadosCSV}
                      disabled={
                        resultadosFiltrados.length === 0
                      }
                      style={{
                        width: 'auto',
                        padding: '12px 20px'
                      }}
                    >
                      ↓ Exportar CSV para Excel
                    </button>
                  </div>
                </div>

                <p>
                  {resultadosFiltrados.length}{' '}
                  resultado(s) encontrado(s).
                </p>

                {resultadosFiltrados.length === 0 ? (
                  <p style={{ marginTop: 15 }}>
                    No hay calificaciones que coincidan
                    con los filtros seleccionados.
                  </p>
                ) : (
                  <div
                    style={{
                      overflowX: 'auto',
                      marginTop: 20
                    }}
                  >
                    <table style={estilos.tabla}>
                      <thead
                        style={{
                          background: '#102d3b',
                          color: '#fff'
                        }}
                      >
                        <tr>
                          {[
                            'Estudiante',
                            'Clase',
                            'Nivel',
                            'Actividad',
                            'Nota',
                            'Aciertos',
                            'Fecha'
                          ].map(t => (
                            <th
                              key={t}
                              style={estilos.celda}
                            >
                              {t}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {resultadosFiltrados.map(r => (
                          <tr key={r.id}>
                            <td style={estilos.celda}>
                              {r.estudiante}
                            </td>

                            <td style={estilos.celda}>
                              {r.clase || '-'}
                            </td>

                            <td style={estilos.celda}>
                              {r.nivel}
                            </td>

                            <td style={estilos.celda}>
                              {r.actividad}
                            </td>

                            <td style={estilos.celda}>
                              <strong
                                style={{
                                  color:
                                    Number(r.puntuacion) >= 60
                                      ? '#21765a'
                                      : '#b42318'
                                }}
                              >
                                {r.puntuacion}/100
                              </strong>
                            </td>

                            <td style={estilos.celda}>
                              {r.aciertos}/{r.totalPreguntas}
                            </td>

                            <td style={estilos.celda}>
                              {mostrarFecha(r.fecha)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            <button
              className="boton-volver"
              onClick={cerrarSesionDocente}
              style={{ marginTop: 10 }}
            >
              ← Cerrar sesión docente
            </button>
          </main>
        )}

        <footer>
          JUEGAPRENDEUMG · APRENDER EXPLORANDO
        </footer>
      </div>
    </div>
  )
}
