

require('dotenv').config()

const bcrypt = require('bcryptjs')
const readline = require('node:readline')
const db = require('./db')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function preguntar(texto) {
  return new Promise(resolve => {
    rl.question(texto, respuesta => resolve(respuesta.trim()))
  })
}

async function crearDocente() {
  try {
    console.log('\n=== REGISTRO DE DOCENTE ===\n')

    const nombre = await preguntar('Nombre completo: ')
    const correo = (
      await preguntar('Correo electrónico: ')
    ).toLowerCase()

    const password = await preguntar('Contraseña (mínimo 12 caracteres): ')

    if (
      !nombre ||
      nombre.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      correo.length > 150 ||
      password.length < 12 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      console.log('\nDatos no válidos. Revisa nombre, correo y contraseña.')
      return
    }

    const [existentes] = await db.execute(
      'SELECT id FROM docentes WHERE correo = ?',
      [correo]
    )

    if (existentes.length > 0) {
      console.log('\nYa existe un docente con ese correo.')
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [resultado] = await db.execute(
      `INSERT INTO docentes
       (nombre, correo, password_hash)
       VALUES (?, ?, ?)`,
      [nombre, correo, passwordHash]
    )

    console.log('\nDocente creado correctamente.')
    console.log('ID:', resultado.insertId)
    console.log('Nombre:', nombre)
    console.log('Correo:', correo)
  } catch (error) {
    console.error('\nError al crear docente:', error.message)
  } finally {
    rl.close()
    await db.end()
  }
}

crearDocente()
