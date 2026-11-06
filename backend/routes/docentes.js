
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('node:crypto')
const db = require('../db')

const router = express.Router()

// ==========================================
// 1. INICIO DE SESIÓN DOCENTE
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body || {}

    if (
      typeof correo !== 'string' ||
      typeof password !== 'string' ||
      !correo.trim() ||
      !password
    ) {
      return res.status(400).json({
        mensaje: 'Ingresa tu correo y contraseña.'
      })
    }

    const [docentes] = await db.execute(
      `SELECT id, nombre, correo, password_hash
       FROM docentes
       WHERE correo = ?`,
      [correo.trim().toLowerCase()]
    )

    if (!docentes.length) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      })
    }

    const docente = docentes[0]

    const passwordCorrecta = await bcrypt.compare(
      password,
      docente.password_hash
    )

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado')
    }

    const token = jwt.sign(
      {
        docenteId: docente.id,
        rol: 'docente'
      },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '2h'
      }
    )

    return res.json({
      mensaje: 'Inicio de sesión correcto.',
      token,
      docente: {
        id: docente.id,
        nombre: docente.nombre,
        correo: docente.correo
      }
    })
  } catch (error) {
    console.error('Error en login docente:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo iniciar sesión.'
    })
  }
})

// ==========================================
// 2. REGISTRO DE NUEVOS DOCENTES
// ==========================================

router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body || {}

    if (
      typeof nombre !== 'string' ||
      typeof correo !== 'string' ||
      typeof password !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 100 ||
      correo.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        mensaje:
          'Ingresa un nombre, correo válido y contraseña de 8 a 72 caracteres.'
      })
    }

    const correoNormalizado = correo.trim().toLowerCase()

    const [existentes] = await db.execute(
      'SELECT id FROM docentes WHERE correo = ? LIMIT 1',
      [correoNormalizado]
    )

    if (existentes.length) {
      return res.status(409).json({
        mensaje:
          'Este correo ya está registrado. Inicia sesión o utiliza otro correo.'
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [resultado] = await db.execute(
      `INSERT INTO docentes
       (nombre, correo, password_hash)
       VALUES (?, ?, ?)`,
      [nombre.trim(), correoNormalizado, passwordHash]
    )

    return res.status(201).json({
      mensaje: 'Cuenta docente creada correctamente.',
      docente: {
        id: resultado.insertId,
        nombre: nombre.trim(),
        correo: correoNormalizado
      }
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado.'
      })
    }

    console.error('Error al registrar docente:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo crear la cuenta docente.'
    })
  }
})

// ==========================================
// 3. VERIFICAR AUTENTICACIÓN DOCENTE
// ==========================================

function verificarDocente(req, res, next) {
  const autorizacion = req.headers.authorization || ''
  const partes = autorizacion.split(' ')

  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer' ||
    !partes[1]
  ) {
    return res.status(401).json({
      mensaje: 'Acceso denegado. Debes iniciar sesión.'
    })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      mensaje: 'Error de configuración del servidor.'
    })
  }

  try {
    const datos = jwt.verify(
      partes[1],
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    )

    if (
      datos.rol !== 'docente' ||
      !Number.isInteger(datos.docenteId) ||
      datos.docenteId <= 0
    ) {
      return res.status(403).json({
        mensaje: 'No tienes permiso para acceder.'
      })
    }

    req.docenteId = datos.docenteId
    next()
  } catch {
    return res.status(401).json({
      mensaje: 'Tu sesión es inválida o ha expirado.'
    })
  }
}

// Las rutas siguientes requieren inicio de sesión.
router.use(verificarDocente)

// ==========================================
// 4. GENERAR CÓDIGOS ÚNICOS
// ==========================================

function generarCodigoClase() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = 'UMG-'

  for (let i = 0; i < 8; i++) {
    const indice = crypto.randomInt(caracteres.length)
    codigo += caracteres[indice]
  }

  return codigo
}

// ==========================================
// 5. CREAR CLASE
// POST /api/docentes/clases
// ==========================================

