import { useState } from "react";

type Props = {
  onBuscar: (params: {
    rubro: string;
    ciudad: string;
    cantidad: number;
  }) => void;
};

export default function BusquedaForm({ onBuscar }: Props) {
  const [rubro, setRubro] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [cantidad, setCantidad] = useState(20);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onBuscar({
      rubro,
      ciudad,
      cantidad,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
    >
      <h2 className="text-xl font-bold">
        🤖 Agente Prospectador
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Rubro
        </label>

        <input
          value={rubro}
          onChange={(e) => setRubro(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Ej: Corralones"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Ciudad
        </label>

        <input
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Ej: Córdoba"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Cantidad
        </label>

        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full rounded-lg border p-2"
        />
      </div>

      <button
        className="w-full rounded-lg bg-slate-900 py-3 text-white"
      >
        🔍 Buscar Empresas
      </button>
    </form>
  );
}