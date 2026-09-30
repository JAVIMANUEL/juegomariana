import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  Volume2,
  VolumeX,
  Home,
  Play,
  RotateCcw,
  Star,
} from "lucide-react";
import "./App.css";

const COLORES = [
  { nombre: "Amarillo", valor: "#ffd447", nota: 262 },
  { nombre: "Verde", valor: "#83c742", nota: 330 },
  { nombre: "Azul", valor: "#16bedf", nota: 392 },
  { nombre: "Rosa", valor: "#f74787", nota: 523 },
];

// Cada patrón se repite hasta completar el gusanito.
// Los primeros círculos ya están colocados como ejemplo.
const NIVELES = [
  { patron: [0, 1], total: 6 },
  { patron: [3, 2], total: 8 },
  { patron: [0, 1, 2], total: 9 },
  { patron: [3, 2, 0], total: 9 },
  { patron: [0, 0, 1], total: 9 },
  { patron: [2, 3, 3], total: 9 },
  { patron: [0, 1, 2, 3], total: 12 },
  { patron: [3, 3, 2, 0], total: 12 },
  { patron: [1, 0, 1, 2], total: 12 },
  { patron: [0, 2, 3, 1], total: 12 },
];
const ESCENARIOS = [
  {
    clase: "gusano",
    nombre: "Gusanito arcoíris",
    icono: "🐛",
    pregunta: "¿Qué color sigue en el gusanito?",
    ayuda: "Completa los círculos de su cuerpo.",
  },
  {
    clase: "tren",
    nombre: "Tren de colores",
    icono: "🚂",
    pregunta: "¿De qué color es el siguiente vagón?",
    ayuda: "Completa los vagones siguiendo el patrón.",
  },
  {
    clase: "pizza",
    nombre: "Pizza de colores",
    icono: "🍕",
    pregunta: "¿Qué color sigue en la pizza?",
    ayuda: "Completa las porciones en orden de sus números.",
  },
  {
    clase: "collar",
    nombre: "Collar mágico",
    icono: "📿",
    pregunta: "¿Qué cuenta sigue en el collar?",
    ayuda: "Completa las cuentas para crear un collar mágico.",
  },
  {
    clase: "camino",
    nombre: "Camino de Rumi",
    icono: "🏰",
    pregunta: "¿Qué color sigue en el camino?",
    ayuda: "Completa las piedras para llegar al castillo.",
  },
];