router.post('/clases', async (req, res) => {
  try {
    const { nombre, nivel } = req.body || {}

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 100 ||
      !['Preprimaria', 'Primaria'].includes(nivel)
    ) {
      return res.status(400).json({
        mensaje: 'Ingresa un nombre y nivel válidos.'
      })
    }

    for (let intento = 0; intento < 5; intento++) {
      const codigo = generarCodigoClase()

      try {
        const [resultado] = await db.execute(
          `INSERT INTO clases
           (docente_id, nombre, nivel, codigo)
           VALUES (?, ?, ?, ?)`,
          [
            req.docenteId,
            nombre.trim(),
            nivel,
            codigo
          ]
        )

        return res.status(201).json({
          mensaje: 'Clase creada correctamente.',
          clase: {
            id: resultado.insertId,
            nombre: nombre.trim(),
            nivel,
            codigo
          }
        })
      } catch (error) {
        if (
          error.code === 'ER_DUP_ENTRY' &&
          error.message.includes('codigo')
        ) {
          continue
        }

        throw error
      }
    }

    return res.status(503).json({
      mensaje:
        'No se pudo generar un código único. Intenta nuevamente.'
    })
  } catch (error) {
    console.error('Error al crear clase:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo crear la clase.'
    })
  }
})

// ==========================================
// 6. CONSULTAR MIS CLASES
// GET /api/docentes/clases
// ==========================================

router.get('/clases', async (req, res) => {
  try {
    const [clases] = await db.execute(
      `SELECT
         c.id,
         c.nombre,
         c.nivel,
         c.codigo,
         c.fecha_creacion AS fechaCreacion,
         COUNT(e.id) AS totalEstudiantes
       FROM clases c
       LEFT JOIN estudiantes e
         ON e.clase_id = c.id
       WHERE c.docente_id = ?
       GROUP BY
         c.id,
         c.nombre,
         c.nivel,
         c.codigo,
         c.fecha_creacion
       ORDER BY c.id DESC`,
      [req.docenteId]
    )

    return res.json(clases)
  } catch (error) {
    console.error('Error al consultar clases:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudieron consultar las clases.'
    })
  }
})

// ==========================================
// 7. CONSULTAR UNA CLASE PROPIA
// GET /api/docentes/clases/:id
// ==========================================

router.get('/clases/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la clase no es válido.'
      })
    }

    const [clases] = await db.execute(
      `SELECT
         id,
         nombre,
         nivel,
         codigo,
         fecha_creacion AS fechaCreacion
       FROM clases
       WHERE id = ?
         AND docente_id = ?`,
      [id, req.docenteId]
    )

    if (!clases.length) {
      return res.status(404).json({
        mensaje: 'Clase no encontrada.'
      })
    }

    return res.json(clases[0])
  } catch (error) {
    console.error('Error al consultar clase:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo consultar la clase.'
    })
  }
})

// ==========================================
// 8. EDITAR NOMBRE DE UNA CLASE
// PUT /api/docentes/clases/:id
// ==========================================

router.put('/clases/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre } = req.body || {}

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: 'El ID de la clase no es válido.'
      })
    }

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 100
    ) {
      return res.status(400).json({
        mensaje:
          'El nombre de la clase debe tener entre 1 y 100 caracteres.'
      })
    }

    // Solo se pueden editar las clases propias.
    const [clases] = await db.execute(
      `SELECT id, nombre, nivel, codigo
       FROM clases
       WHERE id = ?
         AND docente_id = ?
       LIMIT 1`,
      [id, req.docenteId]
    )

    if (!clases.length) {
      return res.status(404).json({
        mensaje:
          'La clase no existe o no tienes permiso para editarla.'
      })
    }

    const nuevoNombre = nombre.trim()

    // No se modifica el código ni el nivel.
    await db.execute(
      `UPDATE clases
       SET nombre = ?
       WHERE id = ?
         AND docente_id = ?`,
      [nuevoNombre, id, req.docenteId]
    )

    return res.json({
      mensaje: 'Clase actualizada correctamente.',
      clase: {
        id,
        nombre: nuevoNombre,
        nivel: clases[0].nivel,
        codigo: clases[0].codigo
      }
    })
  } catch (error) {
    console.error('Error al editar clase:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo actualizar la clase.'
    })
  }
})

