import { useState } from "react";

type Resumen = {
  clientes_analizados: number;
  oportunidades_altas: number;
  oportunidades_medias: number;
  oportunidades_bajas: number;
};

type Oportunidad = {
  cliente_id: number;
  cliente: string;
  prioridad: "Alta" | "Media" | "Baja";
  score: number;
  motivo: string;
  accion_recomendada: string;
  canal_recomendado: string;
};

type RespuestaAgente = {
  ok: boolean;
  agente: string;
  proveedor: string;
  modelo: string;
  resumen: Resumen;
  oportunidades: Oportunidad[];
  error?: string;
};

export default function AgenteComercialPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analizarCartera() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:3001/api/comercial/analizar-cartera",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: RespuestaAgente = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "No se pudo analizar la cartera"
        );
      }

      setResumen(data.resumen);
      setOportunidades(data.oportunidades || []);
    } catch (error) {
      console.error("Error analizando cartera:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar el Agente Comercial"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Agente Comercial
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analiza la cartera, detecta oportunidades y recomienda
            acciones comerciales.
          </p>
        </div>

        <button
          type="button"
          onClick={analizarCartera}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analizando..." : "Analizar cartera"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-medium text-blue-900">
            El Agente Comercial está analizando la cartera...
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Revisando clientes, score, memoria IA y próximas acciones.
          </p>
        </div>
      )}

      {resumen && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumenCard
            titulo="Clientes analizados"
            valor={resumen.clientes_analizados}
          />

          <ResumenCard
            titulo="Prioridad alta"
            valor={resumen.oportunidades_altas}
          />

          <ResumenCard
            titulo="Prioridad media"
            valor={resumen.oportunidades_medias}
          />

          <ResumenCard
            titulo="Prioridad baja"
            valor={resumen.oportunidades_bajas}
          />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Oportunidades detectadas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ordenadas según prioridad comercial.
          </p>
        </div>

        {!loading && oportunidades.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            Presioná “Analizar cartera” para obtener recomendaciones.
          </div>
        )}

        {oportunidades.length > 0 && (
          <div className="divide-y divide-slate-200">
            {oportunidades.map((oportunidad) => (
              <OportunidadCard
                key={oportunidad.cliente_id}
                oportunidad={oportunidad}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumenCard({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{titulo}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {valor}
      </p>
    </div>
  );
}

function OportunidadCard({
  oportunidad,
}: {
  oportunidad: Oportunidad;
}) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              {oportunidad.cliente}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${obtenerClasePrioridad(
                oportunidad.prioridad
              )}`}
            >
              {oportunidad.prioridad}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Score:{" "}
            <span className="font-semibold text-slate-700">
              {oportunidad.score}
            </span>
          </p>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
          {oportunidad.canal_recomendado}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Motivo
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {oportunidad.motivo}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Acción recomendada
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {oportunidad.accion_recomendada}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700"
        >
          Abrir cliente
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Generar mensaje
        </button>

        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Crear seguimiento
        </button>
      </div>
    </div>
  );
}

function obtenerClasePrioridad(prioridad: Oportunidad["prioridad"]) {
  if (prioridad === "Alta") {
    return "bg-red-100 text-red-700";
  }

  if (prioridad === "Media") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}