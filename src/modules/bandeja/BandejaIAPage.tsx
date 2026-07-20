import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabase";


type Prioridad =
  | "Alta"
  | "Media"
  | "Baja"
  | string;

type EstadoTarea =
  | "Pendiente"
  | "Realizada"
  | "Pospuesta"
  | string;

type ClientePayload = {
  id?: number | string;
  nombre?: string | null;
  empresa?: string | null;
};

type PayloadTarea = {
  cliente?:
    | string
    | ClientePayload
    | null;

  telefono?: string | null;
  email?: string | null;
  score?: number | null;
  motivo?: string | null;
  accion_recomendada?: string | null;
  canal_recomendado?: string | null;
  mensaje_whatsapp?: string | null;
  asunto_email?: string | null;
  cuerpo_email?: string | null;
  guion_llamada?: string | null;
  mensaje?: string | null;
};

type TareaIA = {
  id: number;
  cliente_id?: number | null;
  agente?: string | null;
  tipo?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  prioridad?: Prioridad | null;
  estado?: EstadoTarea | null;
  accion?: string | null;
  ruta?: string | null;
  payload?: PayloadTarea | null;
  created_at?: string | null;
  fecha_programada?: string | null;
};

type FiltroEstado =
  | "Todas"
  | "Pendiente"
  | "Realizada"
  | "Pospuesta";

