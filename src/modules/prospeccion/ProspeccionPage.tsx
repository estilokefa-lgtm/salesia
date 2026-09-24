import { useState } from "react";


import type { ResultadoProspeccion } from "./types";

import {
  createCliente,
  existeClienteDuplicado,
} from "../clientes/services/clientes";

import BusquedaForm from "./components/BusquedaForm";
import ResultadosTable from "./components/ResultadosTable";

import {
  buscarEmpresas,
  enriquecerContacto,
} from "./services/prospeccionApi";

export default function ProspeccionPage() {
  const [resultados, setResultados] =
    useState<ResultadoProspeccion[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [importando, setImportando] =
    useState(false);

  const [enriqueciendo, setEnriqueciendo] =
    useState<string | null>(null);

  // =========================
  // BUSCAR EMPRESAS
  // =========================

  async function buscar(params: {
    rubro: string;
    ciudad: string;
    cantidad: number;
  }) {
    try {
      setLoading(true);
      setResultados([]);

      const empresas =
        await buscarEmpresas(params);

      setResultados(
        empresas.map(
          (empresa: ResultadoProspeccion) => ({
            ...empresa,
            seleccionado: false,
          })
        )
      );
    } catch (error) {
      console.error(
        "Error buscando empresas:",
        error
      );

      alert(
        "Error buscando empresas."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // IMPORTAR UNA EMPRESA
  // =========================

  async function importar(
    cliente: ResultadoProspeccion
  ) {
    try {
      const existe =
        await existeClienteDuplicado(
          cliente
        );

      if (existe) {
        alert(
          "⚠️ Este cliente ya existe en el CRM."
        );

        return;
      }

      await createCliente(cliente);

      alert(
        "✅ Lead importado correctamente."
      );

      setResultados((prev) =>
        prev.filter(
          (item) =>
            !(
              item.empresa ===
                cliente.empresa &&
              item.telefono ===
                cliente.telefono
            )
        )
      );
    } catch (error) {
      console.error(
        "Error importando lead:",
        error
      );

      alert(
        "Error importando el lead."
      );
    }
  }

  // =========================
  // SELECCIONAR / DESELECCIONAR
  // =========================

  function toggleSeleccion(
    empresa: string
  ) {
    setResultados((prev) =>
      prev.map((cliente) =>
        cliente.empresa === empresa
          ? {
              ...cliente,
              seleccionado:
                !cliente.seleccionado,
            }
          : cliente
      )
    );
  }

  function seleccionarTodos() {
    setResultados((prev) =>
      prev.map((cliente) => ({
        ...cliente,
        seleccionado: true,
      }))
    );
  }

  function deseleccionarTodos() {
    setResultados((prev) =>
      prev.map((cliente) => ({
        ...cliente,
        seleccionado: false,
      }))
    );
  }

  // =========================
  // IMPORTAR SELECCIONADOS
  // =========================

  async function importarSeleccionados() {
    const seleccionados =
      resultados.filter(
        (cliente) =>
          cliente.seleccionado
      );

    if (
      seleccionados.length === 0
    ) {
      alert(
        "Seleccioná al menos una empresa."
      );

      return;
    }

    try {
      setImportando(true);

      const importados:
        ResultadoProspeccion[] = [];

      let duplicados = 0;
      let errores = 0;

      for (
        const cliente of seleccionados
      ) {
        try {
          const existe =
            await existeClienteDuplicado(
              cliente
            );

          if (existe) {
            duplicados += 1;
            continue;
          }

          await createCliente(cliente);

          importados.push(cliente);
        } catch (error) {
          console.error(
            `Error importando ${cliente.empresa}:`,
            error
          );

          errores += 1;
        }
      }

      setResultados((prev) =>
        prev.filter(
          (cliente) =>
            !importados.some(
              (importado) =>
                importado.empresa ===
                  cliente.empresa &&
                importado.telefono ===
                  cliente.telefono
            )
        )
      );

      alert(
        [
          `✅ Importados: ${importados.length}`,
          `⚠️ Duplicados: ${duplicados}`,
          `❌ Errores: ${errores}`,
        ].join("\n")
      );
    } finally {
      setImportando(false);
    }
  }

  // =========================
  // IMPORTAR TODOS
  // =========================

  async function importarTodos() {
    if (
      resultados.length === 0
    ) {
      alert(
        "No hay empresas para importar."
      );

      return;
    }

    try {
      setImportando(true);

      const importados:
        ResultadoProspeccion[] = [];

      let duplicados = 0;
      let errores = 0;

      for (
        const cliente of resultados
      ) {
        try {
          const existe =
            await existeClienteDuplicado(
              cliente
            );

          if (existe) {
            duplicados += 1;
            continue;
          }

          await createCliente(cliente);

          importados.push(cliente);
        } catch (error) {
          console.error(
            `Error importando ${cliente.empresa}:`,
            error
          );

          errores += 1;
        }
      }

      setResultados((prev) =>
        prev.filter(
          (cliente) =>
            !importados.some(
              (importado) =>
                importado.empresa ===
                  cliente.empresa &&
                importado.telefono ===
                  cliente.telefono
            )
        )
      );

      alert(
        [
          `✅ Importados: ${importados.length}`,
          `⚠️ Duplicados: ${duplicados}`,
          `❌ Errores: ${errores}`,
        ].join("\n")
      );
    } finally {
      setImportando(false);
    }
  }

  // =========================
  // ENRIQUECER CONTACTO
  // =========================

  async function enriquecer(
    cliente: ResultadoProspeccion
  ) {
    if (!cliente.web) {
      alert(
        "Esta empresa no tiene página web disponible."
      );

      return;
    }

    try {
      setEnriqueciendo(
        cliente.empresa
      );

      const datos =
        await enriquecerContacto(
          cliente.web
        );

      setResultados((prev) =>
        prev.map((item) => {
          if (
            item.empresa !==
            cliente.empresa
          ) {
            return item;
          }

          return {
            ...item,

            telefono:
              datos.telefono ||
              item.telefono,

            email:
              datos.email ||
              item.email,

            whatsapp:
              datos.whatsapp ||
              "",

            emails:
              datos.emails ||
              item.emails ||
              [],

            telefonos:
              datos.telefonos ||
              item.telefonos ||
              [],

            whatsapp_encontrados:
              datos.whatsapp_encontrados ||
              item.whatsapp_encontrados ||
              [],

            redes:
              datos.redes ||
              {},

            enriquecido: true,
          };
        })
      );
    } catch (error) {
      console.error(
        "Error enriqueciendo contacto:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo enriquecer el contacto."
      );
    } finally {
      setEnriqueciendo(null);
    }
  }

  // =========================
  // EXPORTAR CSV
  // =========================

  function exportarProspectosCSV(
    soloSeleccionados = false
  ) {
    const prospectos =
      soloSeleccionados
        ? resultados.filter(
            (cliente) =>
              cliente.seleccionado
          )
        : resultados;

    if (
      prospectos.length === 0
    ) {
      alert(
        soloSeleccionados
          ? "No hay prospectos seleccionados para exportar."
          : "No hay prospectos para exportar."
      );

      return;
    }

    const encabezados = [
      "Empresa",
      "Contacto",
      "Email",
      "Emails encontrados",
      "Telefono",
      "Telefonos encontrados",
      "WhatsApp",
      "WhatsApp encontrados",
      "Ciudad",
      "Provincia",
      "Pais",
      "Web",
      "Score",
      "Clasificacion",
      "Recomendacion",
      "Instagram",
      "Facebook",
      "LinkedIn",
      "Origen",
      "Observaciones",
    ];

    function escaparCSV(
      valor: unknown
    ) {
      if (
        valor === null ||
        valor === undefined
      ) {
        return '""';
      }

      const texto = String(valor)
        .replace(/"/g, '""')
        .replace(/\r?\n/g, " ");

      return `"${texto}"`;
    }

    const filas =
      prospectos.map(
        (prospecto) => [
          prospecto.empresa || "",
          prospecto.nombre || "",
          prospecto.email || "",

          prospecto.emails
            ?.join(" | ") || "",

          prospecto.telefono || "",

          prospecto.telefonos
            ?.join(" | ") || "",

          prospecto.whatsapp || "",

          prospecto
            .whatsapp_encontrados
            ?.join(" | ") || "",

          prospecto.ciudad || "",
          prospecto.provincia || "",
          prospecto.pais || "",
          prospecto.web || "",

          prospecto.score ?? "",

          prospecto.clasificacion ||
            "",

          prospecto.recomendacion ||
            "",

          prospecto.redes?.instagram
            ?.join(" | ") || "",

          prospecto.redes?.facebook
            ?.join(" | ") || "",

          prospecto.redes?.linkedin
            ?.join(" | ") || "",

          prospecto.origen || "",

          prospecto.observaciones ||
            "",
        ]
      );

    const contenido = [
      encabezados
        .map(escaparCSV)
        .join(";"),

      ...filas.map((fila) =>
        fila
          .map(escaparCSV)
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(
      [
        "\uFEFF" +
          contenido,
      ],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const fecha =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      soloSeleccionados
        ? `prospectos-seleccionados-salesia-${fecha}.csv`
        : `prospectos-salesia-${fecha}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  }

  // =========================
  // CANTIDAD SELECCIONADA
  // =========================

  const cantidadSeleccionados =
    resultados.filter(
      (cliente) =>
        cliente.seleccionado
    ).length;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="space-y-6">
      <BusquedaForm
        onBuscar={buscar}
      />

      {loading && (
        <div className="rounded-xl bg-blue-50 p-6 text-center">
          <p className="text-lg font-semibold">
            🤖 Buscando empresas...
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Consultando Google
            Places...
          </p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

          <button
            type="button"
            onClick={
              seleccionarTodos
            }
            disabled={importando}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Seleccionar todo
          </button>

          <button
            type="button"
            onClick={
              deseleccionarTodos
            }
            disabled={importando}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar selección
          </button>

          <button
            type="button"
            onClick={
              importarSeleccionados
            }
            disabled={
              importando ||
              cantidadSeleccionados ===
                0
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importando
              ? "Importando..."
              : `Importar seleccionados (${cantidadSeleccionados})`}
          </button>

          <button
            type="button"
            onClick={
              importarTodos
            }
            disabled={
              importando ||
              resultados.length === 0
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Importar todos
          </button>

          <button
            type="button"
            onClick={() =>
              exportarProspectosCSV(
                false
              )
            }
            disabled={
              resultados.length === 0
            }
            className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar todos CSV
          </button>

          <button
            type="button"
            onClick={() =>
              exportarProspectosCSV(
                true
              )
            }
            disabled={
              cantidadSeleccionados ===
              0
            }
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar seleccionados
            ({cantidadSeleccionados})
          </button>

          <span className="ml-auto text-sm text-slate-500">
            {resultados.length}{" "}
            empresas encontradas
          </span>
        </div>
      )}

      <ResultadosTable
        resultados={resultados}
        onImportar={importar}
        onToggleSeleccion={
          toggleSeleccion
        }
        onEnriquecer={
          enriquecer
        }
        enriqueciendo={
          enriqueciendo
        }
      />
    </div>
  );
}