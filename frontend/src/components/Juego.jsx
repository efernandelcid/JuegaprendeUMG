
import { useState } from 'react'

const banco = {
  'Laboratorio de colores': [
    { pregunta: '¿Qué color se forma al mezclar azul y amarillo?', respuesta: 'Verde', falsas: ['Rojo', 'Morado'] },
    { pregunta: '¿Qué color se forma al mezclar rojo y amarillo?', respuesta: 'Naranja', falsas: ['Azul', 'Verde'] },
    { pregunta: '¿Qué color se forma al mezclar rojo y azul?', respuesta: 'Morado', falsas: ['Amarillo', 'Verde'] },
    { pregunta: '¿Cuál es un color primario?', respuesta: 'Rojo', falsas: ['Verde', 'Naranja'] },
    { pregunta: '¿De qué color suele ser una hoja sana?', respuesta: 'Verde', falsas: ['Morado', 'Rosado'] },
    { pregunta: '¿Qué color se forma al mezclar blanco y rojo?', respuesta: 'Rosado', falsas: ['Verde', 'Azul'] },
    { pregunta: '¿Cuál es el color típico del cielo despejado?', respuesta: 'Azul', falsas: ['Negro', 'Rojo'] }
  ],
  'Detectives de patrones': [
    { pregunta: '¿Qué sigue? 2, 4, 6, ...', respuesta: '8', falsas: ['7', '9'] },
    { pregunta: '¿Qué sigue? ⭐ 🌙 ⭐ 🌙 ...', respuesta: '⭐', falsas: ['🌙', '☀️'] },
    { pregunta: '¿Qué sigue? 1, 2, 3, ...', respuesta: '4', falsas: ['5', '6'] },
    { pregunta: '¿Qué sigue? 🔴 🔵 🔴 🔵 ...', respuesta: '🔴', falsas: ['🔵', '🟢'] },
    { pregunta: '¿Qué sigue? 5, 10, 15, ...', respuesta: '20', falsas: ['16', '25'] },
    { pregunta: '¿Qué sigue? 🟩 🟨 🟩 🟨 ...', respuesta: '🟩', falsas: ['🟨', '🟥'] },
    { pregunta: '¿Qué sigue? 3, 6, 9, ...', respuesta: '12', falsas: ['10', '15'] }
  ],
  'El gran clasificador': [
    { pregunta: '¿Cuál es un animal?', respuesta: 'Perro', falsas: ['Mesa', 'Zapato'] },
    { pregunta: '¿Cuál es una fruta?', respuesta: 'Manzana', falsas: ['Silla', 'Pelota'] },
    { pregunta: '¿Cuál es un transporte?', respuesta: 'Autobús', falsas: ['Flor', 'Árbol'] },
    { pregunta: '¿Qué objeto sirve para escribir?', respuesta: 'Lápiz', falsas: ['Plato', 'Cuchara'] },
    { pregunta: '¿Qué animal puede volar?', respuesta: 'Mariposa', falsas: ['Gato', 'Perro'] },
    { pregunta: '¿Cuál es una verdura?', respuesta: 'Zanahoria', falsas: ['Cuaderno', 'Zapato'] },
    { pregunta: '¿Cuál es un instrumento musical?', respuesta: 'Guitarra', falsas: ['Mesa', 'Ventana'] }
  ],
  'El enigma secreto': [
    { pregunta: 'Si todos los gatos son animales, ¿un gato es un animal?', respuesta: 'Sí', falsas: ['No', 'Nunca'] },
    { pregunta: '¿Qué número no pertenece? 2, 4, 7, 8', respuesta: '7', falsas: ['2', '8'] },
    { pregunta: '¿Qué pesa más: un kilogramo de algodón o uno de hierro?', respuesta: 'Pesan igual', falsas: ['Hierro', 'Algodón'] },
    { pregunta: 'Si hoy es lunes, ¿qué día será mañana?', respuesta: 'Martes', falsas: ['Domingo', 'Viernes'] },
    { pregunta: '¿Cuántos meses tienen al menos 28 días?', respuesta: '12', falsas: ['1', '6'] },
    { pregunta: '¿Qué número sigue? 1, 1, 2, 3, 5, ...', respuesta: '8', falsas: ['6', '10'] },
    { pregunta: 'Si tienes 3 pares de zapatos, ¿cuántos zapatos tienes?', respuesta: '6', falsas: ['3', '9'] },
    { pregunta: '¿Qué figura tiene exactamente tres lados?', respuesta: 'Triángulo', falsas: ['Cuadrado', 'Círculo'] },
    { pregunta: '¿Cuál es el doble de la mitad de 20?', respuesta: '20', falsas: ['10', '40'] },
    { pregunta: 'Si una carrera tiene 5 corredores y adelantas al segundo, ¿en qué posición quedas?', respuesta: 'Segundo', falsas: ['Primero', 'Tercero'] },
    { pregunta: '¿Qué número sigue? 3, 6, 12, 24, ...', respuesta: '48', falsas: ['30', '36'] },
    { pregunta: '¿Cuál es el número menor?', respuesta: '-5', falsas: ['0', '3'] },
    { pregunta: '¿Cuántos lados tienen dos cuadrados en total?', respuesta: '8', falsas: ['6', '10'] },
    { pregunta: 'Si ayer fue viernes, ¿qué día es hoy?', respuesta: 'Sábado', falsas: ['Jueves', 'Domingo'] },
    { pregunta: '¿Qué número es par?', respuesta: '18', falsas: ['13', '21'] }
  ]
}

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function mezclar(elementos) {
  const copia = [...elementos]

  for (let i = copia.length - 1; i > 0; i--) {
    const j = aleatorio(0, i)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }

  return copia
}