export default function BandejaIAPage() {
  const [tareas, setTareas] =
    useState<TareaIA[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<FiltroEstado>(
      "Pendiente"
    );

  const [
    filtroAgente,
    setFiltroAgente,
  ] =
    useState("Todos");

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState("Todos");

  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: errorSupabase,
      } = await supabase
        .from("ia_tareas")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      console.log(
        "TAREAS IA:",
        data
      );

      console.log(
        "ERROR:",
        errorSupabase
      );

      if (errorSupabase) {
        throw errorSupabase;
      }

      setTareas(
        (data as TareaIA[]) || []
      );
    } catch (error) {
      console.error(
        "Error cargando Bandeja IA:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las tareas IA"
      );
    } finally {
      setLoading(false);
    }
  }
  async function marcarTareaRealizada(
    tareaId: number
  ) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tareas/${tareaId}/completar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
  
      const resultado =
        await response.json();
  
      if (!response.ok) {
        throw new Error(
          resultado.error ||
            "No se pudo completar la tarea"
        );
      }
  
      await cargarTareas();
    } catch (error) {
      console.error(
        "Error completando tarea:",
        error
      );
  
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo completar la tarea"
      );
    }
  }
  
  async function posponerTarea(
    tareaId: number
  ) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/tareas/${tareaId}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            estado: "Pospuesta",
          }),
        }
      );
  
      const resultado =
        await response.json();
  
      if (!response.ok) {
        throw new Error(
          resultado.error ||
            "No se pudo posponer la tarea"
        );
      }
  
      await cargarTareas();
    } catch (error) {
      console.error(
        "Error posponiendo tarea:",
        error
      );
  
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo posponer la tarea"
      );
    }
  }
  const tareasFiltradas =
    useMemo(() => {
      return tareas.filter(
        (tarea) => {
          const coincideEstado =
            filtroEstado ===
              "Todas" ||
            normalizarEstado(
              tarea.estado
            ) === filtroEstado;

          const coincideAgente =
            filtroAgente ===
              "Todos" ||
            tarea.agente ===
              filtroAgente;

          const coincideTipo =
            filtroTipo ===
              "Todos" ||
            tarea.tipo ===
              filtroTipo;

          return (
            coincideEstado &&
            coincideAgente &&
            coincideTipo
          );
        }
      );
    }, [
      tareas,
      filtroEstado,
      filtroAgente,
      filtroTipo,
    ]);

  const resumen =
    useMemo(() => {
      const pendientes =
        tareas.filter(
          (tarea) =>
            normalizarEstado(
              tarea.estado
            ) === "Pendiente"
        );

      return {
        pendientes:
          pendientes.length,

        altas:
          pendientes.filter(
            (tarea) =>
              normalizarPrioridad(
                tarea.prioridad
              ) === "Alta"
          ).length,

        medias:
          pendientes.filter(
            (tarea) =>
              normalizarPrioridad(
                tarea.prioridad
              ) === "Media"
          ).length,

        bajas:
          pendientes.filter(
            (tarea) =>
              normalizarPrioridad(
                tarea.prioridad
              ) === "Baja"
          ).length,
      };
    }, [tareas]);

  const agentes =
    useMemo(() => {
      return [
        "Todos",

        ...Array.from(
          new Set(
            tareas
              .map(
                (tarea) =>
                  tarea.agente
              )
              .filter(
                (
                  agente
                ): agente is string =>
                  Boolean(agente)
              )
          )
        ),
      ];
    }, [tareas]);

  const tipos =
    useMemo(() => {
      return [
        "Todos",

        ...Array.from(
          new Set(
            tareas
              .map(
                (tarea) =>
                  tarea.tipo
              )
              .filter(
                (
                  tipo
                ): tipo is string =>
                  Boolean(tipo)
              )
          )
        ),
      ];
    }, [tareas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bandeja IA
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Acciones comerciales generadas por los agentes de SalesIA.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarTareas}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResumenCard
          titulo="Pendientes"
          valor={
            resumen.pendientes
          }
        />

        <ResumenCard
          titulo="Prioridad alta"
          valor={resumen.altas}
        />

        <ResumenCard
          titulo="Prioridad media"
          valor={resumen.medias}
        />

        <ResumenCard
          titulo="Prioridad baja"
          valor={resumen.bajas}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <FiltroSelect
            label="Estado"
            value={filtroEstado}
            options={[
              "Todas",
              "Pendiente",
              "Realizada",
              "Pospuesta",
            ]}
            onChange={(value) =>
              setFiltroEstado(
                value as FiltroEstado
              )
            }
          />

          <FiltroSelect
            label="Agente"
            value={filtroAgente}
            options={agentes}
            onChange={
              setFiltroAgente
            }
          />

          <FiltroSelect
            label="Canal"
            value={filtroTipo}
            options={tipos}
            onChange={
              setFiltroTipo
            }
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="font-medium text-blue-900">
            Cargando tareas de los agentes...
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        tareasFiltradas.length ===
          0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-medium text-slate-700">
              No hay tareas para los filtros seleccionados.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ejecutá el Orquestador IA para generar nuevas acciones.
            </p>
            </div>
          )}

        {!loading &&
          tareasFiltradas.length >
            0 && (
              <div className="space-y-4">
  {tareasFiltradas.map(
    (tarea) => (
      <TareaCard
        key={tarea.id}
        tarea={tarea}
        onCompletar={marcarTareaRealizada}
        onPosponer={posponerTarea}
      />
    )
  )}
</div>
          )}
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
        <p className="text-sm text-slate-500">
          {titulo}
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {valor}
        </p>
      </div>
    );
  }

  function FiltroSelect({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (
      value: string
    ) => void;
  }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {formatearTexto(
                option
              )}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function TareaCard({
  tarea,
  onCompletar,
  onPosponer,
}: {
  tarea: TareaIA;
  onCompletar: (
    tareaId: number
  ) => Promise<void>;
  onPosponer: (
    tareaId: number
  ) => Promise<void>;
}) {
  const payload =
    tarea.payload || {};

  const nombreCliente =
    obtenerNombreCliente(
      payload.cliente
    );

  const prioridad =
    normalizarPrioridad(
      tarea.prioridad
    );

  const telefono =
    limpiarTelefono(
      payload.telefono
    );

  const mensajeWhatsApp =
    obtenerTexto(
      payload.mensaje_whatsapp
    ) ||
    obtenerTexto(
      payload.mensaje
    );

  const asuntoEmail =
    obtenerTexto(
      payload.asunto_email
    );

  const cuerpoEmail =
    obtenerTexto(
      payload.cuerpo_email
    );

  const guionLlamada =
    obtenerTexto(
      payload.guion_llamada
    );

  const canal =
    obtenerTexto(
      tarea.tipo
    ) ||
    obtenerTexto(
      payload.canal_recomendado
    ) ||
    "seguimiento";

  const whatsappUrl =
    telefono
      ? `https://wa.me/${telefono}?text=${encodeURIComponent(
          mensajeWhatsApp
        )}`
      : "";

  const rutaCliente =
    tarea.ruta ||
    (tarea.cliente_id
      ? `/clientes?cliente=${tarea.cliente_id}`
      : "/clientes");

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerClasePrioridad(
                prioridad
              )}`}
            >
              {prioridad}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {obtenerTexto(
                tarea.agente
              ) || "Agente IA"}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {formatearTexto(
                canal
              )}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            {obtenerTexto(
              tarea.titulo
            ) ||
              nombreCliente ||
              "Tarea comercial"}
          </h2>

          {nombreCliente && (
            <p className="mt-1 text-sm text-slate-500">
              Cliente:{" "}
              <span className="font-medium text-slate-700">
                {nombreCliente}
              </span>
            </p>
          )}
        </div>

        <div className="text-right text-xs text-slate-400">
          <p>
            {formatearFecha(
              tarea.created_at
            )}
          </p>

          <p className="mt-1">
            Estado:{" "}
            {normalizarEstado(
              tarea.estado
            )}
          </p>
        </div>
      </div>

      {obtenerTexto(
        tarea.descripcion
      ) && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Acción recomendada
          </p>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
            {obtenerTexto(
              tarea.descripcion
            )}
          </p>
        </div>
      )}

      {mensajeWhatsApp && (
        <BloqueContenido
          titulo="Mensaje de WhatsApp"
          contenido={
            mensajeWhatsApp
          }
        />
      )}

      {asuntoEmail && (
        <BloqueContenido
          titulo="Asunto del email"
          contenido={
            asuntoEmail
          }
        />
      )}

      {cuerpoEmail && (
        <BloqueContenido
          titulo="Email preparado"
          contenido={
            cuerpoEmail
          }
        />
      )}

      {guionLlamada && (
        <BloqueContenido
          titulo="Guion de llamada"
          contenido={
            guionLlamada
          }
        />
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={rutaCliente}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Abrir cliente
        </Link>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Abrir WhatsApp
          </a>
        )}

        {payload.email && (
          <a
            href={`mailto:${payload.email}?subject=${encodeURIComponent(
              asuntoEmail
            )}&body=${encodeURIComponent(
              cuerpoEmail
            )}`}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            Abrir email
          </a>
        )}
        {normalizarEstado(tarea.estado) !== "Realizada" && (
  <>
    <button
      type="button"
      onClick={() => onCompletar(tarea.id)}
      className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
    >
      Marcar realizada
    </button>

    {normalizarEstado(tarea.estado) === "Pendiente" && (
      <button
        type="button"
        onClick={() => onPosponer(tarea.id)}
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
      >
        Posponer
      </button>
    )}
  </>
)}
      </div>
    </article>
  );
}

function BloqueContenido({
  titulo,
  contenido,
}: {
  titulo: string;
  contenido: string;
}) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {titulo}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
        {contenido}
      </p>
    </div>
  );
}

function obtenerNombreCliente(
  cliente:
    | PayloadTarea["cliente"]
    | undefined
) {
  if (!cliente) {
    return "";
  }

  if (
    typeof cliente === "string"
  ) {
    return cliente;
  }

  if (
    typeof cliente === "object"
  ) {
    return (
      obtenerTexto(
        cliente.empresa
      ) ||
      obtenerTexto(
        cliente.nombre
      ) ||
      (cliente.id
        ? `Cliente ${cliente.id}`
        : "Cliente")
    );
  }

  return "";
}

function obtenerTexto(
  valor: unknown
) {
  if (
    typeof valor === "string"
  ) {
    return valor;
  }

  if (
    typeof valor === "number"
  ) {
    return String(valor);
  }

  return "";
}

function normalizarPrioridad(
  prioridad?: string | null
) {
  const valor =
    String(prioridad || "")
      .trim()
      .toLowerCase();

  if (valor === "alta") {
    return "Alta";
  }

  if (valor === "baja") {
    return "Baja";
  }

  return "Media";
}

function normalizarEstado(
  estado?: string | null
) {
  const valor =
    String(estado || "")
      .trim()
      .toLowerCase();

  if (
    valor === "realizada" ||
    valor === "completada"
  ) {
    return "Realizada";
  }

  if (
    valor === "pospuesta"
  ) {
    return "Pospuesta";
  }

  return "Pendiente";
}

function obtenerClasePrioridad(
  prioridad: string
) {
  if (
    prioridad === "Alta"
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    prioridad === "Baja"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-amber-100 text-amber-700";
}

function limpiarTelefono(
  telefono?: string | null
) {
  if (!telefono) {
    return "";
  }

  let limpio =
    telefono.replace(
      /\D/g,
      ""
    );

  if (
    limpio.startsWith("0")
  ) {
    limpio =
      limpio.substring(1);
  }

  if (
    limpio.startsWith("15")
  ) {
    limpio =
      limpio.substring(2);
  }

  if (
    limpio.length === 10
  ) {
    limpio =
      `549${limpio}`;
  }

  return limpio;
}

function formatearFecha(
  fecha?: string | null
) {
  if (!fecha) {
    return "Sin fecha";
  }

  const valor =
    new Date(fecha);

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return "Sin fecha";
  }

  return valor.toLocaleString(
    "es-AR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
}

function formatearTexto(
  texto: string
) {
  if (!texto) {
    return "";
  }

  return (
    texto
      .charAt(0)
      .toUpperCase() +
    texto.slice(1)
  );
}