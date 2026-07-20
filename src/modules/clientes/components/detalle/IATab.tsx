import { useEffect, useState } from "react";
import type { Cliente } from "../../types";
import {obtenerConversacionesCliente,} from "../../services/iaConversaciones";

interface Props {
  cliente: Cliente;
}

type RespuestaIA = {
  canal: string;
  asunto: string;
  mensaje: string;
  estrategia: string;
  proxima_accion: string;
};
type ConversacionIA = {
  id: number;
  cliente_id: number;
  pregunta: string;
  respuesta: string;
  canal?: string;
  asunto?: string;
  estrategia?: string;
  proxima_accion?: string;
  usuario?: string;
  created_at?: string;
};

const accionesRapidas = [
  {
    titulo: "WhatsApp",
    consulta:
      "Escribime un WhatsApp breve y personalizado para presentarnos e iniciar una conversación comercial.",
  },
  {
    titulo: "Email",
    consulta:
      "Preparame un email comercial breve para presentarnos y despertar interés.",
  },
  {
    titulo: "Seguimiento",
    consulta:
      "Preparame un mensaje de seguimiento para retomar el contacto sin ser insistente.",
  },
  {
    titulo: "Objeciones",
    consulta:
      "Analizá qué objeciones comerciales podría tener este cliente y cómo responderlas.",
  },
  {
    titulo: "Cierre",
    consulta:
      "Sugerime una estrategia y un mensaje para avanzar hacia el cierre de la venta.",
  },
  {
    titulo: "Venta cruzada",
    consulta:
      "Sugerime oportunidades de venta cruzada para este cliente según la información disponible.",
  },
];

