import { useNavigate } from "react-router-dom";

type EstadoAgente = "Activo" | "En desarrollo";

type Agente = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  estado: EstadoAgente;
  ruta?: string;
  detalle: string;
};

const agentes: Agente[] = [
  {
    id: "comercial",
    nombre: "Agente Comercial",
    descripcion:
      "Analiza la cartera, detecta oportunidades y recomienda próximas acciones.",
    icono: "📈",
    estado: "Activo",
    ruta: "/agentes/comercial",
    detalle: "Prioriza clientes según score, memoria IA e interés comercial.",
  },
  {
    id: "prospectador",
    nombre: "Agente Prospectador",
    descripcion:
      "Busca nuevas empresas y posibles clientes mediante Google Places e IA.",
    icono: "🔎",
    estado: "Activo",
    ruta: "/prospeccion",
    detalle: "Encuentra prospectos por rubro y ciudad.",
  },
  {
    id: "vendedor",
    nombre: "Agente Vendedor",
    descripcion:
      "Genera mensajes personalizados y estrategias de contacto.",
    icono: "💬",
    estado: "Activo",
    detalle: "Actualmente integrado en la ficha de cada cliente.",
  },
  {
    id: "marketing",
    nombre: "Agente de Marketing",
    descripcion:
      "Diseñará campañas, contenidos y acciones para captar demanda.",
    icono: "📣",
    estado: "En desarrollo",
    detalle: "Próximamente.",
  },
  {
    id: "finanzas",
    nombre: "Agente de Finanzas",
    descripcion:
      "Analizará ingresos, gastos, cobranzas y proyecciones financieras.",
    icono: "💰",
    estado: "En desarrollo",
    detalle: "Próximamente.",
  },
  {
    id: "produccion",
    nombre: "Agente de Producción",
    descripcion:
      "Ayudará a organizar tareas, materiales y capacidad productiva.",
    icono: "🏭",
    estado: "En desarrollo",
    detalle: "Próximamente.",
  },
];

export default function AgentesPage() {
  const navigate = useNavigate();

  const activos = agentes.filter(
    (agente) => agente.estado === "Activo"
  ).length;

  const enDesarrollo = agentes.filter(
    (agente) => agente.estado === "En desarrollo"
  ).length;

  function abrirAgente(agente: Agente) {
    if (!agente.ruta) {
      return;
    }

    navigate(agente.ruta);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Centro de Agentes IA
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Administrá los agentes inteligentes que trabajan dentro de
          SalesIA.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ResumenCard
          titulo="Agentes disponibles"
          valor={agentes.length}
        />

        <ResumenCard
          titulo="Agentes activos"
          valor={activos}
        />

        <ResumenCard
          titulo="En desarrollo"
          valor={enDesarrollo}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {agentes.map((agente) => (
          <article
            key={agente.id}
            className="flex min-h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                {agente.icono}
              </div>

              <EstadoBadge estado={agente.estado} />
            </div>

            <div className="mt-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {agente.nombre}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {agente.descripcion}
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs leading-5 text-slate-500">
                {agente.detalle}
              </p>
            </div>

            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={() => abrirAgente(agente)}
                disabled={!agente.ruta}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {agente.ruta ? "Abrir agente" : "Próximamente"}
              </button>
            </div>
          </article>
        ))}
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

function EstadoBadge({
  estado,
}: {
  estado: EstadoAgente;
}) {
  const activo = estado === "Activo";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        activo
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {activo ? "● Activo" : "● En desarrollo"}
    </span>
  );
}