function crearPregunta(pregunta, respuesta, falsas) {
  const opciones = mezclar([
    String(respuesta),
    ...falsas.map(String)
  ])

  return {
    pregunta,
    opciones,
    correcta: opciones.indexOf(String(respuesta))
  }
}

function generarSuma() {
  const a = aleatorio(10, 500)
  const b = aleatorio(10, 500)
  const respuesta = a + b
  const falsas = new Set()

  while (falsas.size < 2) {
    const diferencia = aleatorio(1, 30)
    const signo = Math.random() < 0.5 ? -1 : 1
    const candidata = respuesta + signo * diferencia

    if (candidata >= 0 && candidata !== respuesta) {
      falsas.add(candidata)
    }
  }

  return crearPregunta(
    `¿Cuánto es ${a} + ${b}?`,
    respuesta,
    [...falsas]
  )
}

function generarDivision() {
  const divisor = aleatorio(2, 12)
  const respuesta = aleatorio(2, 20)
  const dividendo = divisor * respuesta
  const falsas = new Set()

  while (falsas.size < 2) {
    const diferencia = aleatorio(1, 5)
    const signo = Math.random() < 0.5 ? -1 : 1
    const candidata = respuesta + signo * diferencia

    if (candidata > 0 && candidata !== respuesta) {
      falsas.add(candidata)
    }
  }

  return crearPregunta(
    `¿Cuánto es ${dividendo} ÷ ${divisor}?`,
    respuesta,
    [...falsas]
  )
}

function generarPreguntas(actividad) {
  if (actividad === 'La ruta de las sumas') {
    const preguntas = []
    const usadas = new Set()

    while (preguntas.length < 5) {
      const pregunta = generarSuma()

      if (!usadas.has(pregunta.pregunta)) {
        usadas.add(pregunta.pregunta)
        preguntas.push(pregunta)
      }
    }

    return preguntas
  }

  if (actividad === 'El desafío de dividir') {
    const preguntas = []
    const usadas = new Set()

    while (preguntas.length < 5) {
      const pregunta = generarDivision()

      if (!usadas.has(pregunta.pregunta)) {
        usadas.add(pregunta.pregunta)
        preguntas.push(pregunta)
      }
    }

    return preguntas
  }

  const disponibles = banco[actividad] || []

  return mezclar(disponibles)
    .slice(0, 5)
    .map(item =>
      crearPregunta(
        item.pregunta,
        item.respuesta,
        item.falsas
      )
    )
}

