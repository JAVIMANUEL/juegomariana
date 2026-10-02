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
const FORMAS = [
  { nombre: "Círculo", simbolo: "●", valor: "#fff8ed", tinta: "#2188e8", nota: 262 },
  { nombre: "Cuadrado", simbolo: "■", valor: "#fff8ed", tinta: "#ef4672", nota: 330 },
  { nombre: "Triángulo", simbolo: "▲", valor: "#fff8ed", tinta: "#269b52", nota: 392 },
  { nombre: "Estrella", simbolo: "★", valor: "#fff8ed", tinta: "#b87900", nota: 523 },
  { nombre: "Corazón", simbolo: "♥", valor: "#fff8ed", tinta: "#a442cb", nota: 440 },
];
const NUMEROS = Array.from({ length: 10 }, (_, i) => ({
  nombre: String(i + 1),
  simbolo: String(i + 1),
  valor: "#fff8ed",
  tinta: ["#2188e8", "#ef4672", "#269b52", "#a442cb", "#b87900"][i % 5],
  nota: 262 + i * 24,
}));
const NIVELES_FORMAS = [
  { patron: [0, 1], total: 6 },
  { patron: [3, 4], total: 8 },
  { patron: [2, 0], total: 8 },
  { patron: [0, 1, 2], total: 9 },
  { patron: [3, 4, 0], total: 9 },
  { patron: [1, 1, 2], total: 9 },
  { patron: [3, 4, 4], total: 9 },
  { patron: [0, 1, 2, 3], total: 12 },
  { patron: [2, 0, 2, 4], total: 12 },
  { patron: [3, 1, 4, 0], total: 12 },
];
function serieNumerica(valores, iniciales, regla) {
  const serie = valores.map(valor => valor - 1);
  return { patron: serie.slice(0, iniciales), serie, total: serie.length, regla };
}
const NIVELES_NUMEROS = [
  { patron: [0, 1], total: 6 },
  { patron: [0, 1, 2], total: 9 },
  { patron: [1, 3], total: 8 },
  serieNumerica([1, 2, 3, 4, 5, 6], 3, "Sumamos uno cada vez."),
  serieNumerica([1, 2, 3, 4, 5, 6, 7, 8], 3, "Sumamos uno cada vez."),
  serieNumerica([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, "Sumamos uno cada vez."),
  serieNumerica([2, 4, 6, 8, 10], 2, "Sumamos dos cada vez."),
  serieNumerica([1, 3, 5, 7, 9], 2, "Sumamos dos cada vez."),
  serieNumerica([6, 5, 4, 3, 2, 1], 3, "Restamos uno cada vez."),
  serieNumerica([10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 3, "Restamos uno cada vez."),
];
const MODOS = {
  colores: { nombre: "Colores", icono: "🌈", elementos: COLORES, niveles: NIVELES },
  formas: { nombre: "Formas", icono: "★", elementos: FORMAS, niveles: NIVELES_FORMAS },
  numeros: { nombre: "Números", icono: "123", elementos: NUMEROS, niveles: NIVELES_NUMEROS },
};
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
function LogoHappyKids() {
  const letras = [
    { letra: "H", x: 108, y: 43, color: "#ed3992" },
    { letra: "a", x: 134, y: 43, color: "#ef579c" },
    { letra: "p", x: 157, y: 43, color: "#ffbc35" },
    { letra: "p", x: 181, y: 43, color: "#80bd39" },
    { letra: "y", x: 205, y: 43, color: "#21abe0" },

    { letra: "K", x: 128, y: 78, color: "#a94bb7" },
    { letra: "i", x: 154, y: 78, color: "#ef3990" },
    { letra: "d", x: 167, y: 78, color: "#6fb73b" },
    { letra: "s", x: 192, y: 78, color: "#f7b62d" },
  ];

  return (
    <svg
      className="logo-happy-kids"
      viewBox="0 0 340 155"
      role="img"
      aria-label="Happy Kids: letrero de colores con dos niños"
    >
      {/* Pasto */}
      <ellipse
        cx="170"
        cy="143"
        rx="158"
        ry="10"
        fill="#9cc52c"
      />

      {/* Poste de madera */}
      <path
        d="M163 73 L180 73 L183 144 L161 144 Z"
        fill="#bc874c"
        stroke="#754b32"
        strokeWidth="2.5"
      />
      <path
        d="M170 85 Q175 105 169 125 M177 103 L176 137"
        fill="none"
        stroke="#946036"
        strokeWidth="1.5"
      />

      {/* Tabla superior */}
      <path
        d="M91 9 L244 12 L242 49 L90 46 Z"
        fill="#f4d69b"
        stroke="#754b32"
        strokeWidth="2.5"
      />

      {/* Tabla inferior */}
      <path
        d="M82 46 L253 43 L255 87 L83 89 Z"
        fill="#ebc486"
        stroke="#754b32"
        strokeWidth="2.5"
      />

      {/* Vetas de madera */}
      <g
        fill="none"
        stroke="#c19257"
        strokeWidth="1"
        opacity="0.65"
      >
        <path d="M99 17 Q143 20 182 16 L234 19" />
        <path d="M96 39 Q152 35 237 41" />
        <path d="M89 55 Q145 59 247 51" />
        <path d="M90 81 Q163 76 245 82" />
      </g>

      {/* Letras multicolores */}
      {letras.map((item, indice) => (
        <text
          key={indice}
          x={item.x}
          y={item.y}
          fill={item.color}
          stroke="#633954"
          strokeWidth="0.7"
          paintOrder="stroke"
          fontFamily="Trebuchet MS, Arial, sans-serif"
          fontSize="34"
          fontWeight="900"
          transform={`rotate(${indice % 2 === 0 ? -4 : 4} ${
            item.x
          } ${item.y})`}
        >
          {item.letra}
        </text>
      ))}

      {/* Niña: piernas y zapatos */}
      <g
        stroke="#59433f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M56 113 L50 137 M76 113 L82 137"
          fill="none"
          stroke="#eac498"
          strokeWidth="7"
        />
        <ellipse cx="46" cy="140" rx="13" ry="6" fill="#d53ca2" />
        <ellipse cx="86" cy="140" rx="13" ry="6" fill="#d53ca2" />

        {/* Brazos */}
        <path
          d="M49 84 L31 106 M81 82 L100 65"
          fill="none"
          stroke="#eac498"
          strokeWidth="7"
        />
        <circle cx="30" cy="107" r="5" fill="#ffe4b6" />
        <circle cx="102" cy="63" r="5" fill="#ffe4b6" />

        {/* Vestido */}
        <path
          d="M52 78 L76 78 L92 114 Q65 125 39 114 Z"
          fill="#ffe52d"
        />
        <path
          d="M42 113 Q66 121 88 113"
          fill="none"
          stroke="#ec3e98"
          strokeWidth="4"
        />

        {/* Cabello */}
        <path
          d="M42 48 Q32 31 51 28 Q70 14 87 33 L91 67 L40 66 Z"
          fill="#713e29"
        />

        {/* Rostro */}
        <ellipse cx="65" cy="55" rx="23" ry="26" fill="#ffe4b6" />
        <path d="M51 35 Q65 29 81 34" fill="none" stroke="#713e29" strokeWidth="5" />
        <circle cx="57" cy="51" r="2" fill="#59433f" stroke="none" />
        <circle cx="73" cy="51" r="2" fill="#59433f" stroke="none" />
        <path d="M55 61 Q65 72 76 60" fill="none" />
        <circle cx="49" cy="59" r="4" fill="#f2a0a2" stroke="none" />
        <circle cx="81" cy="59" r="4" fill="#f2a0a2" stroke="none" />

        {/* Moño */}
        <path
          d="M43 32 L32 22 L30 40 Z M43 32 L53 22 L54 40 Z"
          fill="#ef3990"
        />
        <circle cx="43" cy="32" r="4" fill="#ffce36" />
      </g>

      {/* Niño */}
      <g
        stroke="#59433f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Piernas y zapatos */}
        <path
          d="M267 113 L263 137 M287 113 L292 137"
          fill="none"
          stroke="#eac498"
          strokeWidth="7"
        />
        <ellipse cx="260" cy="140" rx="13" ry="6" fill="#329cd6" />
        <ellipse cx="296" cy="140" rx="13" ry="6" fill="#329cd6" />

        {/* Brazos */}
        <path
          d="M260 85 L241 66 M293 85 L310 105"
          fill="none"
          stroke="#eac498"
          strokeWidth="7"
        />
        <circle cx="240" cy="64" r="5" fill="#ffe4b6" />
        <circle cx="311" cy="107" r="5" fill="#ffe4b6" />

        {/* Pantalón y camiseta */}
        <path d="M259 100 L295 100 L291 118 L278 115 L265 118 Z" fill="#329cd6" />
        <path d="M262 77 L289 77 L298 103 L255 103 Z" fill="#ffbb32" />
        <path d="M271 79 Q278 87 285 79" fill="none" stroke="#329cd6" strokeWidth="5" />

        {/* Cara */}
        <ellipse cx="278" cy="54" rx="24" ry="26" fill="#ffe4b6" />
        <path d="M262 32 L267 23 M272 29 L275 19 M283 29 L286 20 M291 32 L299 25" fill="none" />
        <circle cx="270" cy="51" r="2" fill="#59433f" stroke="none" />
        <circle cx="286" cy="51" r="2" fill="#59433f" stroke="none" />
        <path d="M267 61 Q278 74 289 60" fill="none" />
        <circle cx="260" cy="59" r="4" fill="#f2a0a2" stroke="none" />
        <circle cx="295" cy="59" r="4" fill="#f2a0a2" stroke="none" />
      </g>
    </svg>
  );
}
export default function App() {
  const [modo, setModo] = useState("colores");
  const modoActual = useRef("colores");
  const [pantalla, setPantalla] = useState("inicio");
  const [nivel, setNivel] = useState(0);
  const [respuesta, setRespuesta] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [sonido, setSonido] = useState(true);
  const [celebrando, setCelebrando] = useState(false);
  const [pista, setPista] = useState(false);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState(
    "VALENTINA -- CALEB -- MARIANA"
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

  const datosModo = MODOS[modo];
  const elementos = datosModo.elementos;
  const niveles = datosModo.niveles;
  const configuracion = niveles[nivel];
  const escenario = ESCENARIOS[nivel % ESCENARIOS.length];
  const siguientes = respuesta.length;
  const completados = Math.max(
    0,
    respuesta.length - configuracion.patron.length
  );
  const porCompletar =
    configuracion.total - configuracion.patron.length;

  useEffect(() => {
    const controlSesion = sesion;
    return () => {
      controlSesion.current++;
      clearTimeout(temporizadorError.current);
      window.speechSynthesis?.cancel();
      audio.current?.close().catch(() => {});
      audio.current = null;
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

      oscilador.frequency.value = elementos[color].nota;
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
    const actual = MODOS[modoActual.current];
    const datos = actual.niveles[numero];

    clearTimeout(temporizadorError.current);
    setNivel(numero);
    setRespuesta([...datos.patron]);
    progresoActual.current = datos.patron.length;
    bloqueado.current = false;

    setCelebrando(false);
    setPista(false);
    setError(false);
    const instruccion = datos.regla || `Mira cómo se repiten ${actual.nombre.toLowerCase() === "formas" ? "las formas" : actual.nombre.toLowerCase() === "colores" ? "los colores" : "los números"}. ¿Cuál sigue?`;
    setMensaje(instruccion);
    hablar(instruccion);
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
    if (!Number.isInteger(color) || !elementos[color]) return;

    const posicion = progresoActual.current;
    const esperado =
      configuracion.serie ? configuracion.serie[posicion] : configuracion.patron[posicion % configuracion.patron.length];

    if (color !== esperado) {
      setError(true);
      setMensaje("¡Casi! Mira la secuencia y prueba otra opción.");
      hablar("Mira la secuencia y prueba otra opción");

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
    setMensaje("¡Muy bien! Sigue completando la secuencia.");

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

      if (nivel === niveles.length - 1) {
        setPantalla("final");
        setMensaje(`¡Completaste las secuencias de ${datosModo.nombre.toLowerCase()}!`);
        hablar("Lo lograste. Completaste todos los niveles");
      } else {
        cargarNivel(nivel + 1);
      }
    }, 2600);
  }

  function mostrarPista() {
    if (bloqueado.current) return;

    const siguiente = configuracion.serie
      ? configuracion.serie[progresoActual.current]
      : configuracion.patron[progresoActual.current % configuracion.patron.length];

    setPista(true);
    setMensaje(`Ahora sigue ${elementos[siguiente].nombre}.`);
    hablar(`Ahora sigue ${elementos[siguiente].nombre}`);
  }

  function volver() {
    sesion.current++;
    bloqueado.current = true;
    clearTimeout(temporizadorError.current);
    window.speechSynthesis?.cancel();
    confetti.reset();

    setPantalla("inicio");
    setMensaje("¡Elige colores, formas o números!");
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
    if (!/^\d+$/.test(dato)) return;

    colocarColor(Number(dato));
  }

  const colorPista = configuracion.serie
    ? configuracion.serie[siguientes]
    : configuracion.patron[siguientes % configuracion.patron.length];

  function elegirModo(valor) {
    modoActual.current = valor;
    setModo(valor);
    setNivel(0);
    setRespuesta([]);
    setMensaje(`¡Vamos a descubrir ${MODOS[valor].nombre.toLowerCase()}!`);
  }

  return (
    <div
  className={`aventura modo-${modo} ${
    pantalla === "inicio" ? "inicio-alegre" : ""
  }`}
>
      <header>
        {pantalla === "inicio" && (
  <div className="lluvia-alegre" aria-hidden="true">
    {Array.from({ length: 32 }, (_, i) => {
      const figuras = ["●", "★", "▲", "■", "1", "2", "3", "4"];
      const colores = [
        "#ff5688",
        "#21b7df",
        "#85ca45",
        "#ffc928",
        "#ab70e5",
        "#ff9247",
      ];

      return (
        <span
          key={i}
          className="figura-lluvia"
          style={{
            "--posicion": `${(i * 37) % 100}%`,
            "--duracion": `${14 + (i % 7) * 2}s`,
            "--retraso": `${-(i * 3)}s`,
            "--tamano": `${18 + (i % 4) * 7}px`,
            "--color": colores[i % colores.length],
            "--giro": `${i % 2 === 0 ? 180 : -180}deg`,
          }}
        >
          {figuras[i % figuras.length]}
        </span>
      );
    })}
  </div>
)}
        <LogoHappyKids />
        {pantalla === "inicio" && (

<div className="nube-kinder" aria-label="Kinder 2026">
  <div className="texto-kinder" aria-hidden="true">
    {"KINDER 2026".split("").map((letra, i) => (
      <span
        key={i}
        style={{
          color: [
            "#ed4896",
            "#259edb",
            "#65ad36",
            "#a65bd0",
            "#d28b00",
            "#f07839",
          ][i % 6],
          transform: `rotate(${i % 2 === 0 ? -5 : 5}deg)`,
        }}
      >
        {letra === " " ? "\u00A0" : letra}
      </span>
    ))}
  </div>
</div>

)}

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
            <small>GRUPO DE:</small>
            {mensaje}
          </div>
        </aside>

        <section className="contenido">
          {pantalla === "inicio" && (
            <div className="portada">
              <div className="etiqueta">DESCUBRE EL PATRÓN</div>

              <h1>
                BIENVENIDOS<br />
                AL MUNDO DE LAS<br />
                <span>SECUENCIAS</span>
              </h1>

              <p>
                Elige tu aventura y descubre qué sigue.
              </p>

              <div className="selector-modos" role="group" aria-label="Elige qué quieres aprender">
                {Object.entries(MODOS).map(([clave, opcion]) => (
                  <button
                    key={clave}
                    className={`tarjeta-modo ${modo === clave ? "elegido" : ""}`}
                    onClick={() => elegirModo(clave)}
                    aria-pressed={modo === clave}
                  >
                    <span aria-hidden="true">{opcion.icono}</span>
                    <strong>{opcion.nombre}</strong>
                    <small>10 niveles</small>
                  </button>
                ))}
              </div>
              <Motion.button
                className="principal"
                onClick={iniciar}
                whileTap={{ scale: 0.96 }}
              >
                <Play size={23} fill="currentColor" />
                ¡JUGAR {datosModo.nombre.toUpperCase()}!
              </Motion.button>
            </div>
          )}

          {pantalla === "juego" && (
            <>
              <div className="marcadores">
                <span>{datosModo.icono} {datosModo.nombre} · Nivel {nivel + 1} / {niveles.length}</span>
                <span><Star size={22} fill="#ffd447" /> {estrellas}</span>
              </div>

              <h2 aria-live="polite">
                {celebrando
                  ? "¡Patrón completado!"
                  : modo === "colores" ? escenario.pregunta : modo === "formas" ? "¿Qué forma sigue?" : "¿Qué número sigue?"}
              </h2>
              <div className="modelo">
                <span>{configuracion.serie ? configuracion.regla : "Este patrón se repite:"}</span>

                <div className="patron">
                  {configuracion.patron.map((color, indice) => (
                    <div
                      key={indice}
                      className="muestra"
                      style={{
  background: elementos[color].valor,
  color: elementos[color].tinta,
}}
                      aria-label={elementos[color].nombre}
                    >
                      {modo === "colores" ? indice + 1 : elementos[color].simbolo}
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
    <strong>{modo === "colores" ? escenario.nombre : `${escenario.nombre.replace(" de colores", "")} · ${datosModo.nombre}`}</strong>
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
                      elementos[respuesta[indice]].nombre
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
                    ? elementos[respuesta[indice]].valor
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
                fill={
  ocupado && modo !== "colores"
    ? elementos[respuesta[indice]].tinta
    : "#49286a"
}
                fontSize={activo ? "26" : modo === "formas" ? "28" : "19"}
                fontWeight="900"
                pointerEvents="none"
              >
                {activo
  ? "?"
  : ocupado && modo !== "colores"
    ? elementos[respuesta[indice]].simbolo
    : ""}
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
                    ? elementos[respuesta[indice]].valor
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
                        elementos[respuesta[indice]].nombre
                      }`
                    : `Posición ${indice + 1}: por completar`
                }
              >
                {ocupado ? (
                  <span
  className={modo === "colores" ? "numero" : "simbolo-ficha"}
  style={{ color: elementos[respuesta[indice]].tinta }}
>{modo === "colores" ? indice + 1 : elementos[respuesta[indice]].simbolo}</span>
                ) : activo ? (
                  "?"
                ) : (
                  <span className="vacio"></span>
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
  {modo === "colores" ? escenario.ayuda : "Completa la secuencia de izquierda a derecha; en la pizza sigue las posiciones."}
  <br />
  Toca una opción o arrástrala al espacio con “?”.
</p>

              <div className={`paleta ${modo === "numeros" ? "paleta-numeros" : ""}`}>
                {elementos.map((color, indice) => (
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
                    <span style={{ background: color.valor }}>{modo !== "colores" ? color.simbolo : ""}</span>
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
              <p>Completaste los 10 niveles de {datosModo.nombre.toLowerCase()} y ganaste {estrellas} estrellas.</p>

              <button className="principal" onClick={iniciar}>
                <RotateCcw size={23} />
                ¡JUGAR OTRA VEZ!
              </button>
              <div className="controles"><button className="secundario" onClick={volver}><Home size={20} />Elegir otra aventura</button></div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}