// ==========================================
// 9. VALIDAR CLASE DEL DOCENTE
// ==========================================

async function validarClasePropia(claseId, docenteId) {
  if (claseId === '') {
    return { valido: true, id: null }
  }

  if (
    typeof claseId !== 'string' ||
    !/^[1-9]\d*$/.test(claseId) ||
    !Number.isSafeInteger(Number(claseId))
  ) {
    return {
      valido: false,
      mensaje: 'El ID de la clase no es válido.',
      estado: 400
    }
  }

  const [clases] = await db.execute(
    `SELECT id
     FROM clases
     WHERE id = ?
       AND docente_id = ?`,
    [Number(claseId), docenteId]
  )

  if (!clases.length) {
    return {
      valido: false,
      mensaje: 'La clase no existe o no te pertenece.',
      estado: 404
    }
  }

  return {
    valido: true,
    id: Number(claseId)
  }
}

// ==========================================
// 10. CONSULTAR ESTUDIANTES
// GET /api/docentes/estudiantes
// ==========================================

router.get('/estudiantes', async (req, res) => {
  try {
    const {
      buscar = '',
      nivel = '',
      claseId = ''
    } = req.query

    if (
      typeof buscar !== 'string' ||
      buscar.length > 100 ||
      typeof nivel !== 'string' ||
      !['', 'Preprimaria', 'Primaria'].includes(nivel)
    ) {
      return res.status(400).json({
        mensaje: 'Los filtros de búsqueda no son válidos.'
      })
    }

    const clase = await validarClasePropia(
      claseId,
      req.docenteId
    )

    if (!clase.valido) {
      return res.status(clase.estado).json({
        mensaje: clase.mensaje
      })
    }

    const condiciones = ['c.docente_id = ?']
    const parametros = [req.docenteId]

    if (buscar.trim()) {
      condiciones.push('e.nombre LIKE ?')
      parametros.push(`%${buscar.trim()}%`)
    }

    if (nivel) {
      condiciones.push('e.nivel = ?')
      parametros.push(nivel)
    }

    if (clase.id !== null) {
      condiciones.push('c.id = ?')
      parametros.push(clase.id)
    }

    const [estudiantes] = await db.execute(
      `SELECT
         e.id,
         e.nombre,
         e.edad,
         e.nivel,
         e.clase_id AS claseId,
         c.nombre AS clase,
         c.codigo AS codigoClase,
         COUNT(r.id) AS juegosCompletados,
         ROUND(AVG(r.puntuacion), 2) AS promedio
       FROM estudiantes e
       INNER JOIN clases c
         ON c.id = e.clase_id
       LEFT JOIN resultados r
         ON r.estudiante_id = e.id
       WHERE ${condiciones.join(' AND ')}
       GROUP BY
         e.id,
         e.nombre,
         e.edad,
         e.nivel,
         e.clase_id,
         c.nombre,
         c.codigo
       ORDER BY e.id DESC`,
      parametros
    )

    return res.json(estudiantes)
  } catch (error) {
    console.error(
      'Error al consultar estudiantes:',
      error.message
    )

    return res.status(500).json({
      mensaje: 'No se pudieron consultar los estudiantes.'
    })
  }
})

// ==========================================
// 11. CONSULTAR RESULTADOS
// GET /api/docentes/resultados
// ==========================================

