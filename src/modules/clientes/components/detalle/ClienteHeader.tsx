import type { Cliente } from "../../types";

interface Props {
  cliente: Cliente;
}

export default function ClienteHeader({ cliente }: Props) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
        {cliente.nombre?.charAt(0).toUpperCase() || "C"}
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {cliente.nombre}
        </h2>

        <p className="text-sm text-slate-500">
          {cliente.empresa || "Sin empresa registrada"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {cliente.estado && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {cliente.estado}
            </span>
          )}

          {cliente.interes && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {cliente.interes}
            </span>
          )}

          {cliente.origen && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {cliente.origen}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}