import { useState } from "react";

import type { Cliente } from "../clientes/types";

import {
  createCliente,
  existeClienteDuplicado,
} from "../clientes/services/clientes";

import BusquedaForm from "./components/BusquedaForm";
import ResultadosTable from "./components/ResultadosTable";

import { buscarEmpresas } from "./services/prospeccionApi";

export default function ProspeccionPage() {
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [importando, setImportando] = useState(false);

  async function buscar(params: {
    rubro: string;
    ciudad: string;
    cantidad: number;
  }) {
    try {
      setLoading(true);
      setResultados([]);

      const empresas = await buscarEmpresas(params);

      setResultados(
        empresas.map((empresa) => ({
          ...empresa,
          seleccionado: false,
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Error buscando empresas.");
    } finally {
      setLoading(false);
    }
  }

  async function importar(cliente: Cliente) {
    try {
      const existe = await existeClienteDuplicado(cliente);

      if (existe) {
        alert("⚠️ Este cliente ya existe en el CRM.");
        return;
      }

      await createCliente(cliente);

      alert("✅ Lead importado correctamente.");

      setResultados((prev) =>
        prev.filter(
          (item) =>
            !(
              item.empresa === cliente.empresa &&
              item.telefono === cliente.telefono
            )
        )
      );
    } catch (error) {
      console.error(error);
      alert("Error importando el lead.");
    }
  }

  function toggleSeleccion(empresa: string) {
    setResultados((prev) =>
      prev.map((cliente) =>
        cliente.empresa === empresa
          ? {
              ...cliente,
              seleccionado: !cliente.seleccionado,
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

  async function importarSeleccionados() {
    const seleccionados = resultados.filter(
      (cliente) => cliente.seleccionado
    );

    if (seleccionados.length === 0) {
      alert("Seleccioná al menos una empresa.");
      return;
    }

    try {
      setImportando(true);

      const importados: Cliente[] = [];
      let duplicados = 0;
      let errores = 0;

      for (const cliente of seleccionados) {
        try {
          const existe = await existeClienteDuplicado(cliente);

          if (existe) {
            duplicados += 1;
            continue;
          }

          await createCliente({
            ...cliente,
            seleccionado: undefined,
          });

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
                importado.empresa === cliente.empresa &&
                importado.telefono === cliente.telefono
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

  async function importarTodos() {
    if (resultados.length === 0) {
      alert("No hay empresas para importar.");
      return;
    }

    setResultados((prev) =>
      prev.map((cliente) => ({
        ...cliente,
        seleccionado: true,
      }))
    );

    const todos = resultados.map((cliente) => ({
      ...cliente,
      seleccionado: true,
    }));

    try {
      setImportando(true);

      const importados: Cliente[] = [];
      let duplicados = 0;
      let errores = 0;

      for (const cliente of todos) {
        try {
          const existe = await existeClienteDuplicado(cliente);

          if (existe) {
            duplicados += 1;
            continue;
          }

          await createCliente({
            ...cliente,
            seleccionado: undefined,
          });

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
                importado.empresa === cliente.empresa &&
                importado.telefono === cliente.telefono
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

  const cantidadSeleccionados = resultados.filter(
    (cliente) => cliente.seleccionado
  ).length;

  return (
    <div className="space-y-6">
      <BusquedaForm onBuscar={buscar} />

      {loading && (
        <div className="rounded-xl bg-blue-50 p-6 text-center">
          <p className="text-lg font-semibold">
            🤖 Buscando empresas...
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Consultando Google Places...
          </p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={seleccionarTodos}
            disabled={importando}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Seleccionar todo
          </button>

          <button
            type="button"
            onClick={deseleccionarTodos}
            disabled={importando}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar selección
          </button>

          <button
            type="button"
            onClick={importarSeleccionados}
            disabled={importando || cantidadSeleccionados === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importando
              ? "Importando..."
              : `Importar seleccionados (${cantidadSeleccionados})`}
          </button>

          <button
            type="button"
            onClick={importarTodos}
            disabled={importando || resultados.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Importar todos
          </button>

          <span className="ml-auto text-sm text-slate-500">
            {resultados.length} empresas encontradas
          </span>
        </div>
      )}

      <ResultadosTable
        resultados={resultados}
        onImportar={importar}
        onToggleSeleccion={toggleSeleccion}
      />
    </div>
  );
}