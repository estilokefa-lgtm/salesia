import type { Cliente } from "../../types";

type Props = {
  cliente: Cliente;
};

export default function ClienteSidebar({ cliente }: Props) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
          {cliente.nombre?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          {cliente.nombre}
        </h3>

        <p className="text-sm text-slate-500">
          {cliente.empresa || "Sin empresa"}
        </p>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <Info label="Email" value={cliente.email} />
        <Info label="Teléfono" value={cliente.telefono} />
        <Info label="Ciudad" value={cliente.ciudad} />

        <div className="border-t border-slate-200 pt-4">
          <Info label="Estado" value={cliente.estado} />
          <Info label="Interés" value={cliente.interes} />
          <Info label="Origen" value={cliente.origen} />
          <Info label="Pipeline" value={cliente.pipeline} />
          <Info label="Responsable" value={cliente.responsable} />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <Info
            label="Valor estimado"
            value={
              cliente.valor_estimado
                ? `$ ${cliente.valor_estimado.toLocaleString()}`
                : "-"
            }
          />

          <Info
            label="Última actividad"
            value={cliente.ultima_actividad || "-"}
          />

          <Info
            label="Próximo contacto"
            value={
              cliente.proximo_contacto
                ? new Date(cliente.proximo_contacto).toLocaleDateString()
                : "-"
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          WhatsApp
        </button>

        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Email
        </button>

        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Llamar
        </button>

        <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Nueva nota
        </button>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
}