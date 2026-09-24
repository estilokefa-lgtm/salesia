import type { ResultadoProspeccion } from "../types";

type Props = {
  resultados: ResultadoProspeccion[];

  onImportar: (
    cliente: ResultadoProspeccion
  ) => void;

  onToggleSeleccion: (
    empresa: string
  ) => void;

  onEnriquecer: (
    cliente: ResultadoProspeccion
  ) => void;

  enriqueciendo: string | null;
};

function getScoreClasses(score?: number) {
  const valor = score ?? 0;

  if (valor >= 90) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (valor >= 80) {
    return "bg-blue-100 text-blue-700";
  }

  if (valor >= 70) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
}

export default function ResultadosTable({
  resultados,
  onImportar,
  onToggleSeleccion,
  onEnriquecer,
  enriqueciendo,
}: Props) {
  if (resultados.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Empresas encontradas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Resultados analizados y priorizados por el Agente Prospectador.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="w-10 py-3"></th>

              <th className="py-3 pr-4">
                Empresa
              </th>

              <th className="py-3 pr-4">
                Ciudad
              </th>

              <th className="py-3 pr-4">
                Teléfono
              </th>

              <th className="py-3 pr-4">
                Email
              </th>

              <th className="py-3 pr-4">
                Web
              </th>

              <th className="py-3 pr-4">
                Score
              </th>

              <th className="py-3 pr-4">
                Clasificación
              </th>

              <th className="py-3 pr-4">
                Recomendación
              </th>

              <th className="py-3 text-right">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {resultados.map(
              (cliente, index) => {
                const clave =
                  `${cliente.empresa}-${cliente.telefono}-${index}`;

                const estaEnriqueciendo =
                  enriqueciendo ===
                  cliente.empresa;

                return (
                  <tr
                    key={clave}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={
                          cliente.seleccionado ||
                          false
                        }
                        onChange={() =>
                          onToggleSeleccion(
                            cliente.empresa
                          )
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>

                    <td className="py-4 pr-4">
                      <div className="font-semibold text-slate-900">
                        {cliente.empresa ||
                          "-"}
                      </div>

                      <div className="mt-1 max-w-[260px] truncate text-xs text-slate-500">
                        {cliente.observaciones ||
                          "Sin dirección"}
                      </div>

                      {cliente.enriquecido && (
                        <div className="mt-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                            Contacto enriquecido
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 pr-4 text-slate-600">
                      {cliente.ciudad ||
                        "-"}
                    </td>

                    <td className="py-4 pr-4 text-slate-600">
                      {cliente.telefono ||
                        "-"}
                    </td>

                    <td className="py-4 pr-4">
                      {cliente.email ? (
                        <a
                          href={`mailto:${cliente.email}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {cliente.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          Sin email
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      {cliente.web ? (
                        <a
                          href={cliente.web}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Ver sitio
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          Sin web
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getScoreClasses(
                          cliente.score
                        )}`}
                      >
                        {cliente.score ??
                          0}
                        /100
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      <span className="font-medium text-slate-700">
                        {cliente.clasificacion ||
                          "-"}
                      </span>
                    </td>

                    <td className="max-w-[240px] py-4 pr-4 text-slate-600">
                      {cliente.recomendacion ||
                        "-"}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEnriquecer(
                              cliente
                            )
                          }
                          disabled={
                            !cliente.web ||
                            estaEnriqueciendo
                          }
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {estaEnriqueciendo
                            ? "Buscando..."
                            : cliente.enriquecido
                            ? "Actualizar"
                            : "Enriquecer"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onImportar(
                              cliente
                            )
                          }
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                        >
                          Importar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}