export default function Juego({
  actividad,
  onVolver,
  onFinalizar
}) {
  // Acepta el objeto de actividad enviado por App.jsx
  const titulo = typeof actividad === 'string'
    ? actividad
    : actividad?.titulo || ''

  const [preguntas] = useState(() =>
    generarPreguntas(titulo)
  )

  const [indice, setIndice] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [aciertos, setAciertos] = useState(0)
  const [terminado, setTerminado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [estadoGuardado, setEstadoGuardado] = useState('')

  const pregunta = preguntas[indice]
  const total = preguntas.length

  function responder(opcion) {
    if (seleccion !== null || terminado) return
    setSeleccion(opcion)
  }

  async function siguiente() {
    if (
      seleccion === null ||
      terminado ||
      guardando
    ) return

    const nuevosAciertos =
      aciertos + (
        seleccion === pregunta.correcta ? 1 : 0
      )

    setAciertos(nuevosAciertos)

    if (indice + 1 >= total) {
      setTerminado(true)

      const resultado = {
        actividad: titulo,
        aciertos: nuevosAciertos,
        totalPreguntas: total,
        puntuacion: Math.round(
          (nuevosAciertos / total) * 100
        )
      }

      if (onFinalizar) {
        setGuardando(true)
        setEstadoGuardado('Guardando resultado...')

        try {
          await onFinalizar(resultado)
          setEstadoGuardado('Proceso de guardado finalizado.')
        } catch  {
          setEstadoGuardado(
            'No se pudo completar el guardado.'
          )
        } finally {
          setGuardando(false)
        }
      }
    } else {
      setIndice(actual => actual + 1)
      setSeleccion(null)
    }
  }

  if (total === 0) {
    return (
      <main className="juego">
        <div className="juego-panel">
          <h2>Actividad no disponible</h2>

          <button
            className="boton-principal"
            onClick={onVolver}
          >
            Volver a misiones
          </button>
        </div>
      </main>
    )
  }

  if (terminado) {
    const nota = Math.round(
      (aciertos / total) * 100
    )

    return (
      <main className="juego">
        <div className="juego-panel resultado-juego">
          <span className="juego-etiqueta">
            MISIÓN COMPLETADA
          </span>

          <div className="trofeo">🏆</div>

          <h1>¡Misión terminada!</h1>

          <p>{titulo}</p>

          <strong className="nota">
            {nota} / 100
          </strong>

          <p>
            Respuestas correctas: {aciertos} de {total}
          </p>

          {estadoGuardado && (
            <p role="status">
              {estadoGuardado}
            </p>
          )}

          <button
            className="boton-principal"
            onClick={onVolver}
            disabled={guardando}
          >
            Volver a misiones ↗
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="juego">
      <button
        className="boton-volver"
        onClick={onVolver}
      >
        ← Salir de la misión
      </button>

      <div className="juego-panel">
        <span className="juego-etiqueta">
          {titulo.toUpperCase()}
        </span>

        <div className="juego-progreso">
          <span>
            PREGUNTA {indice + 1} DE {total}
          </span>

          <span>
            {Math.round(
              (indice / total) * 100
            )}% completado
          </span>
        </div>

        <div className="barra-progreso">
          <div
            style={{
              width: `${
                (indice / total) * 100
              }%`
            }}
          />
        </div>

        <h2>{pregunta.pregunta}</h2>

        <div className="opciones-juego">
          {pregunta.opciones.map((opcion, i) => (
            <button
              key={i}
              className={
                seleccion === null
                  ? ''
                  : i === pregunta.correcta
                    ? 'correcta'
                    : i === seleccion
                      ? 'incorrecta'
                      : ''
              }
              onClick={() => responder(i)}
              disabled={seleccion !== null}
            >
              <span>
                {String.fromCharCode(65 + i)}
              </span>

              {opcion}
            </button>
          ))}
        </div>

        {seleccion !== null && (
          <div className="retroalimentacion">
            {seleccion === pregunta.correcta
              ? '✓ ¡Excelente! Respuesta correcta.'
              : `✕ La respuesta correcta es: ${
                  pregunta.opciones[pregunta.correcta]
                }`}
          </div>
        )}

        <button
          className="boton-principal"
          disabled={seleccion === null}
          onClick={siguiente}
        >
          {indice === total - 1
            ? 'Finalizar misión'
            : 'Siguiente pregunta'} ↗
        </button>
      </div>
    </main>
  )
}
