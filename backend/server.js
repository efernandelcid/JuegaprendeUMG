
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

app.disable('x-powered-by');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '100kb' }));

// ==========================================
// RUTAS PRINCIPALES
// ==========================================

// Rutas existentes del proyecto
app.use('/api', require('./routes/index'));

// Registro, inicio de sesión y panel docente
app.use('/api/docentes', require('./routes/docentes'));

// ==========================================
// REGISTRAR ESTUDIANTES CON CÓDIGO DE CLASE
// ==========================================

app.post('/api/estudiantes', async (req, res) => {
  try {
    const {
      nombre,
      edad,
      nivel,
      codigoClase
    } = req.body || {};

    // 1. Validar los datos del estudiante
    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.trim().length > 100 ||
      !Number.isInteger(edad) ||
      edad < 3 ||
      edad > 15 ||
      !['Preprimaria', 'Primaria'].includes(nivel)
    ) {
      return res.status(400).json({
        mensaje: 'Datos del estudiante no válidos.'
      });
    }

    // 2. Exigir un código de clase
    if (
      typeof codigoClase !== 'string' ||
      !codigoClase.trim() ||
      codigoClase.trim().length > 20
    ) {
      return res.status(400).json({
        mensaje:
          'Debes ingresar un código de clase válido.'
      });
    }

    const codigo = codigoClase.trim().toUpperCase();

    // 3. Buscar el código en MySQL
    const [clases] = await db.execute(
      `SELECT
         id,
         nombre,
         nivel,
         codigo,
         docente_id
       FROM clases
       WHERE codigo = ?
       LIMIT 1`,
      [codigo]
    );

    // 4. Rechazar códigos inexistentes
    if (!clases.length) {
      return res.status(404).json({
        mensaje:
          'El código de clase no existe. Solicita el código correcto a tu docente.'
      });
    }

    const clase = clases[0];

    // 5. Comprobar el nivel educativo
    if (clase.nivel !== nivel) {
      return res.status(400).json({
        mensaje:
          `Esta clase pertenece al nivel ${clase.nivel}. Selecciona el nivel correcto.`
      });
    }

    // 6. Registrar al estudiante con su clase
    const [resultado] = await db.execute(
      `INSERT INTO estudiantes
       (
         nombre,
         edad,
         nivel,
         clase_id
       )
       VALUES (?, ?, ?, ?)`,
      [
        nombre.trim(),
        edad,
        nivel,
        clase.id
      ]
    );

    // 7. Confirmar inscripción
    return res.status(201).json({
      mensaje:
        'Estudiante registrado correctamente en su clase.',
      estudianteId: resultado.insertId,
      clase: {
        id: clase.id,
        nombre: clase.nombre,
        nivel: clase.nivel,
        codigo: clase.codigo
      }
    });

  } catch (error) {
    console.error(
      'Error al registrar estudiante:',
      error.message
    );

    return res.status(500).json({
      mensaje:
        'No se pudo registrar al estudiante.'
    });
  }
});

// ==========================================
// CONSULTAR ACTIVIDADES DISPONIBLES
// ==========================================

app.get('/api/actividades', async (req, res) => {
  try {
    const [actividades] = await db.query(
      `SELECT id, titulo, nivel, categoria
       FROM actividades
       ORDER BY id`
    );

    res.json(actividades);

  } catch (error) {
    console.error(
      'Error al consultar actividades:',
      error.message
    );

    res.status(500).json({
      mensaje:
        'No se pudieron consultar las actividades'
    });
  }
});

// ==========================================
// GUARDAR RESULTADOS DE LOS JUEGOS
// ==========================================

app.post('/api/resultados', async (req, res) => {
  try {
    const {
      estudianteId,
      actividadId,
      puntuacion,
      aciertos,
      totalPreguntas
    } = req.body || {};

    if (
      !Number.isInteger(estudianteId) ||
      estudianteId <= 0 ||
      !Number.isInteger(actividadId) ||
      actividadId <= 0 ||
      !Number.isInteger(puntuacion) ||
      puntuacion < 0 ||
      puntuacion > 100 ||
      !Number.isInteger(aciertos) ||
      aciertos < 0 ||
      !Number.isInteger(totalPreguntas) ||
      totalPreguntas <= 0 ||
      aciertos > totalPreguntas
    ) {
      return res.status(400).json({
        mensaje:
          'Los datos del resultado no son válidos'
      });
    }

    // Verificar que el estudiante exista
    const [estudiantes] = await db.execute(
      `SELECT nivel, clase_id
       FROM estudiantes
       WHERE id = ?`,
      [estudianteId]
    );

    // Verificar que la actividad exista
    const [actividades] = await db.execute(
      'SELECT nivel FROM actividades WHERE id = ?',
      [actividadId]
    );

    if (!estudiantes.length || !actividades.length) {
      return res.status(404).json({
        mensaje:
          'Estudiante o actividad no encontrada'
      });
    }

    // Exigir que el estudiante esté inscrito
    if (estudiantes[0].clase_id === null) {
      return res.status(403).json({
        mensaje:
          'El estudiante no está inscrito en una clase.'
      });
    }

    // Verificar que el nivel corresponda
    if (estudiantes[0].nivel !== actividades[0].nivel) {
      return res.status(400).json({
        mensaje:
          'La actividad no corresponde al nivel del estudiante'
      });
    }

    // Guardar la calificación en MySQL
    const [resultado] = await db.execute(
      `INSERT INTO resultados
       (
         estudiante_id,
         actividad_id,
         puntuacion,
         aciertos,
         total_preguntas
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        estudianteId,
        actividadId,
        puntuacion,
        aciertos,
        totalPreguntas
      ]
    );

    return res.status(201).json({
      mensaje:
        'Resultado guardado correctamente',
      resultadoId: resultado.insertId
    });

  } catch (error) {
    console.error(
      'Error al guardar resultado:',
      error.message
    );

    return res.status(500).json({
      mensaje:
        'No se pudo guardar el resultado'
    });
  }
});

// ==========================================
// FRONTEND REACT PARA AZURE
// ==========================================

const path = require('node:path');

const frontendPath = path.join(__dirname, 'public');

app.use(express.static(frontendPath));

// Mostrar React en rutas que no pertenecen a la API
app.get('/{*ruta}', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(
    `JuegaprendeUMG iniciado en puerto ${PORT}`
  );
});