router.get('/resultados', async (req, res) => {
  try {
    const {
      nivel = '',
      estudianteId = '',
      claseId = ''
    } = req.query

    if (
      typeof nivel !== 'string' ||
      !['', 'Preprimaria', 'Primaria'].includes(nivel)
    ) {
      return res.status(400).json({
        mensaje: 'El nivel seleccionado no es válido.'
      })
    }

    if (
      typeof estudianteId !== 'string' ||
      (
        estudianteId !== '' &&
        (
          !/^[1-9]\d*$/.test(estudianteId) ||
          !Number.isSafeInteger(Number(estudianteId))
        )
      )
    ) {
      return res.status(400).json({
        mensaje: 'El ID del estudiante no es válido.'
      })
    }

    const clase = await validarClasePropia(
      claseId,
      req.docenteId
    )

    if (!clase.valido) {
      return res.status(clase.estado).json({
        mensaje: clase.mensaje
      })
    }

    const condiciones = ['c.docente_id = ?']
    const parametros = [req.docenteId]

    if (nivel) {
      condiciones.push('e.nivel = ?')
      parametros.push(nivel)
    }

    if (estudianteId) {
      condiciones.push('e.id = ?')
      parametros.push(Number(estudianteId))
    }

    if (clase.id !== null) {
      condiciones.push('c.id = ?')
      parametros.push(clase.id)
    }

    const [resultados] = await db.execute(
      `SELECT
         r.id,
         r.estudiante_id AS estudianteId,
         e.nombre AS estudiante,
         e.nivel,
         e.clase_id AS claseId,
         c.nombre AS clase,
         a.titulo AS actividad,
         r.puntuacion,
         r.aciertos,
         r.total_preguntas AS totalPreguntas,
         r.fecha
       FROM resultados r
       INNER JOIN estudiantes e
         ON e.id = r.estudiante_id
       INNER JOIN clases c
         ON c.id = e.clase_id
       INNER JOIN actividades a
         ON a.id = r.actividad_id
       WHERE ${condiciones.join(' AND ')}
       ORDER BY r.fecha DESC, r.id DESC`,
      parametros
    )

    return res.json(resultados)
  } catch (error) {
    console.error(
      'Error al consultar resultados:',
      error.message
    )

    return res.status(500).json({
      mensaje: 'No se pudieron consultar los resultados.'
    })
  }
})

// ==========================================
// 12. ESTADÍSTICAS DEL DOCENTE
// GET /api/docentes/estadisticas
// ==========================================

