import { useState } from "react";
import type { Cliente } from "../types";

import ClienteHeader from "./detalle/ClienteHeader";
import ClienteTabs from "./detalle/ClienteTabs";
import InformacionTab from "./detalle/InformacionTab";
import ConversacionesTab from "./detalle/ConversacionesTab";
import SeguimientosTab from "./detalle/SeguimientosTab";
import IATab from "./detalle/IATab";
import ClienteSidebar from "./detalle/ClienteSidebar";

import { crearActividadCliente } from "../services/actividades";

type Props = {
  cliente: Cliente;
};

export default function ClienteDetalle({ cliente }: Props) {
  const [tab, setTab] = useState("Información");

  const [mostrarNota, setMostrarNota] = useState(false);
  const [nota, setNota] = useState("");

  async function guardarNota() {
    if (!nota.trim()) {
      alert("Escribí una nota antes de guardar.");
      return;
    }

    if (!cliente.id) {
      alert("El cliente no tiene un ID válido.");
      return;
    }

    try {
      await crearActividadCliente({
        clienteId: cliente.id,
        tipo: "Nota",
        contenido: nota.trim(),
      });

      alert("Nota guardada correctamente.");

      setNota("");
      setMostrarNota(false);
    } catch (error) {
      console.error(
        "Error guardando nota:",
        error
      );

      alert(
        "No se pudo guardar la nota."
      );
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ClienteSidebar cliente={cliente} />

        <div className="space-y-6">
          <ClienteHeader
            cliente={cliente}
            onNuevaNota={() =>
              setMostrarNota(true)
            }
          />

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <ClienteTabs
              tab={tab}
              onChange={setTab}
            />

            {tab === "Información" && (
              <InformacionTab
                cliente={cliente}
              />
            )}

            {tab === "Conversaciones" && (
              <ConversacionesTab
                cliente={cliente}
              />
            )}

            {tab === "Seguimientos" && (
              <SeguimientosTab
                cliente={cliente}
              />
            )}

            {tab === "IA" && (
              <IATab
                cliente={cliente}
              />
            )}
          </div>
        </div>
      </div>

      {mostrarNota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Nueva nota
                </h3>

                <p className="text-sm text-slate-500">
                  {cliente.empresa ||
                    cliente.nombre}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMostrarNota(false)
                }
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <textarea
              value={nota}
              onChange={(e) =>
                setNota(e.target.value)
              }
              placeholder="Escribí la nota sobre este cliente..."
              rows={6}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setMostrarNota(false)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarNota}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}