// Dibuja una porción de un círculo para el tablero de pizza.
function porcionPizza(indice, total) {
  const centro = 160;
  const radio = 140;
  const inicio = (indice / total) * Math.PI * 2 - Math.PI / 2;
  const fin = ((indice + 1) / total) * Math.PI * 2 - Math.PI / 2;

  const x1 = centro + radio * Math.cos(inicio);
  const y1 = centro + radio * Math.sin(inicio);
  const x2 = centro + radio * Math.cos(fin);
  const y2 = centro + radio * Math.sin(fin);

  return `M ${centro} ${centro}
    L ${x1} ${y1}
    A ${radio} ${radio} 0 0 1 ${x2} ${y2}
    Z`;
}
export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [nivel, setNivel] = useState(0);
  const [respuesta, setRespuesta] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [sonido, setSonido] = useState(true);
  const [celebrando, setCelebrando] = useState(false);
  const [pista, setPista] = useState(false);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState(
    "🎀 be Mariana 🎀"
  );

  const progresoActual = useRef(0);
  const bloqueado = useRef(true);
  const sonidoActual = useRef(true);
  const sesion = useRef(0);
  const audio = useRef(null);
  const temporizadorError = useRef(null);
  useEffect(() => {
  if (pantalla !== "juego" || !sonido) return;

  let contexto;

  try {
    audio.current ??= new (
      window.AudioContext || window.webkitAudioContext
    )();

    contexto = audio.current;
    contexto.resume();
  } catch {
    return;
  }

  const melodia = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    659.25, 783.99, 1046.50, 783.99,
    587.33, 659.25, 523.25, null,
  ];

  let paso = 0;
  const notasActivas = new Set();

  function reproducir() {
    if (contexto.state !== "running") return;

    const frecuencia = melodia[paso % melodia.length];
    paso++;

    if (!frecuencia) return;

    const oscilador = contexto.createOscillator();
    const volumen = contexto.createGain();
    const ahora = contexto.currentTime;

    // Volumen bajo para que la voz y los colores se escuchen.
    const intensidad = window.speechSynthesis?.speaking
      ? 0.006
      : 0.025;

    oscilador.type = "sine";
    oscilador.frequency.value = frecuencia;

    volumen.gain.setValueAtTime(0.001, ahora);
    volumen.gain.exponentialRampToValueAtTime(
      intensidad,
      ahora + 0.05
    );
    volumen.gain.exponentialRampToValueAtTime(
      0.001,
      ahora + 0.65
    );

    oscilador.connect(volumen);
    volumen.connect(contexto.destination);

    notasActivas.add(oscilador);

    oscilador.onended = () => {
      notasActivas.delete(oscilador);
      oscilador.disconnect();
      volumen.disconnect();
    };

    oscilador.start();
    oscilador.stop(ahora + 0.7);
  }

  const intervalo = setInterval(reproducir, 420);

  return () => {
    clearInterval(intervalo);

    notasActivas.forEach((oscilador) => {
      try {
        oscilador.stop();
      } catch {
        // La nota ya terminó.
      }
    });
  };
}, [pantalla, sonido]);

  const configuracion = NIVELES[nivel];
  const escenario = ESCENARIOS[nivel % ESCENARIOS.length];
  const siguientes = respuesta.length;
  const completados = Math.max(
    0,
    respuesta.length - configuracion.patron.length
  );
  const porCompletar =
    configuracion.total - configuracion.patron.length;

  useEffect(() => {
    return () => {
      sesion.current++;
      clearTimeout(temporizadorError.current);
      window.speechSynthesis?.cancel();
      audio.current?.close().catch(() => {});
      confetti.reset();
    };
  }, []);

  function hablar(texto) {
  if (!sonidoActual.current || !window.speechSynthesis) return;

  const sintetizador = window.speechSynthesis;
  sintetizador.cancel();

  const voz = new SpeechSynthesisUtterance(texto);

  const vocesEspanol = sintetizador
    .getVoices()
    .filter((opcion) => opcion.lang.startsWith("es"));

  const preferida =
    vocesEspanol.find((opcion) =>
      /sabina|helena|elvira|dalia|paulina|monica|mónica/i.test(
        opcion.name
      )
    ) || vocesEspanol[0];

  if (preferida) {
    voz.voice = preferida;
    voz.lang = preferida.lang;
  } else {
    voz.lang = "es-ES";
  }

  voz.rate = 0.9;
  voz.pitch = 1.15;
  voz.volume = 1;

  sintetizador.speak(voz);
}

  function nota(color) {
    if (!sonidoActual.current) return;

    try {
      audio.current ??= new (
        window.AudioContext || window.webkitAudioContext
      )();

      const contexto = audio.current;
      contexto.resume();

      const oscilador = contexto.createOscillator();
      const volumen = contexto.createGain();
      const ahora = contexto.currentTime;

      oscilador.frequency.value = COLORES[color].nota;
      oscilador.type = "sine";

      volumen.gain.setValueAtTime(0.001, ahora);
      volumen.gain.exponentialRampToValueAtTime(0.12, ahora + 0.03);
      volumen.gain.exponentialRampToValueAtTime(0.001, ahora + 0.4);

      oscilador.connect(volumen);
      volumen.connect(contexto.destination);

      oscilador.start();
      oscilador.stop(ahora + 0.4);
    } catch {
      // El juego sigue funcionando sin audio.
    }
  }

  function cargarNivel(numero) {
    const datos = NIVELES[numero];

    clearTimeout(temporizadorError.current);
    setNivel(numero);
    setRespuesta([...datos.patron]);
    progresoActual.current = datos.patron.length;
    bloqueado.current = false;

    setCelebrando(false);
    setPista(false);
    setError(false);
    setMensaje("Mira cómo se repiten los colores. ¿Cuál sigue?");
    hablar("Mira los colores. ¿Cuál sigue?");
  }

  function iniciar() {
    try {
  audio.current ??= new (
    window.AudioContext || window.webkitAudioContext
  )();

  audio.current.resume();
} catch {
  // Se puede jugar aunque el audio no esté disponible.
}
    sesion.current++;
    setEstrellas(0);
    setPantalla("juego");
    cargarNivel(0);
  }

  function colocarColor(color) {
    if (bloqueado.current) return;
    if (!Number.isInteger(color) || !COLORES[color]) return;

    const posicion = progresoActual.current;
    const esperado =
      configuracion.patron[posicion % configuracion.patron.length];

    if (color !== esperado) {
      setError(true);
      setMensaje("¡Casi! Mira el patrón y prueba otro color.");
      hablar("Mira el patrón y prueba otro color");

      clearTimeout(temporizadorError.current);
      temporizadorError.current = setTimeout(() => {
        setError(false);
      }, 700);

      return;
    }

    clearTimeout(temporizadorError.current);
    setError(false);
    setPista(false);
    nota(color);

    progresoActual.current++;
    setRespuesta((anterior) => [...anterior, color]);
    setMensaje("¡Muy bien! Sigue completando el gusanito.");

    if (progresoActual.current === configuracion.total) {
      completarNivel();
    }
  }

  function completarNivel() {
    bloqueado.current = true;
    setCelebrando(true);
    setEstrellas((anterior) => anterior + 1);
    setMensaje("¡Excelente! Completaste el patrón.");
    hablar("Excelente. Completaste el patrón");

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.65 },
      colors: COLORES.map((color) => color.valor),
      disableForReducedMotion: true,
    });

    const identificador = sesion.current;

    setTimeout(() => {
      if (identificador !== sesion.current) return;

      if (nivel === NIVELES.length - 1) {
        setPantalla("final");
        setMensaje("¡Eres la reina de las secuencias de colores!");
        hablar("Lo lograste. Completaste todos los niveles");
      } else {
        cargarNivel(nivel + 1);
      }
    }, 2600);
  }

  function mostrarPista() {
    if (bloqueado.current) return;

    const siguiente =
      configuracion.patron[
        progresoActual.current % configuracion.patron.length
      ];

    setPista(true);
    setMensaje(`Ahora sigue el color ${COLORES[siguiente].nombre}.`);
    hablar(`Ahora sigue el color ${COLORES[siguiente].nombre}`);
  }

  function volver() {
    sesion.current++;
    bloqueado.current = true;
    clearTimeout(temporizadorError.current);
    window.speechSynthesis?.cancel();
    confetti.reset();

    setPantalla("inicio");
    setMensaje("Vamos a descubrir los colores!");
  }

  function cambiarSonido() {
    sonidoActual.current = !sonidoActual.current;
    setSonido(sonidoActual.current);

    if (!sonidoActual.current) {
      window.speechSynthesis?.cancel();
    }
  }

  function recibirColor(evento, indice) {
    evento.preventDefault();

    if (indice !== progresoActual.current) return;

    const dato = evento.dataTransfer.getData("text/plain");
    if (!/^[0-3]$/.test(dato)) return;

    colocarColor(Number(dato));
  }

  const colorPista =
    configuracion.patron[
      siguientes % configuracion.patron.length
    ];

  return (
    <div className="aventura">
      <header>
        <strong>🌈KINDER HAPPY KIDS · 2026</strong>

        <button className="secundario" onClick={cambiarSonido}>
          {sonido ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {sonido ? "Sonido" : "Sin sonido"}
        </button>
      </header>

      <main>
        <aside className="personaje">
          <img
            src="/rumi.png"
            alt="Rumi con su polera HAPPY KIDS"
          />

          <div className="dialogo" aria-live="polite">
            <small>RUMI be Mariana</small>
            {mensaje}
          </div>
        </aside>

        <section className="contenido">
          {pantalla === "inicio" && (
            <div className="portada">
              <div className="etiqueta">DESCUBRE EL PATRÓN</div>

              <h1>
                Rummi y el<br />
                Reino de los<br />
                <span>Colores</span>
              </h1>

              <p>
                Ayuda al gusanito a completar sus colores.
                ¡Descubre cuál sigue!
              </p>

              <div className="ejemplo">
                <span style={{ background: COLORES[0].valor }} />
                <span style={{ background: COLORES[1].valor }} />
                <span style={{ background: COLORES[0].valor }} />
                <span style={{ background: COLORES[1].valor }} />
                <span className="interrogacion">?</span>
              </div>

              <Motion.button
                className="principal"
                onClick={iniciar}
                whileTap={{ scale: 0.96 }}
              >
                <Play size={23} fill="currentColor" />
                ¡COMENZAR!
              </Motion.button>
            </div>
          )}

          {pantalla === "juego" && (
            <>
              <div className="marcadores">
                <span>Nivel {nivel + 1} / {NIVELES.length}</span>
                <span><Star size={22} fill="#ffd447" /> {estrellas}</span>
              </div>

              <h2 aria-live="polite">
                {celebrando
                  ? "¡Patrón completado!"
                  : escenario.pregunta}
              </h2>
              <div className="modelo">
                <span>Estos colores se repiten:</span>

                <div className="patron">
                  {configuracion.patron.map((color, indice) => (
                    <div
                      key={indice}
                      className="muestra"
                      style={{ background: COLORES[color].valor }}
                      aria-label={COLORES[color].nombre}
                    >
                      {indice + 1}
                    </div>
                  ))}
                </div>
              </div>
<div
  className={`gusanito tablero-tematico tema-${escenario.clase} ${
    error ? "error" : ""
  }`}
>
  <div className="titulo-escenario">
    <span aria-hidden="true">{escenario.icono}</span>
    <strong>{escenario.nombre}</strong>
  </div>

  {escenario.clase === "pizza" ? (
    <svg
      className="pizza-tablero"
      viewBox="0 0 320 320"
      role="group"
      aria-label="Pizza: completa las porciones por número"
    >
      <circle
        cx="160"
        cy="160"
        r="149"
        fill="#e7ad58"
        stroke="#bc7833"
        strokeWidth="5"
      />

      {Array.from(
        { length: configuracion.total },
        (_, indice) => {
          const ocupado = indice < respuesta.length;
          const activo =
            indice === respuesta.length && !celebrando;

          const angulo =
            ((indice + 0.5) / configuracion.total) *
              Math.PI *
              2 -
            Math.PI / 2;

          const x = 160 + 97 * Math.cos(angulo);
          const y = 160 + 97 * Math.sin(angulo);

          return (
            <g
              key={`${nivel}-${indice}`}
              aria-label={
                ocupado
                  ? `Porción ${indice + 1}: ${
                      COLORES[respuesta[indice]].nombre
                    }`
                  : `Porción ${indice + 1}: por completar`
              }
              onDragOver={(evento) => {
                if (activo) evento.preventDefault();
              }}
              onDrop={(evento) =>
                recibirColor(evento, indice)
              }
            >
              <path
                d={porcionPizza(indice, configuracion.total)}
                fill={
                  ocupado
                    ? COLORES[respuesta[indice]].valor
                    : activo
                      ? "#e9d4ff"
                      : "#fff4d8"
                }
                stroke={activo ? "#8e4dcc" : "#b67d44"}
                strokeWidth={activo ? 4 : 2}
                strokeDasharray={activo ? "6 4" : undefined}
              />

              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#49286a"
                fontSize={activo ? "26" : "19"}
                fontWeight="900"
                pointerEvents="none"
              >
                {activo ? "?" : indice + 1}
              </text>
            </g>
          );
        }
      )}
    </svg>
  ) : (
    <>
      <div className="segmentos">
        {Array.from(
          { length: configuracion.total },
          (_, indice) => {
            const ocupado = indice < respuesta.length;
            const activo =
              indice === respuesta.length && !celebrando;

            return (
              <Motion.div
                key={`${nivel}-${indice}`}
                className={`segmento ${activo ? "activo" : ""}`}
                style={{
                  background: ocupado
                    ? COLORES[respuesta[indice]].valor
                    : undefined,
                }}
                animate={{ scale: ocupado ? [0.9, 1] : 1 }}
                onDragOver={(evento) => {
                  if (activo) evento.preventDefault();
                }}
                onDrop={(evento) =>
                  recibirColor(evento, indice)
                }
                aria-label={
                  ocupado
                    ? `Posición ${indice + 1}: ${
                        COLORES[respuesta[indice]].nombre
                      }`
                    : `Posición ${indice + 1}: por completar`
                }
              >
                {ocupado ? (
                  <span className="numero">{indice + 1}</span>
                ) : activo ? (
                  "?"
                ) : (
                  <span className="vacio">{indice + 1}</span>
                )}
              </Motion.div>
            );
          }
        )}
      </div>

      {escenario.clase === "camino" && (
        <div className="meta-castillo">
          <span>¡Lleguemos al castillo!</span>
          <span aria-hidden="true">🏰</span>
        </div>
      )}
    </>
  )}
</div>

<p className="ayuda">
  {escenario.ayuda}
  <br />
  Toca un color o arrástralo al espacio con “?”.
</p>

              <div className="paleta">
                {COLORES.map((color, indice) => (
                  <Motion.button
                    key={color.nombre}
                    className={`opcion ${
                      pista && indice === colorPista ? "pista" : ""
                    }`}
                    disabled={celebrando}
                    draggable={!celebrando}
                    onDragStart={(evento) => {
                      evento.dataTransfer.setData(
                        "text/plain",
                        String(indice)
                      );
                      evento.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => colocarColor(indice)}
                    whileTap={{ scale: 0.92 }}
                    aria-label={`Colocar ${color.nombre}`}
                  >
                    <span style={{ background: color.valor }} />
                    {color.nombre}
                  </Motion.button>
                ))}
              </div>

              <div className="avance">
                <div
                  style={{
                    width: `${(completados / porCompletar) * 100}%`,
                  }}
                />
              </div>

              <div className="controles">
                <button
                  className="secundario"
                  onClick={mostrarPista}
                  disabled={celebrando}
                >
                  ✨ Dame una pista
                </button>

                <button className="secundario" onClick={volver}>
                  <Home size={20} />
                  Inicio
                </button>
              </div>
            </>
          )}

          {pantalla === "final" && (
            <div className="final">
              <div className="etiqueta">¡AVENTURA COMPLETADA!</div>
              <h1>¡Lo lograste,<br /><span>ERES GENIAL!</span></h1>
              <div className="trofeo">🏆</div>
              <p>Completaste los 10 patrones y ganaste {estrellas} estrellas.</p>

              <button className="principal" onClick={iniciar}>
                <RotateCcw size={23} />
                ¡JUGAR OTRA VEZ!
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}