export default function IATab({ cliente }: Props) {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState<RespuestaIA | null>(null);
  const [loading, setLoading] = useState(false);
  const [ejecutandoAgente, setEjecutandoAgente] =
  useState(false);
  const [copiado, setCopiado] = useState(false);
  const [historial, setHistorial] = useState<ConversacionIA[]>([]);
const [cargandoHistorial, setCargandoHistorial] = useState(false);
const [errorHistorial, setErrorHistorial] = useState("");

useEffect(() => {
  cargarHistorial();
}, [cliente.id]);

async function cargarHistorial() {
  if (!cliente.id) {
    setHistorial([]);
    return;
  }

  const clienteId = Number(cliente.id);

  if (Number.isNaN(clienteId)) {
    console.error("El ID del cliente no es numérico:", cliente.id);
    setErrorHistorial("El cliente no tiene un ID válido.");
    return;
  }

  try {
    setCargandoHistorial(true);
    setErrorHistorial("");

    const conversaciones =
      await obtenerConversacionesCliente(clienteId);

    setHistorial(conversaciones);
  } catch (error) {
    console.error("Error cargando historial IA:", error);
    setErrorHistorial(
      "No se pudo cargar el historial de conversaciones."
    );
  } finally {
    setCargandoHistorial(false);
  }
}

  async function consultarIA(objetivoPersonalizado?: string) {
    const objetivo = (objetivoPersonalizado || consulta).trim();

    if (!objetivo) {
      alert("Escribí qué necesitás que prepare la IA.");
      return;
    }

    try {
      setLoading(true);
      setRespuesta(null);
      setCopiado(false);

      const response = await fetch(
        "http://localhost:3001/api/vendedor/generar-mensaje",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            canal: detectarCanal(objetivo),
            objetivo,
            cliente,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "No se pudo consultar al Agente Vendedor"
        );
      }

      setConsulta(objetivo);
      setRespuesta(data.resultado);
      await cargarHistorial();    
    } catch (error) {
      console.error("Error consultando IA:", error);
      alert("No se pudo obtener una respuesta de la IA.");
    } finally {
      setLoading(false);
    }
  }
  async function ejecutarAgenteVendedor() {
    if (!cliente.id) {
      alert(
        "El cliente no tiene un ID válido."
      );
  
      return;
    }
  
    try {
      setEjecutandoAgente(true);
      setRespuesta(null);
      setCopiado(false);
  
      const response = await fetch(
        "http://localhost:3001/api/vendedor/ejecutar",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            cliente,
            objetivo:
              "Analizá la situación comercial de este cliente, decidí la mejor próxima acción y prepará el contacto correspondiente.",
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "No se pudo ejecutar el Agente Vendedor"
        );
      }
  
      const resultadoAgente =
        data.agente?.resultado;
  
      if (resultadoAgente) {
        setRespuesta({
          canal:
            resultadoAgente.canal || "",
          asunto:
            resultadoAgente.asunto || "",
          mensaje:
            resultadoAgente.mensaje ||
            resultadoAgente.guion_llamada ||
            "",
          estrategia:
            resultadoAgente.estrategia ||
            "",
          proxima_accion:
            resultadoAgente.proxima_accion ||
            "",
        });
      }
  
      await cargarHistorial();
  
      if (data.tarea_creada) {
        alert(
          "El Agente Vendedor analizó al cliente y creó una tarea en la Bandeja IA."
        );
      } else {
        alert(
          data.mensaje ||
            "El Agente Vendedor decidió que todavía no corresponde crear una tarea."
        );
      }
    } catch (error) {
      console.error(
        "Error ejecutando Agente Vendedor:",
        error
      );
  
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar el Agente Vendedor."
      );
    } finally {
      setEjecutandoAgente(false);
    }
  }

  async function copiarMensaje() {
    if (!respuesta?.mensaje) return;

    try {
      await navigator.clipboard.writeText(respuesta.mensaje);
      setCopiado(true);

      window.setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error("Error copiando mensaje:", error);
      alert("No se pudo copiar el mensaje.");
    }
  }

  function abrirWhatsApp() {
    if (!respuesta?.mensaje) {
      alert("Primero generá un mensaje.");
      return;
    }

    const telefono = limpiarTelefono(cliente.telefono);

    if (!telefono) {
      alert("Este cliente no tiene un teléfono válido.");
      return;
    }

    const mensaje = encodeURIComponent(respuesta.mensaje);

    window.open(
      `https://wa.me/${telefono}?text=${mensaje}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function actualizarMensaje(mensaje: string) {
    setRespuesta((actual) =>
      actual
        ? {
            ...actual,
            mensaje,
          }
        : null
    );
  }

  return (
    <div className="space-y-5">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            🤖 SalesIA Copilot
          </h3>
  
          <p className="mt-1 text-sm text-slate-500">
            Prepará mensajes y estrategias comerciales para{" "}
            <span className="font-medium text-slate-700">
              {cliente.empresa || cliente.nombre}
            </span>
            .
          </p>
        </div>
  
        <button
          type="button"
          onClick={ejecutarAgenteVendedor}
          disabled={ejecutandoAgente || loading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ejecutandoAgente
            ? "Analizando cliente..."
            : "▶ Ejecutar Agente Vendedor"}
        </button>
      </div>
    </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">
          Acciones rápidas
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {accionesRapidas.map((accion) => (
            <button
              key={accion.titulo}
              type="button"
              onClick={() => consultarIA(accion.consulta)}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-sm font-semibold text-slate-800">
                {accion.titulo}
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Generar con IA
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          ¿Qué necesitás preparar?
        </label>

        <textarea
          value={consulta}
          onChange={(event) => setConsulta(event.target.value)}
          rows={4}
          placeholder="Ejemplo: Preparame un mensaje para ofrecer baldosas y coordinar una llamada."
          className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none transition focus:border-slate-500"
        />

        <button
          type="button"
          onClick={() => consultarIA()}
          disabled={loading}
          className="mt-3 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Pensando..." : "Consultar IA"}
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
          <p className="font-medium text-blue-900">
            El Agente Vendedor está preparando la respuesta...
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Analizando la información del cliente.
          </p>
        </div>
      )}

      {respuesta && (
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Canal
              </p>

              <p className="font-semibold text-slate-900">
                {respuesta.canal || "Sin definir"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copiarMensaje}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {copiado ? "Copiado ✓" : "Copiar"}
              </button>

              <button
                type="button"
                onClick={abrirWhatsApp}
                disabled={!cliente.telefono}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {respuesta.asunto && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Asunto
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {respuesta.asunto}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
  <div className="mb-4 flex items-center justify-between gap-3">
    <div>
      <h3 className="font-semibold text-slate-900">
        Historial de SalesIA
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Conversaciones anteriores guardadas para este cliente.
      </p>
    </div>

    <button
      type="button"
      onClick={cargarHistorial}
      disabled={cargandoHistorial}
      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      {cargandoHistorial ? "Cargando..." : "Actualizar"}
    </button>
  </div>

  {cargandoHistorial && historial.length === 0 && (
    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
      Cargando conversaciones...
    </div>
  )}

  {errorHistorial && (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {errorHistorial}
    </div>
  )}

  {!cargandoHistorial &&
    !errorHistorial &&
    historial.length === 0 && (
      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        Todavía no hay conversaciones guardadas para este cliente.
      </div>
    )}

  {historial.length > 0 && (
    <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
      {[...historial].reverse().map((conversacion) => (
        <article
          key={conversacion.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              {conversacion.canal || "Sin canal"}
            </span>

            <span className="text-xs text-slate-400">
              {formatearFecha(conversacion.created_at)}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Consulta
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {conversacion.pregunta}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Respuesta de SalesIA
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {conversacion.respuesta}
              </p>
            </div>

            {(conversacion.estrategia ||
              conversacion.proxima_accion) && (
              <div className="grid gap-3 md:grid-cols-2">
                {conversacion.estrategia && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Estrategia
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {conversacion.estrategia}
                    </p>
                  </div>
                )}

                {conversacion.proxima_accion && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Próxima acción
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {conversacion.proxima_accion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )}
</div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Mensaje generado
              </p>

              <span className="text-xs text-slate-400">
                Podés editarlo antes de copiar o enviar
              </span>
            </div>

            <textarea
              value={respuesta.mensaje}
              onChange={(event) => actualizarMensaje(event.target.value)}
              rows={8}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-slate-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Estrategia
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {respuesta.estrategia || "-"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Próxima acción
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {respuesta.proxima_accion || "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function detectarCanal(consulta: string) {
  const texto = consulta.toLowerCase();

  if (
    texto.includes("email") ||
    texto.includes("correo") ||
    texto.includes("mail")
  ) {
    return "Email";
  }

  return "WhatsApp";
}
function limpiarTelefono(telefono?: string) {
  if (!telefono) return "";

  let numero = telefono.replace(/\D/g, "");

  if (numero.startsWith("0")) {
    numero = numero.slice(1);
  }

  if (!numero.startsWith("54")) {
    numero = `54${numero}`;
  }

  return numero;
}

function formatearFecha(fecha?: string) {
  if (!fecha) return "-";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return "-";
  }

  return fechaValida.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}