router.get('/estadisticas', async (req, res) => {
  try {
    const { claseId = '' } = req.query

    const clase = await validarClasePropia(
      claseId,
      req.docenteId
    )

    if (!clase.valido) {
      return res.status(clase.estado).json({
        mensaje: clase.mensaje
      })
    }

    const filtroClase =
      clase.id !== null ? ' AND c.id = ?' : ''

    const parametros =
      clase.id !== null
        ? [req.docenteId, clase.id]
        : [req.docenteId]

    const [estudiantes] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM estudiantes e
       INNER JOIN clases c
         ON c.id = e.clase_id
       WHERE c.docente_id = ?
       ${filtroClase}`,
      parametros
    )

    const [resultados] = await db.execute(
      `SELECT
         COUNT(*) AS totalJuegos,
         ROUND(AVG(r.puntuacion), 2) AS promedioGeneral,
         COALESCE(SUM(r.aciertos), 0) AS respuestasCorrectas
       FROM resultados r
       INNER JOIN estudiantes e
         ON e.id = r.estudiante_id
       INNER JOIN clases c
         ON c.id = e.clase_id
       WHERE c.docente_id = ?
       ${filtroClase}`,
      parametros
    )

    const [niveles] = await db.execute(
      `SELECT
         e.nivel,
         COUNT(*) AS cantidad
       FROM estudiantes e
       INNER JOIN clases c
         ON c.id = e.clase_id
       WHERE c.docente_id = ?
       ${filtroClase}
       GROUP BY e.nivel`,
      parametros
    )

    return res.json({
      totalEstudiantes: estudiantes[0].total,
      totalJuegos: resultados[0].totalJuegos,
      promedioGeneral:
        resultados[0].promedioGeneral === null
          ? 0
          : Number(resultados[0].promedioGeneral),
      respuestasCorrectas:
        Number(resultados[0].respuestasCorrectas),
      estudiantesPorNivel: niveles
    })
  } catch (error) {
    console.error(
      'Error al consultar estadísticas:',
      error.message
    )

    return res.status(500).json({
      mensaje: 'No se pudieron consultar las estadísticas.'
    })
  }
})


// ==========================================
// 11. EDITAR ESTUDIANTE - PASO 71
// PUT /api/docentes/estudiantes/:id
// ==========================================

router.put('/estudiantes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre, edad } = req.body || {}

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        mensaje: 'El ID del estudiante no es válido.'
      })
    }

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 120
    ) {
      return res.status(400).json({
        mensaje: 'El nombre debe tener entre 1 y 120 caracteres.'
      })
    }

    if (
      !Number.isInteger(edad) ||
      edad < 3 ||
      edad > 15
    ) {
      return res.status(400).json({
        mensaje: 'La edad debe estar entre 3 y 15 años.'
      })
    }

    // Comprobar que el estudiante pertenece
    // a una clase del docente autenticado.
    const [estudiantes] = await db.execute(
      `SELECT e.id
       FROM estudiantes e
       INNER JOIN clases c
         ON c.id = e.clase_id
       WHERE e.id = ?
         AND c.docente_id = ?
       LIMIT 1`,
      [id, req.docenteId]
    )

    if (!estudiantes.length) {
      return res.status(404).json({
        mensaje:
          'El estudiante no existe o no pertenece a tus clases.'
      })
    }

    // Actualizar únicamente nombre y edad.
    // La clase, el nivel y las calificaciones
    // no se modifican.
    const [resultado] = await db.execute(
      `UPDATE estudiantes e
       INNER JOIN clases c
         ON c.id = e.clase_id
       SET e.nombre = ?, e.edad = ?
       WHERE e.id = ?
         AND c.docente_id = ?`,
      [
        nombre.trim(),
        edad,
        id,
        req.docenteId
      ]
    )

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'No se pudo encontrar el estudiante.'
      })
    }

    return res.json({
      mensaje: 'Estudiante actualizado correctamente.',
      estudiante: {
        id,
        nombre: nombre.trim(),
        edad
      }
    })
  } catch (error) {
    console.error(
      'Error al editar estudiante:',
      error.message
    )

    return res.status(500).json({
      mensaje: 'No se pudo actualizar el estudiante.'
    })
  }
})

// ==========================================
// EXPORTAR RUTAS
// ==========================================


// ==========================================
// PASO 78 - ELIMINAR ESTUDIANTE
// DELETE /api/docentes/estudiantes/:id
// ==========================================

router.delete('/estudiantes/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: 'El ID del estudiante no es válido.'
    })
  }

  let conexion

  try {
    conexion = await db.getConnection()
    await conexion.beginTransaction()

    const [estudiantes] = await conexion.execute(
      `SELECT e.id, e.nombre
       FROM estudiantes e
       INNER JOIN clases c ON c.id = e.clase_id
       WHERE e.id = ? AND c.docente_id = ?
       LIMIT 1 FOR UPDATE`,
      [id, req.docenteId]
    )

    if (estudiantes.length === 0) {
      await conexion.rollback()
      return res.status(404).json({
        mensaje: 'El estudiante no existe o no pertenece a tus clases.'
      })
    }

    const estudiante = estudiantes[0]

    const [resultados] = await conexion.execute(
      'DELETE FROM resultados WHERE estudiante_id = ?',
      [id]
    )

    const [eliminacion] = await conexion.execute(
      'DELETE FROM estudiantes WHERE id = ?',
      [id]
    )

    if (eliminacion.affectedRows !== 1) {
      throw new Error('No se pudo eliminar el estudiante.')
    }

    await conexion.commit()

    return res.json({
      mensaje: 'Estudiante eliminado correctamente.',
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre
      },
      calificacionesEliminadas: resultados.affectedRows
    })

  } catch (error) {
    if (conexion) {
      await conexion.rollback().catch(() => {})
    }

    console.error('Error al eliminar estudiante:', error.message)

    return res.status(500).json({
      mensaje: 'No se pudo eliminar el estudiante.'
    })

  } finally {
    if (conexion) conexion.release()
  }
})

module.exports = router
